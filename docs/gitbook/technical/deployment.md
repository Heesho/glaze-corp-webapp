# Deployment Guide

For developers deploying their own instances of GlazeCorp contracts.

---

## Prerequisites

- Node.js 18+
- Hardhat
- Private key with ETH on Base
- BaseScan API key (for verification)

---

## Environment Setup

```bash
# Clone the repository
git clone https://github.com/glazecorp/contracts.git
cd contracts

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

### Configure .env

```bash
# Deployer wallet
PRIVATE_KEY=your_private_key_here

# RPC endpoint
RPC_URL=https://mainnet.base.org

# For contract verification
SCAN_API_KEY=your_basescan_api_key

# Existing token addresses (for LSG/Franchise)
DONUT_ADDRESS=0xAE4a37d554C6D6F3E398546d8566B25052e0169C
WETH_ADDRESS=0x4200000000000000000000000000000000000006
```

---

## Deploying the Miner

### 1. Configure Parameters

Edit `scripts/deployMiner.js`:

```javascript
const WETH_ADDRESS = "0x4200000000000000000000000000000000000006";
const TREASURY_ADDRESS = "0x..."; // Your treasury

const MINER_CONFIG = {
  quote: WETH_ADDRESS,
  treasury: TREASURY_ADDRESS,
};
```

### 2. Deploy

```bash
npx hardhat run scripts/deployMiner.js --network base
```

### 3. Verify

```bash
npx hardhat verify --network base <MINER_ADDRESS> <WETH_ADDRESS> <TREASURY_ADDRESS>
```

---

## Deploying LSG (Governance)

### 1. Deploy Factories First

```javascript
// scripts/deployLSG.js

// 1. Deploy BribeFactory
const BribeFactory = await ethers.getContractFactory("BribeFactory");
const bribeFactory = await BribeFactory.deploy();

// 2. Deploy StrategyFactory
const StrategyFactory = await ethers.getContractFactory("StrategyFactory");
const strategyFactory = await StrategyFactory.deploy();

// 3. Deploy GovernanceToken
const GovernanceToken = await ethers.getContractFactory("GovernanceToken");
const governanceToken = await GovernanceToken.deploy(
  DONUT_ADDRESS,
  "Governance Donut",
  "gDONUT"
);

// 4. Deploy Voter
const Voter = await ethers.getContractFactory("Voter");
const voter = await Voter.deploy(
  governanceToken.address,
  WETH_ADDRESS,
  TREASURY_ADDRESS,
  bribeFactory.address,
  strategyFactory.address
);

// 5. Set voter on GovernanceToken
await governanceToken.setVoter(voter.address);

// 6. Deploy RevenueRouter
const RevenueRouter = await ethers.getContractFactory("RevenueRouter");
const revenueRouter = await RevenueRouter.deploy(WETH_ADDRESS, voter.address);

// 7. Set revenue source on Voter
await voter.setRevenueSource(revenueRouter.address);
```

### 2. Add Strategies

```javascript
// Add cbBTC strategy
await voter.addStrategy(
  CBBTC_ADDRESS,           // payment token
  DAO_TREASURY_ADDRESS,    // payment receiver
  parseEther("0.0001"),    // init price
  86400,                   // epoch period (24h)
  parseEther("1.2"),       // price multiplier (1.2x)
  1e6                      // min init price
);

// Add USDC strategy
await voter.addStrategy(
  USDC_ADDRESS,
  DAO_TREASURY_ADDRESS,
  parseUnits("1", 6),      // 1 USDC
  86400,
  parseEther("1.2"),
  1e6
);

// Repeat for other strategies...
```

### 3. Set Bribe Split

```javascript
// 30% of strategy auction payments go to bribes
await voter.setBribeSplit(3000); // 30% in basis points
```

---

## Deploying Franchise

### 1. Deploy Core and Multicall

```javascript
// scripts/deployFranchise.js

const Core = await ethers.getContractFactory("Core");
const core = await Core.deploy(
  DONUT_ADDRESS,
  WETH_ADDRESS,
  UNISWAP_V2_ROUTER,
  UNISWAP_V2_FACTORY,
  PROTOCOL_FEE_ADDRESS,
  parseEther("100000"),    // min DONUT for launch
  parseEther("1000000")    // initial unit mint amount
);

const Multicall = await ethers.getContractFactory("FranchiseMulticall");
const multicall = await Multicall.deploy(
  core.address,
  WETH_ADDRESS
);
```

---

## Deployment Checklist

### Pre-Deployment
- [ ] Audit completed
- [ ] Test on testnet first
- [ ] Verify all addresses
- [ ] Check gas prices

### Miner
- [ ] Deploy Miner contract
- [ ] Verify on BaseScan
- [ ] Deploy Multicall
- [ ] Test mining flow
- [ ] Set treasury address

### LSG
- [ ] Deploy BribeFactory
- [ ] Deploy StrategyFactory
- [ ] Deploy GovernanceToken
- [ ] Deploy Voter
- [ ] Link GovernanceToken ↔ Voter
- [ ] Deploy RevenueRouter
- [ ] Set revenue source
- [ ] Add all strategies
- [ ] Set bribe split
- [ ] Deploy LSG Multicall
- [ ] Transfer ownership to Governor

### Franchise
- [ ] Deploy Core
- [ ] Deploy Multicall
- [ ] Verify all contracts
- [ ] Test launch flow
- [ ] Set protocol fee address

---

## Post-Deployment

### Transfer Ownership

For production, transfer ownership to a Governor or multisig:

```javascript
// Transfer Voter ownership to Governor
await voter.transferOwnership(GOVERNOR_ADDRESS);

// Transfer Core ownership
await core.transferOwnership(MULTISIG_ADDRESS);
```

### Verify All Contracts

```bash
# Verify each contract
npx hardhat verify --network base <ADDRESS> <CONSTRUCTOR_ARGS>

# Or use verify script
npx hardhat run scripts/verify.js --network base
```

### Update Frontend

Update contract addresses in your frontend:

```javascript
// lib/blockchain/contracts.ts
export const MINER_ADDRESS = "0x...";
export const VOTER_ADDRESS = "0x...";
// etc.
```

---

## Security Considerations

1. **Private Key Security**
   - Use hardware wallet for production deploys
   - Never commit private keys
   - Use environment variables

2. **Ownership**
   - Transfer to multisig/Governor after deployment
   - Test ownership transfers on testnet first

3. **Parameter Validation**
   - Double-check all addresses
   - Verify token decimals
   - Test with small amounts first

4. **Upgrades**
   - These contracts are NOT upgradeable
   - Deploy new versions if needed
   - Plan migration paths
