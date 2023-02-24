// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

error RandomIpfsNft__RangeOutOfBounds();
error RandomIpfsNft__NeedMoreETHSent();
error RandomIpfsNft__TransfertFailed();

contract RandomIpfsNft is VRFConsumerBaseV2, ERC721URIStorage, Ownable {
	enum Breed {
		PUG,
		SHIBA_INU,
		ST_BERNARD
	}

	VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
	uint64 private immutable i_subscriptionId;
	bytes32 private immutable i_gasLane;
	uint32 private immutable i_callbackGasLimit;
	uint16 private constant REQUEST_CONFIRMATIONS = 3;
	uint32 private constant NUM_WORDS = 1;

	mapping(uint256 => address) s_requestIdToSender;

	uint256 public s_tokenCounter;
	uint256 internal constant MAX_CHANCE_VALUE = 100;
	string[] internal s_dogTokenUris;
	uint256 internal immutable i_mintFee;

	// event NftRequested(uint256 indexed requestId, address indexed sender);
	event NftRequested(uint256 indexed requestId, address requester);
	event NftMinted(Breed dogBreed, address minter);

	constructor(
		address vrfCoordinatorV2,
		uint64 subscriptionId,
		bytes32 gasLane, // keyHash
		uint256 mintFee,
		uint32 callbackGasLimit,
		string[3] memory dogTokenUris
	) VRFConsumerBaseV2(vrfCoordinatorV2) ERC721("Random IPFS NFT", "RIN") {
		i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
		i_gasLane = gasLane;
		i_subscriptionId = subscriptionId;
		i_mintFee = mintFee;
		i_callbackGasLimit = callbackGasLimit;
		// _initializeContract(dogTokenUris);
		s_dogTokenUris = dogTokenUris;
		s_tokenCounter = 0;
	}

	function requestNft() public payable returns (uint256 requestId) {
		if (msg.value < i_mintFee) {
			revert RandomIpfsNft__NeedMoreETHSent();
		} //, "Not enough ETH sent to cover mint fee");
		// s_tokenCounter++;
		requestId = i_vrfCoordinator.requestRandomWords(
			i_gasLane,
			i_subscriptionId,
			REQUEST_CONFIRMATIONS,
			i_callbackGasLimit,
			NUM_WORDS
		);
		s_requestIdToSender[requestId] = msg.sender;
		emit NftRequested(requestId, msg.sender);
	}

	function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
		address dogOwner = s_requestIdToSender[requestId];
		uint256 tokenId = s_tokenCounter;
		uint256 moddedRnf = randomWords[0] % MAX_CHANCE_VALUE;
		Breed dogBreed = getBreedFromModdedRng(moddedRnf);
		_safeMint(dogOwner, tokenId);
		_setTokenURI(tokenId, s_dogTokenUris[uint256(dogBreed)]);
		emit NftMinted(dogBreed, dogOwner);
	}

	function withdraw() public onlyOwner {
		uint256 amount = address(this).balance;
		(bool success, ) = payable(msg.sender).call{value: amount}("");
		if (!success) {
			revert RandomIpfsNft__TransfertFailed();
		}
	}

	function getBreedFromModdedRng(uint256 moddedRng) public pure returns (Breed) {
		uint256[3] memory chanceArray = getChanceArray();
		if (moddedRng < chanceArray[0]) {
			return Breed.PUG;
		} else if (moddedRng < chanceArray[1]) {
			return Breed.SHIBA_INU;
		} else {
			return Breed.ST_BERNARD;
		}

		// revert RandomIpfsNft__RangeOutOfBounds();
	}

	function getChanceArray() public pure returns (uint256[3] memory) {
		return [10, 30, MAX_CHANCE_VALUE];
	}

	// function tokenURI(uint256) public view override returns (string memory) {}

	function getMintFee() public view returns (uint256) {
		return i_mintFee;
	}

	function getDogTokenUris(uint256 index) public view returns (string memory) {
		return s_dogTokenUris[index];
	}

	function getTokenCounter() public view returns (uint256) {
		return s_tokenCounter;
	}
}
