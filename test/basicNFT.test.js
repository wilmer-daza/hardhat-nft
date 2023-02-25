const { assert } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
	? describe.skip
	: describe("Basic NFT Unit Tests", function () {
			let BasicNFT, deployer

			beforeEach(async () => {
				accounts = await ethers.getSigners()
				deployer = accounts[0]
				await deployments.fixture(["all"])
				BasicNFT = await ethers.getContract("BasicNFT")
			})

			describe("Constructor", () => {
				it("Initializes the NFT Correctly.", async () => {
					const name = await BasicNFT.name()
					const symbol = await BasicNFT.symbol()
					const tokenCounter = await BasicNFT.getTokenCounter()
					assert.equal(name, "Dogie")
					assert.equal(symbol, "DOG")
					assert.equal(tokenCounter.toString(), "0")
				})
			})

			describe("Mint NFT", () => {
				beforeEach(async () => {
					const txResponse = await BasicNFT.mintNFT()
					await txResponse.wait(1)
				})
				it("Allows users to mint an NFT, and updates appropriately", async function () {
					const tokenURI = await BasicNFT.tokenURI(0)
					const tokenCounter = await BasicNFT.getTokenCounter()

					assert.equal(tokenCounter.toString(), "1")
					assert.equal(tokenURI, await BasicNFT.TOKEN_URI())
				})
				it("Show the correct balance and owner of an NFT", async function () {
					const deployerAddress = deployer.address
					const deployerBalance = await BasicNFT.balanceOf(deployerAddress)
					const owner = await BasicNFT.ownerOf("0")

					assert.equal(deployerBalance.toString(), "1")
					assert.equal(owner, deployerAddress)
				})
			})
	  })
