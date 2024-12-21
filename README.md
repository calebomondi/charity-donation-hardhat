# CharityDonation Smart Contract

A decentralized charity donation platform built on Ethereum that enables transparent fundraising campaigns with multi-admin support, built-in administrative controls, donor tracking, and secure fund management.

## Features

- Create and manage fundraising campaigns
- Accept donations in ETH
- Multi-admin support for campaign management
- Secure donation handling and fund management
- Automated campaign completion on target achievement
- Donor tracking and refund mechanism for failed campaigns
- Campaign lifecycle management (active, completed, cancelled)
- Complete transparency with on-chain tracking of donations and withdrawals
- Campaign cancellation protection when funds are raised

## Contract Structure

### Core Data Structures

1. **Campaign**
   - Unique campaign ID
   - Title and description
   - Target and raised amounts
   - Campaign deadline
   - Status flags (completed, cancelled)

2. **Donation**
   - Campaign details
   - Donation amount
   - Donor address

3. **Withdrawal**
   - Campaign ID
   - Amount withdrawn
   - Withdrawal details (by whom, to where)

### Core Components

1. **Campaign Management**
  - Create campaigns with title, description, target amount, and duration
  - Automatic completion when target is reached
  - Deadline enforcement
  - Campaign cancellation (with protections)

2. **Donation Handling**
  - Direct ETH donations to campaigns
  - Automatic campaign completion on target achievement
  - Tracking of individual donations
  - Protection against donations to completed/cancelled campaigns

3. **Admin System**
  - Multiple admin support
  - Admin addition/removal functionality
  - Protected administrative actions

4. **Withdrawal Management**
  - Controlled fund withdrawal system
  - Multi-admin withdrawal approval
  - Complete withdrawal tracking

5. **Refund System**
  - Donor refund functionality for failed campaigns
  - Protected refund process
  - Automatic balance tracking

### Key Functions

#### Campaign Management
```solidity
function createCampaign(string memory _title, string memory _description, uint256 _target, uint256 _durationdays) public
function cancelCampaign(uint256 _campaignId, address _campaignAddress) external
```

#### Admin Management
```solidity
function addCampaignAdmin(address _admin) public
function removeCampaignAdmin(address _admin) external
```

#### Donation Management
```solidity
function donateToCampaign(address payable _campaignAddress, uint256 _campaignId, uint256 _amount) public payable
```

#### Fund Management
```solidity
function withdrawFunds(uint256 _campaignId, address _campaignAddress, uint256 _amount, address payable _to) external
function refundDonors(uint256 _campaignId, address _campaignAddress) public
```

#### View Management
```solidity
function getCampaignDetails(uint256 _campaignId, address _campaignAddress) public view
function viewCampaigns() public view
function viewDonations() public view
function viewWithdrawals(address _campaignAddress) public view
```

#### Events 
The contract emits the following events for tracking:
```solidity
event CampaignCreated(uint256 campaign_id, address campaignAddress, string title, uint256 targetAmount, uint256 deadline)
event DonationReceived(address donor, uint256 amount, address campaignAddress, uint256 campaign_id)
event FundsWithdrawn(uint256 amount, address by, address to, address from, uint256 campaignId)
event CampaignCompleted(address campaignAddress, uint256 campaign_id)
event CampaignCancelled(address campaignAddress, uint256 campaign_id)
event AddAdmin(address admin)
event RemoveAdmin(address admin)
event RefundCampaignDonors(address campaignAddress, uint256 campaignId, address to, uint256 amount)
```

## Test Coverage

### Campaign Creation Tests
- [x] Create new campaign with valid parameters
- [x] Prevent duplicate campaign titles
- [x] Validate campaign parameters (target amount, duration)
- [x] Verify campaign creation events

### Admin Management Tests
- [x] Add new admin
- [x] Remove existing admin
- [x] Verify admin permissions
- [x] Test admin-only functions

