import { expect } from "chai";
import { ethers } from "hardhat";
import { parseEther } from "ethers";
import { time } from "@nomicfoundation/hardhat-toolbox/network-helpers";
//import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { CharityDonationMain } from "../typechain-types";


describe("CharityDonation", function () {
  let charityContract: CharityDonationMain;
  let owner: SignerWithAddress;
  let admin: SignerWithAddress;
  let donor1: SignerWithAddress;
  let donor2: SignerWithAddress;
  let beneficiary: SignerWithAddress;

  beforeEach(async function () {
    // Get signers
    [owner, admin, donor1, donor2, beneficiary] = await ethers.getSigners();

    // Deploy contract
    const CharityDonationFactory = await ethers.getContractFactory("CharityDonationMain");
    charityContract = await CharityDonationFactory.deploy() as unknown as CharityDonationMain;
    await charityContract.waitForDeployment();
  });
  /*
  describe("Campaign Creation", function () {
    it("Should create a new campaign successfully", async function () {
      const title = "Test Campaign";
      const description = "Test Description";
      const target = parseEther("1");
      const duration = 30; // 30 days

      // Get current timestamp before creating campaign
      const currentTime = await time.latest();
      
      // Create campaign
      const newCampaign = await charityContract.createCampaign(title, description, target, duration);
      await newCampaign.wait();

      // Verify the event
      const receipt = await newCampaign.wait();
      const event = receipt?.logs[0];
      
      // Now get the actual campaign to verify the deadline
      const campaigns = await charityContract.viewCampaigns();
      expect(campaigns.length).to.equal(1);
      expect(campaigns[0].title).to.equal(title);
      expect(campaigns[0].targetAmount).to.equal(target);
      
      // Verify the deadline is approximately correct (within a small margin)
      const expectedDeadline = BigInt(currentTime) + BigInt(duration * 24 * 3600);
      const actualDeadline = campaigns[0].deadline;
      
      // Allow for a small time difference (e.g., 5 seconds) due to block mining
      const difference = actualDeadline > expectedDeadline 
        ? actualDeadline - expectedDeadline 
        : expectedDeadline - actualDeadline;
      
      expect(difference).to.be.lessThan(BigInt(5)); // 5 seconds tolerance

      // Verify the event was emitted with correct parameters
      await expect(newCampaign)
        .to.emit(charityContract, "CampaignCreated")
        .withArgs(1n, owner.address, title, target, campaigns[0].deadline);
    });

    it("Should not allow duplicate campaign titles", async function () {
      //create campaign that already exists
      const title = "Test Campaign";
      await charityContract.createCampaign(title, "Description", parseEther("1"), 30);
      
      //verify that creating a campaign with the same title fails
      await expect(
        charityContract.createCampaign(title, "New Description", parseEther("2"), 30)
      ).to.be.revertedWith("Campaign Test Campaign already exists!");
    });
  });
  
  describe("Admin Management", function () {
    it("Should add and remove admins correctly", async function () {
      //add admin to campaign admin list
      await charityContract.addCampaignAdmin(admin.address);
      
      //check if admin is in the list of campaign admins
      const [, admins] = await charityContract.viewWithdrawals(owner.address);
      expect(admins).to.include(admin.address);

      //remove admin from campaign admin list
      await charityContract.removeCampaignAdmin(admin.address);
      
      //create a new campaign to test if admin can withdraw funds after being removed
      const campaignId = 1;
      await charityContract.createCampaign("Test", "Description", parseEther("1"), 30);
      
      await expect(
        charityContract.connect(admin).cancelCampaign(campaignId, owner.address)
      ).to.be.revertedWith("Only Admins Can Perform This Action!");
    });

    it("Should not allow address to be added as admin if address is already an admin", async function () {
      //add existing admin to campaign admin list
      await charityContract.addCampaignAdmin(admin.address);

      //verify that adding the same admin fails
      await expect(
        charityContract.addCampaignAdmin(admin.address)
      ).to.be.revertedWith("This Address Is Already An Admin!");
    });

    it("Should not allow address to be removed as admin if address is not an admin", async function () {
      //verify that removing an address that is not an admin fails
      await expect(
        charityContract.removeCampaignAdmin(admin.address)
      ).to.be.revertedWith("This Address Is Not An Admin!");
    });
  });
  
  describe("Donations", function () {
    //create a test campaign before each test
    beforeEach(async function () {
      await charityContract.createCampaign(
        "Test Campaign",
        "Description",
        parseEther("10"),
        30
      );
    });

    it("Should accept donations and update balances correctly", async function () {
      //donate to campaign and check if event was emitted as expected
      const donationAmount = parseEther("1");
      
      await expect(
        charityContract.connect(donor1).donateToCampaign(
          owner.address,
          1,
          donationAmount,
          { value: donationAmount }
        )
      ).to.emit(charityContract, "DonationReceived")
       .withArgs(donor1.address, donationAmount, owner.address, 1n);

      //check if balance and raisedAmount were updated correctly
      const [campaign] = await charityContract.getCampaignDetails(1, owner.address);
      expect(campaign.balance).to.equal(donationAmount);
      expect(campaign.raisedAmount).to.equal(donationAmount);
    });

    it("Should complete campaign when target is reached", async function () {
      //donar exact amount to reach target
      const target = parseEther("10");
      
      await charityContract.connect(donor1).donateToCampaign(
        owner.address,
        1,
        target,
        { value: target }
      );

      //check if campaign is completed
      const [campaign] = await charityContract.getCampaignDetails(1, owner.address);
      expect(campaign.isCompleted).to.be.true;
    });

    it("Should not accept donations after deadline", async function () {
      //increase time to pass deadline
      await time.increase(31 * 24 * 3600);

      //try to donate to campaign after deadline
      const donationAmount = parseEther("1");
      await expect(
        charityContract.connect(donor1).donateToCampaign(
          owner.address,
          1,
          donationAmount,
          { value: donationAmount }
        )
      ).to.be.revertedWith("This Campaign's Deadline Has Passed!");
    });

    it("Should not accept donations after campaign is completed", async function () {
      //donate exact target amount to complete campaign
      const target = parseEther("10");
      await charityContract.connect(donor1).donateToCampaign(
        owner.address,
        1,
        target,
        { value: target }
      );

      //try to donate to completed campaign
      const donationAmount = parseEther("1");
      await expect(
        charityContract.connect(donor1).donateToCampaign(
          owner.address,
          1,
          donationAmount,
          { value: donationAmount }
        )
      ).to.be.revertedWith("'Test Campaign' Campaign Has Already Been Completed!");
    });

    it("Should not accept donations if campaign is cancelled", async function () {
      //add admin to campaign admin list and cancel campaign
      await charityContract.addCampaignAdmin(admin.address);
      charityContract.connect(admin).cancelCampaign(1, owner.address)

      //try to donate to cancelled campaign
      const donationAmount = parseEther("1");
      await expect(
        charityContract.connect(donor1).donateToCampaign(
          owner.address,
          1,
          donationAmount,
          { value: donationAmount }
        )
      ).to.be.revertedWith("'Test Campaign' Campaign Has Been Cancelled!");
    });

  });
  
  describe("Withdrawals and Refunds", function () {
    //create a test campaign before each test
    beforeEach(async function () {
      await charityContract.createCampaign(
        "Test Campaign",
        "Description",
        parseEther("10"),
        30
      );

      //add campaign admin
      await charityContract.addCampaignAdmin(admin.address);
    });

    it("Should allow withdrawals after campaign completion", async function () {
      //donate exact target amount to complete campaign
      const donationAmount = parseEther("10");
      await charityContract.connect(donor1).donateToCampaign(
        owner.address,
        1,
        donationAmount,
        { value: donationAmount }
      );

      const withdrawAmount = parseEther("5");
      await expect(
        charityContract.connect(admin).withdrawFunds(1, owner.address, withdrawAmount, beneficiary.address)
      ).to.emit(charityContract, "FundsWithdrawn")
       .withArgs(withdrawAmount, admin.address, beneficiary.address, owner.address, 1n);

      const [campaign] = await charityContract.getCampaignDetails(1, owner.address);
      expect(campaign.balance).to.equal(donationAmount - withdrawAmount);
    });

    it("Should not allow withdrawals from an active completion", async function () {
      //donate to campaign but do not complete it
      const donationAmount = parseEther("3");
      await charityContract.connect(donor1).donateToCampaign(
        owner.address,
        1,
        donationAmount,
        { value: donationAmount }
      );

      //try to withdraw before campaign completion
      const withdrawAmount = parseEther("5");
      await expect(
        charityContract.connect(admin).withdrawFunds(1, owner.address, withdrawAmount, beneficiary.address)
      ).to.be.revertedWith("You Can't Withdraw Funds from an Active Campaign");
    });

    it("Should allow refunds when campaign fails", async function () {
      //make donation to campaign
      const donationAmount = parseEther("5");
      await charityContract.connect(donor1).donateToCampaign(
        owner.address,
        1,
        donationAmount,
        { value: donationAmount }
      );

      await expect(
        charityContract.connect(admin).refundDonors(1, owner.address)
      ).to.emit(charityContract, "RefundCampaignDonors")
       .withArgs(owner.address, 1n, donor1.address, donationAmount);

      const [campaign] = await charityContract.getCampaignDetails(1, owner.address);
      expect(campaign.balance).to.equal(0n);
    });
  });
  */
  describe("View Functions", function () {
    it("Should return correct campaign details", async function () {
      await charityContract.createCampaign(
        "Test Campaign",
        "Description",
        parseEther("10"),
        30
      );

      const donationAmount = parseEther("1");
      await charityContract.connect(donor1).donateToCampaign(
        owner.address,
        1,
        donationAmount,
        { value: donationAmount }
      );

      const [campaign, donorsCount, donors] = await charityContract.getCampaignDetails(1, owner.address);
      expect(campaign.title).to.equal("Test Campaign");
      expect(donorsCount).to.equal(1n);
      expect(donors[0].by).to.equal(donor1.address);
      expect(donors[0].amount).to.equal(donationAmount);
    });

    it("Should track donations correctly", async function () {
      await charityContract.createCampaign(
        "Test Campaign",
        "Description",
        parseEther("10"),
        30
      );

      const donationAmount = parseEther("1");
      await charityContract.connect(donor1).donateToCampaign(
        owner.address,
        1,
        donationAmount,
        { value: donationAmount }
      );

      const donations = await charityContract.connect(donor1).viewDonations();
      expect(donations.length).to.equal(1);
      expect(donations[0].amount).to.equal(donationAmount);
    });
  });
  
});