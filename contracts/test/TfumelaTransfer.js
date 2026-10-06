const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TfumelaTransfer", function () {
  async function setup() {
    const [owner, alice, bob, treasury, attacker] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("MockERC20");
    const usdt = await Token.deploy("Mock USDT", "USDT", 6);
    const usdc = await Token.deploy("Mock USDC", "USDC", 6);
    const T = await ethers.getContractFactory("TfumelaTransfer");
    const tf = await T.deploy(owner.address, treasury.address);
    for (const token of [usdt, usdc]) {
      await tf.setSupportedToken(token.target, true);
      await tf.setFeeConfig(token.target, true, 50, ethers.parseUnits("0.5", 6), ethers.parseUnits("100", 6));
      await token.mint(alice.address, ethers.parseUnits("1000", 6));
    }
    return {owner,alice,bob,treasury,attacker,usdt,usdc,tf};
  }

  it("implements Option B: 0.5 stablecoin + 0.5%", async()=>{
    const {alice,bob,treasury,usdt,tf}=await setup();
    const amount=ethers.parseUnits("100",6);
    const fee=ethers.parseUnits("1",6);
    const id=ethers.keccak256(ethers.toUtf8Bytes("one"));
    await usdt.connect(alice).approve(tf.target,amount+fee);
    await expect(tf.connect(alice).sendToken(usdt.target,bob.address,amount,id))
      .to.emit(tf,"TfumelaTransfer")
      .withArgs(id,alice.address,usdt.target,bob.address,amount,fee,amount+fee);
    expect(await usdt.balanceOf(bob.address)).to.equal(amount);
    expect(await usdt.balanceOf(treasury.address)).to.equal(fee);
  });

  it("supports USDC with the same economic formula", async()=>{
    const {alice,bob,treasury,usdc,tf}=await setup();
    const amount=ethers.parseUnits("50",6);
    const fee=ethers.parseUnits("0.75",6);
    await usdc.connect(alice).approve(tf.target,amount+fee);
    await tf.connect(alice).sendToken(usdc.target,bob.address,amount,ethers.keccak256(ethers.toUtf8Bytes("two")));
    expect(await usdc.balanceOf(bob.address)).to.equal(amount);
    expect(await usdc.balanceOf(treasury.address)).to.equal(fee);
  });

  it("rejects unsupported tokens, zero amount, same recipient and zero transfer id", async()=>{
    const {alice,bob,usdt,tf}=await setup();
    const Token=await ethers.getContractFactory("MockERC20");
    const other=await Token.deploy("Other","OTH",6);
    await expect(tf.connect(alice).sendToken(other.target,bob.address,1,ethers.id("x"))).to.be.revertedWithCustomError(tf,"UnsupportedToken");
    await expect(tf.connect(alice).sendToken(usdt.target,bob.address,0,ethers.id("x"))).to.be.revertedWithCustomError(tf,"ZeroAmount");
    await expect(tf.connect(alice).sendToken(usdt.target,alice.address,1,ethers.id("x"))).to.be.revertedWithCustomError(tf,"SameRecipient");
    await expect(tf.connect(alice).sendToken(usdt.target,bob.address,1,ethers.ZeroHash)).to.be.revertedWithCustomError(tf,"EmptyTransferId");
  });

  it("enforces fee ceilings and access control", async()=>{
    const {owner,attacker,alice,bob,usdt,tf}=await setup();
    await expect(tf.connect(attacker).setFeeConfig(usdt.target,true,50,1,100)).to.be.revertedWithCustomError(tf,"OwnableUnauthorizedAccount");
    await tf.connect(owner).setFeeConfig(usdt.target,true,1000,ethers.parseUnits("1",6),ethers.parseUnits("1",6));
    await expect(tf.calculateFee(usdt.target,ethers.parseUnits("10",6))).to.be.revertedWithCustomError(tf,"FeeTooHigh");
    await tf.pause();
    await expect(tf.connect(alice).sendToken(usdt.target,bob.address,1,ethers.id("p"))).to.be.revertedWithCustomError(tf,"EnforcedPause");
  });

  it("prevents transfer id replay", async()=>{
    const {alice,bob,usdt,tf}=await setup();
    const amount=ethers.parseUnits("10",6);
    const fee=ethers.parseUnits("0.55",6);
    const id=ethers.id("replay");
    await usdt.connect(alice).approve(tf.target,amount+fee+amount+fee);
    await tf.connect(alice).sendToken(usdt.target,bob.address,amount,id);
    await expect(tf.connect(alice).sendToken(usdt.target,bob.address,amount,id))
      .to.be.revertedWithCustomError(tf,"TransferIdAlreadyUsed");
  });

  it("rejects a fee cap below the fixed fee", async()=>{
    const {owner,usdt,tf}=await setup();
    await expect(tf.connect(owner).setFeeConfig(usdt.target,true,50,ethers.parseUnits("0.5",6),ethers.parseUnits("0.49",6)))
      .to.be.revertedWithCustomError(tf,"InvalidFee");
  });

  it("rejects insufficient allowance", async()=>{
    const {alice,bob,usdt,tf}=await setup();
    await usdt.connect(alice).approve(tf.target,ethers.parseUnits("100",6));
    await expect(tf.connect(alice).sendToken(usdt.target,bob.address,ethers.parseUnits("100",6),ethers.id("allow"))).to.be.reverted;
  });
});