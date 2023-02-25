const { network, ethers } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { storeImages, storeTokenUriMetadata } = require("../utils/uploadToPinata")
const { verify } = require("../utils/verify")
require("dotenv").config()

const imagesLocation = "./images/randomNft"

const metadataTemplate = {
	name: "",
	description: "",
	image: "",
	attributes: [
		{
			trait_type: "Cuteness",
			value: 100,
		},
	],
}

let tokenUris = [
	"ipfs://QmX4CA5PkkjoXnpGGvXP9FKZBRDzQUjKE78MnW8kjKGcUr",
	"ipfs://QmW7YxXmpacPmW8JE7WqQE8KmDaGohidyNhMFwCQAnymkT",
	"ipfs://QmRdCAVbzVJgCKH5cjjGWFZsPy77uYKRCNwQKMhMBXSc1F",
]

const FUND_AMOUNT = ethers.utils.parseEther("10")

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
	const { deploy, log } = deployments
	const { deployer } = await getNamedAccounts()
	// const chainId = network.config.chainId;
	const chainId = await getChainId()

	if (process.env.UPLOAD_TO_PINATA == "true") {
		tokenUris = await handleTokenUris()
	}

	let vrfCoordinatorV2Adress, subscriptionId

	if (developmentChains.includes(network.name)) {
		const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
		vrfCoordinatorV2Adress = vrfCoordinatorV2Mock.address
		const tx = await vrfCoordinatorV2Mock.createSubscription()
		const txReceipt = await tx.wait(1)
		subscriptionId = txReceipt.events[0].args.subId
		await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, FUND_AMOUNT)
	} else {
		vrfCoordinatorV2Adress = networkConfig[chainId].vrfCoordinatorV2
		subscriptionId = networkConfig[chainId].subscriptionId
	}

	log("----------------------------------------------------------------")

	const args = [
		vrfCoordinatorV2Adress,
		subscriptionId,
		networkConfig[chainId].gasLane,
		networkConfig[chainId].callbackGasLimit,
		tokenUris,
		networkConfig[chainId].mintFee,
	]

	const randomIpfsNFT = await deploy("RandomIpfsNft", {
		from: deployer,
		args: args,
		log: true,
		waitConfirmations: networkConfig.blockConfirmations || 1,
	})

	if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
		await verify(randomIpfsNFT.address, args)
	}
}

async function handleTokenUris() {
	tokenUris = []

	const { responses: imageUploadResponses, files } = await storeImages(imagesLocation)

	for (i in imageUploadResponses) {
		let tokenUriMetaData = { ...metadataTemplate }
		tokenUriMetaData.name = files[i].replace(".png", "")
		tokenUriMetaData.description = `A lovely ${tokenUriMetaData.name}`
		tokenUriMetaData.image = `ipfs://${imageUploadResponses[i].IpfsHash}`

		console.log(`Uploading metadata for ${tokenUriMetaData.name} to Pinata!`)
		const metadataUploadResponse = await storeTokenUriMetadata(tokenUriMetaData)

		tokenUris.push(`ipfs://${metadataUploadResponse.IpfsHash}`)
	}

	console.log("Token URIs uploaded, namely : ", tokenUris)
	return tokenUris
}

module.exports.tags = ["all", "randomipfs", "main"]
