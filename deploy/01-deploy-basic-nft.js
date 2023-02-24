const { network, ethers } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
require("dotenv").config()

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
	const { deploy, log } = deployments
	const { deployer } = await getNamedAccounts()

	const args = []

	const basicNFT = await deploy("BasicNFT", {
		from: deployer,
		args: args,
		log: true,
		waitConfirmations: network.config.blockConfirmations || 1,
	})

	if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
		await verify(basicNFT.address, args)
	}

	log("----------------------------------------------------------------")
}

module.exports.tags = ["all", "basicNFT"]
