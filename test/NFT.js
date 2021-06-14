const { expect } = require('chai');

describe('CryptoNyte', function () {
  let dogNft, treatNft;
  let owner, feeder;

  const TREAT_ID = 0;
  const DOG_ID = 0;

  before(async () => {
    [owner, dogOwner, feeder, receiver, ...addrs] = await ethers.getSigners();

    const DogNFT = await ethers.getContractFactory('DogNFT');
    const TreatsNFT = await ethers.getContractFactory('TreatsNFT');

    treatNft = await TreatsNFT.deploy();
    await treatNft.deployed();
    console.log('TreatsNFT is deployed at: ', treatNft.address);

    dogNft = await DogNFT.deploy(treatNft.address, 'DNFT', 'DNFT');
    await dogNft.deployed();
    console.log('DogNFT is deployed at: ', dogNft.address);

    await treatNft.mint(feeder.address, TREAT_ID, 100, 0x0);
    await treatNft.connect(feeder).setApprovalForAll(dogNft.address, true);
  });

  it('should be able to mint a new Dog NFT', async () => {
    await dogNft.mint(dogOwner.address, DOG_ID);

    expect(await dogNft.balanceOf(dogOwner.address)).to.equal(1);

    expect((await dogNft.getRedistFeeOf(dogOwner.address)).toNumber()).to.equal(10);
    expect((await dogNft.totalBoosts()).toNumber()).to.equal(10);
    expect((await dogNft.totalBoosters()).toNumber()).to.equal(1);

    console.log('Dog Evolution: ', (await dogNft.tokenEvolution(DOG_ID)).toNumber());
  });

  it('should feed dog 1 time', async () => {
    await dogNft.connect(feeder).feedDog(DOG_ID, TREAT_ID, 1);

    expect((await dogNft.tokenEvolved(DOG_ID)).toNumber()).to.equal(10);
    expect((await dogNft.getRedistFeeOf(dogOwner.address)).toNumber()).to.equal(10);
    expect((await dogNft.totalBoosts()).toNumber()).to.equal(10);
    expect((await dogNft.totalBoosters()).toNumber()).to.equal(1);
    expect((await treatNft.balanceOf(feeder.address, TREAT_ID)).toNumber()).to.equal(99);
  });

  it('should evolve dog', async () => {
    const tokenEvolution = (await dogNft.tokenEvolution(DOG_ID)).toNumber();
    await dogNft.connect(feeder).feedDog(DOG_ID, TREAT_ID, 10);

    expect((await dogNft.tokenEvolved(DOG_ID)).toNumber()).to.equal(110);
    expect((await dogNft.getRedistFeeOf(dogOwner.address)).toNumber()).to.equal(10 + tokenEvolution / 10);
    expect((await dogNft.totalBoosts()).toNumber()).to.equal(10 + tokenEvolution / 10);
    expect((await dogNft.totalBoosters()).toNumber()).to.equal(1);
    expect((await treatNft.balanceOf(feeder.address, TREAT_ID)).toNumber()).to.equal(89);
  });

  it('should not be able to feed evolved dog', async () => {
    await expect(dogNft.connect(feeder).feedDog(DOG_ID, TREAT_ID, 1)).to.revertedWith(
      'Already Evolved',
      'Dog NFT is already in evolved state',
    );
    expect((await treatNft.balanceOf(feeder.address, TREAT_ID)).toNumber()).to.equal(89);
  });

  it('should change the boost fee when transfer', async () => {
    const tokenEvolution = (await dogNft.tokenEvolution(DOG_ID)).toNumber();
    await dogNft
      .connect(dogOwner)
      ['safeTransferFrom(address,address,uint256)'](dogOwner.address, receiver.address, DOG_ID);

    expect((await dogNft.tokenEvolved(DOG_ID)).toNumber()).to.equal(110);
    expect((await dogNft.getRedistFeeOf(receiver.address)).toNumber()).to.equal(10 + tokenEvolution / 10);
    expect((await dogNft.getRedistFeeOf(dogOwner.address)).toNumber()).to.equal(0);

    expect((await dogNft.totalBoosts()).toNumber()).to.equal(10 + tokenEvolution / 10);
    expect((await dogNft.totalBoosters()).toNumber()).to.equal(1);

    expect((await treatNft.balanceOf(feeder.address, TREAT_ID)).toNumber()).to.equal(89);
  });
});
