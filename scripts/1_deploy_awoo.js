const hre = require('hardhat');

async function main() {
  const CH_ADDR = '0xa78E03296352A1d8E7263E1f7ec47E9d6221c4c3'; // Charity Fee address
  const OP_ADDR = '0x4bd9dF7a920aF482194195BA1C93edf842582A1a'; // Operational Fee Addrerss
  const DOG_NFT_ADDR = '0x6168c3Ef1B301eDd51B21151747c1A1DA081E3e4'; // Rnkeby

  const AwooFinance = await hre.ethers.getContractFactory('AwooFinance');
  const awooFinance = await AwooFinance.deploy(CH_ADDR, OP_ADDR, DOG_NFT_ADDR);

  await awooFinance.deployed();

  console.log('AwooFinance deployed to:', awooFinance.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
