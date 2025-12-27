# Smart Contract API

Complete reference for interacting with GlazeCorp smart contracts.

---

## Mining Contracts

### Miner.sol

```solidity
// Mine to become the active miner
function mine(
    address miner,      // Address to receive future tokens and 80% fee
    address provider,   // Referral address (gets 5% of 20% fee), or address(0)
    uint256 epochId,    // Current epoch (reverts if mismatch - frontrun protection)
    uint256 deadline,   // Transaction deadline (reverts if passed)
    uint256 maxPrice,   // Maximum price willing to pay (reverts if exceeded)
    string memory uri   // Metadata URI for this epoch
) external returns (uint256 price);

// View functions
function getPrice() external view returns (uint256);          // Current auction price
function getDps() external view returns (uint256);            // Current emission rate
function slot0() external view returns (Slot0 memory);        // Full state
function startTime() external view returns (uint256);         // Contract start time
function treasury() external view returns (address);          // Treasury address
function donut() external view returns (address);             // DONUT token address
```

### Donut.sol

```solidity
// Standard ERC20 + ERC20Votes
function mint(address account, uint256 amount) external;  // Only miner can call
function burn(uint256 amount) external;                   // Anyone can burn their tokens
```

---

## Governance Contracts

### GovernanceToken.sol (gDONUT)

```solidity
// Staking
function stake(uint256 amount) external;    // Stake DONUT, receive gDONUT 1:1
function unstake(uint256 amount) external;  // Burn gDONUT, receive DONUT (must clear votes)

// Delegation (ERC20Votes)
function delegate(address delegatee) external;
function delegates(address account) external view returns (address);
function getVotes(address account) external view returns (uint256);

// View functions
function token() external view returns (address);   // Underlying DONUT address
function voter() external view returns (address);   // Voter contract address
```

### Voter.sol

```solidity
// Voting
function vote(
    address[] calldata strategies,  // Strategies to vote for
    uint256[] calldata weights      // Relative weights (normalized)
) external;

function reset() external;  // Clear all votes (required before unstaking)

// Claiming
function claimBribes(address[] memory bribes) external;  // Claim rewards from bribes

// Distribution
function distribute(address strategy) external;  // Send revenue to one strategy
function distributeAll() external;               // Distribute to all strategies

// View functions
function strategies(uint256 index) external view returns (address);
function getStrategies() external view returns (address[] memory);
function length() external view returns (uint256);

// Strategy mappings
function strategy_Bribe(address strategy) external view returns (address);
function strategy_BribeRouter(address strategy) external view returns (address);
function strategy_PaymentToken(address strategy) external view returns (address);
function strategy_Weight(address strategy) external view returns (uint256);
function strategy_IsAlive(address strategy) external view returns (bool);
function strategy_Claimable(address strategy) external view returns (uint256);

// Account mappings
function account_Strategy_Votes(address account, address strategy) external view returns (uint256);
function account_UsedWeights(address account) external view returns (uint256);
function account_LastVoted(address account) external view returns (uint256);

// Global state
function totalWeight() external view returns (uint256);
function governanceToken() external view returns (address);
function revenueToken() external view returns (address);
function bribeSplit() external view returns (uint256);
```

### Strategy.sol

```solidity
// Buy revenue tokens from Dutch auction
function buy(
    address assetsReceiver,      // Where to send revenue tokens
    uint256 epochId,             // Current epoch (frontrun protection)
    uint256 deadline,            // Transaction deadline
    uint256 maxPaymentAmount     // Maximum payment willing to make
) external returns (uint256 paymentAmount);

// View functions
function getPrice() external view returns (uint256);           // Current auction price
function revenueToken() external view returns (IERC20);        // Token being sold (WETH)
function paymentToken() external view returns (IERC20);        // Token to pay with
function paymentReceiver() external view returns (address);    // Where payments go
function epochPeriod() external view returns (uint256);
function priceMultiplier() external view returns (uint256);
function minInitPrice() external view returns (uint256);
function epochId() external view returns (uint256);
function initPrice() external view returns (uint256);
function startTime() external view returns (uint256);
```

### Bribe.sol

```solidity
// Claim rewards
function getReward(address account) external;

// View functions
function earned(address account, address token) external view returns (uint256);
function left(address token) external view returns (uint256);
function rewardPerToken(address token) external view returns (uint256);
function totalSupply() external view returns (uint256);
function account_Balance(address account) external view returns (uint256);
function getRewardTokens() external view returns (address[] memory);
function token_RewardData(address token) external view returns (Reward memory);
```