### Donation Tests
- [x] Process valid donations
- [x] Update campaign balances correctly
- [x] Track donor contributions
- [x] Handle campaign completion on target reached
- [x] Prevent donations after deadline
- [x] Prevent donations to cancelled campaigns
- [x] Prevent donations to completed campaigns

### Fund Management Tests
- [x] Withdraw funds from completed campaigns
- [x] Process donor refunds for failed campaigns
- [x] Verify withdrawal permissions
- [x] Track withdrawal history

### View Function Tests
- [x] Retrieve campaign details
- [x] View donation history
- [x] Check withdrawal records
- [x] List campaign admins

### Campaign Cancellation Tests
- [x] Cancellation restrictions on completed campaigns
- [x] Admin-only access
- [x] Cancellation protection for failed campaigns with existing donations

## Test Coverage 
```bash
-----------------------------|----------|----------|----------|----------|----------------|
File                         |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
-----------------------------|----------|----------|----------|----------|----------------|
 contracts\                  |      100 |    73.08 |      100 |      100 |                |
  CharityDonationAdmin.sol   |      100 |    73.08 |      100 |      100 |                |
  CharityDonationCore.sol    |      100 |    73.08 |      100 |      100 |                |
  CharityDonationEvents.sol  |      100 |      100 |      100 |      100 |                |
  CharityDonationMain.sol    |      100 |      100 |      100 |      100 |                |
  CharityDonationStorage.sol |      100 |      100 |      100 |      100 |                |
-----------------------------|----------|----------|----------|----------|----------------|
All files                    |      100 |    73.08 |      100 |      100 |                |
-----------------------------|----------|----------|----------|----------|----------------|
```

## Development and Testing

### Prerequisites
- Node.js v14+ and npm
- Hardhat
- Ethereum wallet (e.g., MetaMask)
- Infura or Alchemy RPC and API access

### Setup

1. Clone this repository
```bash
git clone <repository-url>
cd <repository-folder>
```

2. Install dependencies:
```bash
npm install
npm i dotenv@latest
```

3. Compile contracts:
```bash
npx hardhat compile
```

4. Run tests:
```bash
npx hardhat test
```

5. Deploy to local network:
```bash
npx hardhat node
npx hardhat run scripts/deploy.ts
```

6. Deploy to testnet or mainnet:
- Configure network in `hardhat.config.js`
- Set up environment variables.
- Deploy contract
```bash
npx hardhat run scripts/deploy.js --network <network-name>
```

## Security Considerations

1. **Access Control**
   - Admin management system
   - Function-level permission checks
   - Role-based access control and Re-enterancy protection for critical functions

2. **Fund Safety**
   - Secure withdrawal mechanism
   - Refund capability for failed campaigns
   - Balance tracking and verification

3. **Input Validation**
   - Campaign parameter validation
   - Donation amount verification
   - Address validation

4. **Re-entrancy Protection**
   - Balance updates before transfers
   - State changes before external calls

## Usage Examples

### Creating a Campaign
```typescript
const title = "Charity Campaign";
const description = "Help raise funds for a good cause";
const target = ethers.parseEther("10"); // 10 ETH target
const duration = 30; // 30 days

await charityContract.createCampaign(title, description, target, duration);
```

### Making a Donation
```typescript
const campaignId = 1;
const amount = ethers.parseEther("1"); // 1 ETH donation

await charityContract.donateToCampaign(campaignAddress, campaignId, amount, {
    value: amount
});
```

### Adding an Admin
```typescript
const newAdmin = "0x..."; // Admin address
await charityContract.addCampaignAdmin(newAdmin);
```

### Withdrawing Funds
```typescript
const amount = ethers.parseEther("5");
const beneficiary = "0x..."; // Beneficiary address

await charityContract.withdrawFunds(
    campaignId,
    campaignAddress,
    amount,
    beneficiary
);
```

## License
MIT License

## Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request