const { ethers } = require("hardhat")

const networkConfig = {
	5: {
		name: "goerli",
		vrfCoordinator: "0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D",
		entranceFee: ethers.utils.parseEther("0.01"),
		gasLane: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
		subscriptionId: "7180",
		callbackGasLimit: "500000",
		mintFee: "10000000000000000", // 0.01 ETH
		interval: "30",
	},
	31337: {
		name: "hardhat",
		entranceFee: ethers.utils.parseEther("0.01"),
		gasLane: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
		callbackGasLimit: "500000",
		subscriptionId: "7180",
		mintFee: "10000000000000000", // 0.01 ETH
		interval: "30",
	},
}

const DECIMALS = "18"
const INITIAL_PRICE = "200000000000000000000"
const developmentChains = ["hardhat", "localhost"]

module.exports = {
	networkConfig,
	developmentChains,
	DECIMALS,
	INITIAL_PRICE,
}
