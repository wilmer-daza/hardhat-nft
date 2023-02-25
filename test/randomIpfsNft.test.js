const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
	? describe.skip
	: describe("Random IPFS NFT Unit Tests", function () {
			let randomIpfsNft, deployer, vrfCoordinatorV2Mock

			beforeEach(async () => {
				accounts = await ethers.getSigners()
				deployer = accounts[0]
				await deployments.fixture(["mocks", "randomipfs"])
				randomIpfsNft = await ethers.getContract("RandomIpfsNft")
				vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
			})

			describe("constructor", () => {
				it("sets starting values correctly", async function () {})
			})
	  })
