const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PointsToken 积分代币", function () {
  let pointsToken;
  let owner;
  let minter;
  let burner;
  let user;
  let MINTER_ROLE, BURNER_ROLE;

  beforeEach(async function () {
    [owner, minter, burner, user] = await ethers.getSigners();
    
    const PointsToken = await ethers.getContractFactory("PointsToken");
    pointsToken = await PointsToken.deploy();
    await pointsToken.waitForDeployment();

    // 获取角色标识符
    MINTER_ROLE = await pointsToken.MINTER_ROLE();
    BURNER_ROLE = await pointsToken.BURNER_ROLE();

    // 设置角色
    await pointsToken.grantRole(MINTER_ROLE, minter.address);
    await pointsToken.grantRole(BURNER_ROLE, burner.address);
  });

  describe("Basic Functions 基础功能", function () {
    it("should set correct token name and symbol / 应该正确设置代币名称和符号", async function () {
      expect(await pointsToken.name()).to.equal("BNB Points");
      expect(await pointsToken.symbol()).to.equal("BNBP");
    });

    it("should set correct roles / 应该正确设置角色", async function () {
      expect(await pointsToken.hasRole(MINTER_ROLE, minter.address)).to.be.true;
      expect(await pointsToken.hasRole(BURNER_ROLE, burner.address)).to.be.true;
    });
  });

  describe("Minting Functions 铸币功能", function () {
    it("minter should be able to mint tokens / 铸币者应该能铸造代币", async function () {
      await pointsToken.connect(minter).mint(user.address, 1000n);
      expect(await pointsToken.balanceOf(user.address)).to.equal(1000n);
    });

    it("non-minter should not be able to mint tokens / 非铸币者不能铸造代币", async function () {
      try {
        await pointsToken.connect(user).mint(user.address, 1000n);
        expect.fail("应该抛出错误");
      } catch (error) {
        expect(error.message).to.include("AccessControl");
      }
    });
  });

  describe("Points Redemption Functions 积分核销功能", function () {
    beforeEach(async function () {
      await pointsToken.connect(minter).mint(user.address, 1000n);
    });

    it("user cannot redeem more points than balance / 用户不能核销超过余额的积分", async function () {
      try {
        await pointsToken.connect(user).redeem(1500n, "购物抵扣");
        expect.fail("应该抛出错误");
      } catch (error) {
        expect(error.message).to.include("Insufficient points balance");
      }
    });

    it("burner should be able to redeem user points / 核销者应该能核销用户的积分", async function () {
      const tx = await pointsToken.connect(burner).redeemFrom(user.address, 500n, "系统核销");
      const receipt = await tx.wait();
      // 找到 PointsRedeemed 事件（应该是第二个事件，第一个是 Transfer）
      const event = receipt.logs[1];
      const decodedEvent = pointsToken.interface.parseLog(event);
      
      expect(decodedEvent.name).to.equal("PointsRedeemed");
      expect(decodedEvent.args[0]).to.equal(user.address);
      expect(decodedEvent.args[1]).to.equal(500n);
      expect(decodedEvent.args[2]).to.equal("系统核销");
      
      expect(await pointsToken.balanceOf(user.address)).to.equal(500n);
    });
  });

  describe("Pause Functions 暂停功能", function () {
    beforeEach(async function () {
      await pointsToken.connect(minter).mint(user.address, 1000n);
    });

    it("admin should be able to pause and unpause contract / 管理员应该能暂停和恢复合约", async function () {
      await pointsToken.pause();
      try {
        await pointsToken.connect(user).transfer(minter.address, 100n);
        expect.fail("应该抛出错误");
      } catch (error) {
        expect(error.message).to.include("Pausable: paused");
      }
      
      await pointsToken.unpause();
      const tx = await pointsToken.connect(user).transfer(minter.address, 100n);
      await tx.wait();
      expect(await pointsToken.balanceOf(user.address)).to.equal(900n);
      expect(await pointsToken.balanceOf(minter.address)).to.equal(100n);
    });

    it("should not allow redemption when paused / 暂停状态下不能核销积分", async function () {
      await pointsToken.pause();
      try {
        await pointsToken.connect(user).redeem(500n, "购物抵扣");
        expect.fail("应该抛出错误");
      } catch (error) {
        expect(error.message).to.include("Pausable: paused");
      }
    });
  });
  describe("Transfer Functions 转账功能", function () {
    beforeEach(async function () {
      await pointsToken.connect(minter).mint(user.address, 1000n);
    });

    it("user should be able to transfer points / 用户应该能够转账积分", async function () {
      const tx = await pointsToken.connect(user).transfer(burner.address, 300n);
      await tx.wait();
      expect(await pointsToken.balanceOf(user.address)).to.equal(700n);
      expect(await pointsToken.balanceOf(burner.address)).to.equal(300n);
    });

    it("should not allow transfer exceeding balance / 不能转账超过余额的积分", async function () {
      try {
        await pointsToken.connect(user).transfer(burner.address, 1500n);
        expect.fail("应该抛出错误");
      } catch (error) {
        expect(error.message).to.include("ERC20: transfer amount exceeds balance");
      }
    });
  });
});