const { ethers } = require("hardhat");
require("dotenv").config({ path: ".env" });
const { WHITELIST_CONTRACT_ADDRESS, METADATA_URL } = require("../constants");

async function main() {
  // address of the whitelist contract u deployed in the prev lesson:
  const whitelistContract = WHITELIST_CONTRACT_ADDRESS;
  // URL to extract metadata for our nft:
  const metadataUrl = METADATA_URL;

  // make an instance of our nft contract:
  const cryptoDevsContract = await ethers.getContractFactory("CryptoDevs");
  // deploy our contract:
  const deployedCryptoDevsContract = await cryptoDevsContract.deploy(
    metadataUrl,
    whitelistContract
  );

  // wait to finish deploying:
  await deployedCryptoDevsContract.deployed();

  // print thr address of deployed contract:
  console.log(
    "Crypto Devs Contract Address: ",
    deployedCryptoDevsContract.address
  );
}

// call the main fxn:
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
