# CharityDonation Smart Contract

A decentralized charity donation platform that enables transparent fundraising campaigns with multi-admin support, donor tracking, and secure fund management.

## Features

- Create and manage fundraising campaigns
- Multi-admin support for campaign management
- Secure donation handling and fund management
- Donor tracking and refund capabilities
- Campaign lifecycle management (active, completed, cancelled)
- Transparent withdrawal system

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

#### Donation Handling
```solidity
function donateToCampaign(address payable _campaignAddress, uint256 _campaignId, uint256 _amount) public payable
```

#### Fund Management
```solidity
function withdrawFunds(uint256 _campaignId, address _campaignAddress, uint256 _amount, address payable _to) external
function refundDonors(uint256 _campaignId, address _campaignAddress) public
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

## Setup and Testing

1. Install dependencies:
```bash
npm install
```

2. Compile contracts:
```bash
npx hardhat compile
```

3. Run tests:
```bash
npx hardhat test
```

4. Deploy to local network:
```bash
npx hardhat node
npx hardhat run scripts/deploy.ts --network localhost
```

## Security Considerations

1. **Access Control**
   - Admin management system
   - Function-level permission checks
   - Role-based access control for critical functions

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