---

## Franchise Contracts

### Core.sol

```solidity
struct LaunchParams {
    address launcher;
    string tokenName;
    string tokenSymbol;
    string unitUri;
    uint256 donutAmount;
    uint256 initialUps;
    uint256 tailUps;
    uint256 halvingPeriod;
    uint256 rigEpochPeriod;
    uint256 rigPriceMultiplier;
    uint256 rigMinInitPrice;
    uint256 auctionInitPrice;
    uint256 auctionEpochPeriod;
    uint256 auctionPriceMultiplier;
    uint256 auctionMinInitPrice;
}

function launch(LaunchParams calldata params) external returns (
    address unit,      // New token address
    address rig,       // Mining contract
    address auction,   // Treasury auction
    address lpToken    // Uniswap LP token
);

// View functions
function deployedRigsLength() external view returns (uint256);
function deployedRigs(uint256 index) external view returns (address);
function rigToUnit(address rig) external view returns (address);
function rigToAuction(address rig) external view returns (address);
function rigToLP(address rig) external view returns (address);
function minDonutForLaunch() external view returns (uint256);
```

### Rig.sol

```solidity
// Same interface as Miner.sol but without provider
function mine(
    address miner,
    uint256 epochId,
    uint256 deadline,
    uint256 maxPrice,
    string memory uri
) external returns (uint256 price);

function getPrice() external view returns (uint256);
function getUps() external view returns (uint256);

// Additional view functions
function unit() external view returns (address);
function team() external view returns (address);
function treasury() external view returns (address);
```

### Auction.sol (Franchise)

```solidity
function buy(
    address[] calldata assets,       // Assets to claim
    address assetsReceiver,          // Receives assets
    uint256 epochId,
    uint256 deadline,
    uint256 maxPaymentTokenAmount    // Max LP tokens to pay
) external returns (uint256 paymentAmount);

function getPrice() external view returns (uint256);
```

---

## Multicall Contracts

### Miner Multicall

```solidity
// Mine with ETH (auto-wraps to WETH)
function mine(
    address provider,
    uint256 epochId,
    uint256 deadline,
    uint256 maxPrice,
    string memory uri
) external payable;

// Get full state
function getMiner(address account) external view returns (MinerState memory);
```

### LSG Multicall

```solidity
function getVoterData(address account) external view returns (VoterData memory);
function getAllBribesData(address account) external view returns (BribeData[] memory);
function getAllStrategiesData(address account) external view returns (StrategyData[] memory);
function getSystemOverview() external view returns (SystemOverview memory);
function getAllStrategyOverviews() external view returns (StrategyOverview[] memory);

function distribute(address strategy) external;
function distributeAll() external;
function flushAndDistributeAll() external;
function distributeAndBuy(
    address strategy,
    uint256 epochId,
    uint256 deadline,
    uint256 maxPaymentAmount
) external returns (uint256 paymentAmount);
```

### Franchise Multicall

```solidity
// Mine with ETH
function mine(
    address rig,
    uint256 epochId,
    uint256 deadline,
    uint256 maxPrice,
    string memory epochUri
) external payable;

// Buy from auction
function buy(
    address rig,
    uint256 epochId,
    uint256 deadline,
    uint256 maxPaymentTokenAmount
) external;

// Launch token
function launch(LaunchParams calldata params) external returns (
    address unit,
    address rig,
    address auction,
    address lpToken
);

// Get state
function getRig(address rig, address account) external view returns (RigState memory);
function getAuction(address rig, address account) external view returns (AuctionState memory);
```

---

## Events

### Key Events to Monitor

```solidity
// Mining
event Miner__Mined(address indexed sender, address indexed miner, uint256 price, string uri);
event Miner__Minted(address indexed miner, uint256 amount);

// Governance
event Voter__Voted(address indexed voter, address indexed strategy, uint256 weight);
event Voter__Abstained(address indexed account, address indexed strategy, uint256 weight);
event Voter__NotifyRevenue(address indexed sender, uint256 amount);
event Voter__DistributeRevenue(address indexed sender, address indexed strategy, uint256 amount);

// Strategies
event Strategy__Buy(address indexed buyer, address indexed receiver, uint256 revenue, uint256 payment);

// Bribes
event Bribe__RewardPaid(address indexed user, address indexed token, uint256 reward);

// Franchise
event Core__Launched(address launcher, address unit, address rig, address auction, address lp, ...);
event Rig__Mined(address indexed sender, address indexed miner, uint256 price, string uri);
```
