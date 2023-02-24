require("@nomiclabs/hardhat-waffle")
require("@nomiclabs/hardhat-etherscan")
require("hardhat-deploy")
require("solidity-coverage")
require("hardhat-gas-reporter")
require("hardhat-contract-sizer")
require("dotenv").config()

const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL || "https://eth-goerli"
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0xkey"
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "key"
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || "key"
const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL || "mainnet"

module.exports = {
	solidity: {
		compilers: [{ version: "0.8.17" }],
	},
	defaultNetwork: "hardhat",
	networks: {
		hardhat: {
			chainId: 31337,
			blockConfirmations: 1,
			forking: {
				url: MAINNET_RPC_URL,
			},
		},
		goerli: {
			chainId: 5,
			blockConfirmations: 6,
			url: GOERLI_RPC_URL,
			accounts: [PRIVATE_KEY],
		},
	},
	etherscan: {
		apiKey: {
			goerli: ETHERSCAN_API_KEY,
		},
		customChains: [
			{
				network: "goerli",
				chainId: 5,
				urls: {
					apiURL: "https://api-goerli.etherscan.io/api",
					browserURL: "https://goerli.etherscan.io",
				},
			},
		],
	},
	gasReporter: {
		enabled: false,
		outputFile: "gas-report.txt",
		noColors: true,
		currency: "USD",
		coinmarketcap: COINMARKETCAP_API_KEY,
		//token: "MATIC",
	},
	namedAccounts: {
		deployer: {
			default: 0,
		},
		players: {
			default: 1,
		},
	},
	mocha: {
		timeout: 500000,
	},
}
