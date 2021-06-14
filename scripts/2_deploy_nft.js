const hre = require('hardhat');

async function main() {
  const TreatsNFT = await hre.ethers.getContractFactory('TreatsNFT');
  const treatsNFT = await TreatsNFT.deploy();

  await treatsNFT.deployed();

  console.log('TreatsNFT deployed to:', treatsNFT.address);

  const TREATS_ADDR = treatsNFT.address; // Treats NFT contract address

  const DogNFT = await hre.ethers.getContractFactory('DogNFT');
  const dogNFT = await DogNFT.deploy(TREATS_ADDR, 'DNFT', 'DNFT');

  await dogNFT.deployed();

  console.log('DogNFT deployed to:', dogNFT.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
