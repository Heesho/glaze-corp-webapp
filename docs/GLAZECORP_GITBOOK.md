# GlazeCorp Documentation

> GlazeCorp is a contributor to DonutDAO, building products like the DONUT Miner, Liquid Signal Governance (LSG), and Franchise Launchpad.

---

## Table of Contents

1. [Introduction](#introduction)
2. [The DONUT Ecosystem](#the-donut-ecosystem)
3. [Mining](#mining)
   - [How Mining Works](#how-mining-works)
   - [Dutch Auction Pricing](#dutch-auction-pricing)
   - [Fee Distribution](#fee-distribution)
   - [Emission Schedule](#emission-schedule)
   - [Mining Strategy Guide](#mining-strategy-guide)
4. [Governance (LSG)](#governance-lsg)
   - [Overview](#lsg-overview)
   - [Staking DONUT for gDONUT](#staking-donut-for-gdonut)
   - [Voting on Strategies](#voting-on-strategies)
   - [Revenue Flow](#revenue-flow)
   - [Bribe Rewards](#bribe-rewards)
   - [APR Calculation](#apr-calculation)
5. [Franchise Launchpad](#franchise-launchpad)
   - [What is Franchise?](#what-is-franchise)
   - [Launching a Token](#launching-a-token)
   - [Rig Mining](#rig-mining)
   - [Unit Tokens & Auctions](#unit-tokens--auctions)
   - [Permanent Liquidity](#permanent-liquidity)
6. [Smart Contract Reference](#smart-contract-reference)
7. [Glossary](#glossary)

---

## Introduction

GlazeCorp builds decentralized infrastructure for DonutDAO on Base chain. Our products work together to create a self-sustaining economic flywheel:

```
┌─────────────────────────────────────────────────────────────────┐
│                        DONUT FLYWHEEL                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   MINING ──────► DONUT tokens minted                           │
│      │                    │                                     │
│      │                    ▼                                     │
│      │           GOVERNANCE (LSG)                               │
│      │           Stake DONUT → gDONUT                          │
│      │           Vote on strategies                             │
│      │                    │                                     │
│      │                    ▼                                     │
│      │           REVENUE distributed                            │
│      │           based on votes                                 │
│      │                    │                                     │
│      ▼                    ▼                                     │
│   Treasury ◄───── Strategy Auctions                            │
│      │                                                          │
│      ▼                                                          │
│   FRANCHISE                                                     │
│   Launch new tokens                                             │
│   using DONUT liquidity                                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Core Products

| Product | Purpose |
|---------|---------|
| **Miner** | Continuous Dutch auction to mint DONUT tokens |
| **LSG (Governance)** | Vote on how protocol revenue is allocated |
| **Franchise** | Launch new tokens with permanent liquidity |

---

## The DONUT Ecosystem

### What is DONUT?

DONUT is the native token of DonutDAO, continuously minted through the Miner contract. Unlike fixed-supply tokens, DONUT has an emission schedule that halves every 30 days (similar to Bitcoin's halving).

### Token Addresses (Base)

| Token | Address |
|-------|---------|
| DONUT | `0xAE4a37d554C6D6F3E398546d8566B25052e0169C` |
| gDONUT | `0xC78B6e362cB0f48b59E573dfe7C99d92153a16d3` |
| DONUT-ETH LP | `0xD1DbB2E56533C55C3A637D13C53aeEf65c5D5703` |

### Key Contracts

| Contract | Address |
|----------|---------|
| Miner | `0xF69614F4Ee8D4D3879dd53d5A039eB3114C794F6` |
| Voter (LSG) | `0x9C5Cf3246d7142cdAeBBD5f653d95ACB73DdabA6` |
| LSG Multicall | `0x41eA22dF0174cF3Cc09B1469a95D604E1833a462` |
| Franchise Core | `0xA35588D152F45C95f5b152e099647f081BD9F5AB` |

---

## Mining

Mining is the primary mechanism for distributing DONUT tokens. Instead of a traditional ICO or airdrop, DONUT is continuously minted through a competitive Dutch auction.

### How Mining Works

```
┌────────────────────────────────────────────────────────────────┐
│                      MINING EPOCH CYCLE                        │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  EPOCH START                                                   │
│      │                                                         │
│      ▼                                                         │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  Dutch Auction: Price decays from initPrice → 0         │  │
│  │                                                          │  │
│  │  Price                                                   │  │
│  │    │                                                     │  │
│  │  1.0│████                                                │  │
│  │    │    ████                                             │  │
│  │  0.5│        ████                                        │  │
│  │    │            ████                                     │  │
│  │  0.0│________________████___► Time (1 hour)              │  │
│  │                                                          │  │
│  └─────────────────────────────────────────────────────────┘  │
│      │                                                         │
│      ▼                                                         │
│  SOMEONE MINES (pays current price)                           │
│      │                                                         │
│      ├──► Previous miner receives: minted DONUT + 80% payment │
│      ├──► Treasury receives: 20% of payment                   │
│      └──► New miner becomes active                            │
│      │                                                         │
│      ▼                                                         │
│  NEW EPOCH STARTS                                              │
│  initPrice = lastPrice × 2 (price multiplier)                 │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### Dutch Auction Pricing

The price follows a linear decay formula:

```
currentPrice = initPrice × (epochPeriod - timePassed) / epochPeriod
```

**Example:**
- `initPrice` = 0.1 ETH
- `epochPeriod` = 1 hour (3600 seconds)
- After 30 minutes (1800 seconds):
  - `currentPrice` = 0.1 × (3600 - 1800) / 3600 = **0.05 ETH**

**Why Dutch Auctions defeat snipers:**
1. Being first means paying the HIGHEST price
2. Waiting gives you a LOWER price
3. No advantage to speed - patience wins

### Fee Distribution

When someone mines, their payment (in WETH) is distributed:

| Recipient | Percentage | Purpose |
|-----------|------------|---------|
| Previous Miner | 80% | Reward for holding the mining position |
| Treasury | 20% | Protocol revenue (split: 15% treasury, 4% provider, 1% team) |

```solidity
// From Miner.sol
uint256 public constant FEE = 2_000;  // 20% total fee
uint256 public constant DIVISOR = 10_000;

// Fee calculation
uint256 totalFee = price * FEE / DIVISOR;  // 20%
uint256 minerFee = price - totalFee;        // 80% to previous miner
```

### Emission Schedule

DONUT emissions follow a halving schedule, similar to Bitcoin:

```
┌─────────────────────────────────────────────────────────────┐
│                    EMISSION HALVING                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Emissions                                                  │
│  (DONUT/sec)                                               │
│      │                                                      │
│    4 │████████                                              │
│      │        │                                             │
│    2 │        ████████                                      │
│      │                │                                     │
│    1 │                ████████                              │
│      │                        │                             │
│  0.5 │                        ████████                      │
│      │                                │                     │
│ 0.01 │................................████████████████████  │
│      └──────────────────────────────────────────────► Time  │
│         Month 1   Month 2   Month 3   Month 4    ...        │
│                                                             │
│  TAIL_DPS = 0.01 DONUT/second (minimum, never goes below)  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Key Constants:**
```solidity
uint256 public constant INITIAL_DPS = 4 ether;     // 4 DONUT per second
uint256 public constant HALVING_PERIOD = 30 days;  // Halves every 30 days
uint256 public constant TAIL_DPS = 0.01 ether;     // Minimum emission rate
```

**Tokens Minted Calculation:**
```
tokensMinted = timeAsMiner × currentDPS
```

If you hold the mining position for 1 hour at 4 DONUT/sec:
- `tokensMinted` = 3600 × 4 = **14,400 DONUT**

### Mining Strategy Guide

#### When to Mine

| Scenario | Action | Reasoning |
|----------|--------|-----------|
| Price just reset high | Wait | Price will decay, giving better entry |
| Price near 0 | Mine now | Someone else will take it soon |
| High emissions phase | More aggressive | More DONUT minted per hour |
| Low activity | Wait longer | Price decays more between mines |

#### Expected Returns

Your profit comes from two sources:

1. **Mined DONUT** = Time held × Emission rate
2. **ETH from next miner** = 80% of their payment

**Example Scenario:**
```
You pay: 0.1 ETH (when price decayed to this level)
You hold for: 2 hours
Emission rate: 4 DONUT/sec
DONUT earned: 2 × 3600 × 4 = 28,800 DONUT

Next miner pays: 0.15 ETH
You receive: 0.15 × 80% = 0.12 ETH

Net result:
├── DONUT: +28,800
└── ETH: +0.02 (received 0.12, paid 0.10)
```

---

## Governance (LSG)

### LSG Overview

**Liquid Signal Governance** enables DONUT holders to decide how protocol revenue is allocated. Instead of a centralized multisig or hard-coded fee splits, voters directly control where revenue flows.

```
┌─────────────────────────────────────────────────────────────────┐
│                    REVENUE ALLOCATION FLOW                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  PROTOCOL REVENUE (WETH)                                        │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────────┐                                           │
│  │  Revenue Router │ ──────────────────────────────────────┐   │
│  └────────┬────────┘                                       │   │
│           │                                                │   │
│           ▼                                                │   │
│  ┌─────────────────┐                                       │   │
│  │     VOTER       │                                       │   │
│  │                 │                                       │   │
│  │  Distributes    │                                       │   │
│  │  based on       │                                       │   │
│  │  vote weights   │                                       │   │
│  └────────┬────────┘                                       │   │
│           │                                                │   │
│     ┌─────┴─────┬─────────────┬─────────────┐             │   │
│     ▼           ▼             ▼             ▼             │   │
│ ┌───────┐  ┌───────┐    ┌───────┐    ┌───────┐           │   │
│ │cbBTC  │  │ USDC  │    │DONUT  │    │ LP    │           │   │
│ │Strategy│ │Strategy│   │Strategy│   │Strategy│          │   │
│ │  40%  │  │  30%  │    │  20%  │    │  10%  │           │   │
│ └───┬───┘  └───┬───┘    └───┬───┘    └───┬───┘           │   │
│     │          │            │            │                │   │
│     ▼          ▼            ▼            ▼                │   │
│  Dutch      Dutch        Dutch        Dutch               │   │
│  Auction    Auction      Auction      Auction             │   │
│     │          │            │            │                │   │
│     ▼          ▼            ▼            ▼                │   │
│  Buyers pay in payment token, revenue flows to DAO        │   │
│                                                           │   │
└───────────────────────────────────────────────────────────────┘
```

### Staking DONUT for gDONUT

To participate in governance, you must stake DONUT to receive gDONUT (Governance DONUT):

```
┌────────────────────────────────────────────────────────┐
│                    STAKING FLOW                        │
├────────────────────────────────────────────────────────┤
│                                                        │
│  1. STAKE                                              │
│     DONUT ──────► GovernanceToken.stake(amount)       │
│                          │                             │
│                          ▼                             │
│                   gDONUT (1:1 ratio)                  │
│                   Non-transferable!                    │
│                          │                             │
│                          ▼                             │
│                   Auto-delegates to self              │
│                   (ERC20Votes compatible)             │
│                                                        │
│  2. UNSTAKE                                           │
│     Requirement: Must clear all votes first!          │
│                                                        │
│     voter.reset() ──────► Clear votes                 │
│            │                                          │
│            ▼                                          │
│     gDONUT ──────► GovernanceToken.unstake(amount)   │
│            │                                          │
│            ▼                                          │
│     DONUT returned                                    │
│                                                        │
└────────────────────────────────────────────────────────┘
```

**Why non-transferable?**
- Prevents flash loan attacks on governance
- Voting power = actual commitment
- No vote buying through token transfers

### Voting on Strategies

Each strategy represents a different use for protocol revenue. Voters allocate their gDONUT balance across strategies:

```solidity
// Vote for multiple strategies with relative weights
address[] memory strategies = [cbBTCStrategy, USDCStrategy, DONUTStrategy];
uint256[] memory weights = [50, 30, 20];  // Will be normalized to 100%

voter.vote(strategies, weights);
```

**Voting Rules:**
1. Can only vote once per epoch (7 days)
2. Weights are normalized (50, 30, 20 becomes 50%, 30%, 20%)
3. Must wait for next epoch to change votes
4. Must reset votes before unstaking

**Current Strategies:**

| Strategy | Payment Token | Purpose |
|----------|---------------|---------|
| cbBTC Strategy | cbBTC | Accumulate Bitcoin for DAO treasury |
| USDC Strategy | USDC | Stable reserves |
| DONUT Strategy | DONUT | Token buybacks |
| LP Strategy | DONUT-ETH LP | Increase liquidity depth |

### Revenue Flow

Revenue flows through a multi-step process:

```
┌─────────────────────────────────────────────────────────────────┐
│                     DETAILED REVENUE FLOW                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. REVENUE GENERATED                                           │
│     Mining fees, auction payments, etc.                         │
│              │                                                  │
│              ▼                                                  │
│  2. REVENUE ROUTER                                              │
│     Accumulates WETH from various sources                       │
│              │                                                  │
│              ▼                                                  │
│  3. FLUSH TO VOTER                                              │
│     revenueRouter.flush() → voter.notifyRevenue(amount)        │
│              │                                                  │
│              ▼                                                  │
│  4. INDEX UPDATE                                                │
│     Global index increases: index += amount × 1e18 / totalWeight│
│              │                                                  │
│              ▼                                                  │
│  5. STRATEGY CLAIMS                                             │
│     Each strategy's claimable = weight × (index - lastIndex)    │
│              │                                                  │
│              ▼                                                  │
│  6. DISTRIBUTE                                                  │
│     voter.distribute(strategy) → WETH sent to strategy         │
│              │                                                  │
│              ▼                                                  │
│  7. DUTCH AUCTION                                               │
│     Strategy sells WETH for payment token                       │
│              │                                                  │
│              ├──► Payment split: X% to Bribes, (100-X)% to DAO │
│              │                                                  │
│              ▼                                                  │
│  8. BRIBE REWARDS                                               │
│     Voters who voted for this strategy earn rewards             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Bribe Rewards

When strategy auctions are purchased, a portion goes to voters as "bribes" (rewards for voting):

```
┌────────────────────────────────────────────────────────────────┐
│                    BRIBE REWARD SYSTEM                         │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  AUCTION PAYMENT (e.g., 100 cbBTC)                            │
│         │                                                      │
│         ├──► bribeSplit% (e.g., 30%) → BRIBE CONTRACT         │
│         │                                    │                 │
│         │                                    ▼                 │
│         │                    ┌─────────────────────────┐      │
│         │                    │    BRIBE DISTRIBUTION   │      │
│         │                    │                         │      │
│         │                    │  Rewards stream over    │      │
│         │                    │  7 days based on your   │      │
│         │                    │  share of votes         │      │
│         │                    │                         │      │
│         │                    │  Your Reward =          │      │
│         │                    │  totalReward ×          │      │
│         │                    │  (yourVotes/totalVotes) │      │
│         │                    │                         │      │
│         │                    └─────────────────────────┘      │
│         │                                                      │
│         └──► (100 - bribeSplit)% → DAO TREASURY               │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

**Claiming Bribes:**
```solidity
// Claim from all bribe contracts you've voted for
address[] memory bribes = [cbBTCBribe, USDCBribe];
voter.claimBribes(bribes);
```

### APR Calculation

APR for voting on a strategy is calculated as:

```
┌─────────────────────────────────────────────────────────────────┐
│                    APR CALCULATION                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  From the Multicall contract, we get:                          │
│                                                                 │
│  rewardsPerToken = (rewardRate × 604800) × 1e18 / totalSupply  │
│                                                                 │
│  This represents: weekly rewards per 1e18 gDONUT staked        │
│                                                                 │
│  ────────────────────────────────────────────────────────────  │
│                                                                 │
│  CALCULATION STEPS:                                            │
│                                                                 │
│  1. Get weekly rewards per gDONUT (in base units)              │
│     weeklyRewards = rewardsPerToken                            │
│                                                                 │
│  2. Annualize (52 weeks)                                       │
│     annualRewards = weeklyRewards × 52                         │
│                                                                 │
│  3. Convert to human-readable                                  │
│     annualRewardsHuman = annualRewards / (10 ^ tokenDecimals)  │
│                                                                 │
│  4. Calculate USD values                                       │
│     annualRewardsUSD = annualRewardsHuman × rewardTokenPrice   │
│     stakedValueUSD = 1 × gDONUTPriceUSD                       │
│                                                                 │
│  5. Calculate APR                                              │
│     APR = (annualRewardsUSD / stakedValueUSD) × 100           │
│                                                                 │
│  ────────────────────────────────────────────────────────────  │
│                                                                 │
│  EXAMPLE (cbBTC Strategy):                                     │
│                                                                 │
│  rewardsPerToken = 2 (very small for 8-decimal token!)        │
│  tokenDecimals = 8 (cbBTC)                                     │
│  cbBTC price = $100,000                                        │
│  gDONUT price = $0.10                                          │
│                                                                 │
│  annualRewards = 2 × 52 = 104 (base units)                    │
│  annualRewardsHuman = 104 / 1e8 = 0.00000104 cbBTC            │
│  annualRewardsUSD = 0.00000104 × $100,000 = $0.104            │
│  APR = ($0.104 / $0.10) × 100 = 104%                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Important:** For low-decimal tokens like cbBTC (8 decimals), `rewardsPerToken` can be a very small number (like 2). This is expected and still represents significant APR!

---

## Franchise Launchpad

### What is Franchise?

Franchise allows anyone to launch a new token that:
- Has **permanent liquidity** (LP tokens are burned)
- Is distributed through **fair mining** (not bought in bulk)
- Is **sniper-resistant** (Dutch auctions defeat bots)

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRANCHISE ARCHITECTURE                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  LAUNCHER provides DONUT + WETH                                │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    CORE CONTRACT                         │   │
│  │                                                          │   │
│  │  Creates:                                                │   │
│  │  ├── UNIT TOKEN (the new token)                         │   │
│  │  ├── RIG (mining contract)                              │   │
│  │  ├── AUCTION (treasury auction)                         │   │
│  │  └── LP TOKEN (UNIT-DONUT pair)                         │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  INITIAL LIQUIDITY                       │   │
│  │                                                          │   │
│  │  DONUT + UNIT ───► Uniswap V2 Pool                      │   │
│  │                          │                               │   │
│  │                          ▼                               │   │
│  │                    LP TOKENS                             │   │
│  │                          │                               │   │
│  │                          ▼                               │   │
│  │                 BURNED TO 0xdead                         │   │
│  │                 (Liquidity is PERMANENT)                 │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Launching a Token

**Requirements:**
1. DONUT tokens (minimum: configured in Core contract)
2. Configuration parameters

**Launch Parameters:**

| Parameter | Description | Example |
|-----------|-------------|---------|
| `tokenName` | Display name | "MyToken" |
| `tokenSymbol` | Ticker | "MTK" |
| `unitUri` | Metadata URI | "ipfs://Qm..." |
| `donutAmount` | DONUT for liquidity | 100,000 |
| `initialUps` | Starting emission rate | 4 tokens/sec |
| `tailUps` | Minimum emission rate | 0.01 tokens/sec |
| `halvingPeriod` | Time between halvings | 30 days |
| `rigEpochPeriod` | Mining epoch duration | 1 hour |
| `rigPriceMultiplier` | Price increase per mine | 2x |
| `auctionEpochPeriod` | Treasury auction duration | 24 hours |
| `auctionPriceMultiplier` | Auction price increase | 1.2x |

**What Gets Created:**

```
launch() creates:
│
├── UNIT Token
│   └── Mintable only by the Rig
│
├── RIG Contract
│   ├── Dutch auction mining (like main DONUT miner)
│   ├── Mints UNIT tokens to miners
│   └── Fees: 80% prev miner, 15% treasury, 4% team, 1% protocol
│
├── AUCTION Contract
│   ├── Sells accumulated WETH for LP tokens
│   └── LP tokens are burned (deflates supply)
│
└── LP Token (UNIT-DONUT)
    └── Initial supply burned to 0xdead
```

### Rig Mining

Each Franchise has its own "Rig" - a mining contract identical in mechanics to the main DONUT miner:

```
┌─────────────────────────────────────────────────────────────────┐
│                      RIG MINING CYCLE                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Same as DONUT mining:                                         │
│                                                                 │
│  1. Price starts at initPrice                                  │
│  2. Price decays linearly to 0 over epochPeriod                │
│  3. Someone pays current price to become miner                 │
│  4. Previous miner receives:                                   │
│     - Minted UNIT tokens (time × UPS)                         │
│     - 80% of payment in WETH                                   │
│  5. New epoch starts with price = lastPrice × multiplier       │
│                                                                 │
│  FEE DISTRIBUTION:                                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Previous Miner: 80%                                      │  │
│  │ Treasury:       15%  (accumulates for LP auctions)       │  │
│  │ Team:           4%   (launcher's configured address)     │  │
│  │ Protocol:       1%   (GlazeCorp)                         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  EMISSION HALVING:                                             │
│  Same halving schedule as DONUT                                │
│  initialUps → initialUps/2 → initialUps/4 → ... → tailUps     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Unit Tokens & Auctions

**UNIT Token:**
- The native token of each Franchise
- Minted only by the Rig contract (no pre-mine, no team allocation)
- Traded against DONUT on Uniswap V2

**Treasury Auction:**
The 15% treasury fee accumulates in WETH. This is auctioned off to LP holders:

```
┌────────────────────────────────────────────────────────────────┐
│                    TREASURY AUCTION                            │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  TREASURY (accumulated WETH)                                   │
│         │                                                      │
│         ▼                                                      │
│  ┌─────────────────────────────────────────┐                  │
│  │         DUTCH AUCTION                    │                  │
│  │                                          │                  │
│  │  Buyer pays in LP tokens                 │                  │
│  │  Receives treasury WETH                  │                  │
│  │                                          │                  │
│  │  LP tokens paid → BURNED                 │                  │
│  │                                          │                  │
│  └─────────────────────────────────────────┘                  │
│                                                                │
│  Result: LP supply decreases → each LP worth more             │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### Permanent Liquidity

When a token launches, initial LP tokens are **burned** to address `0x000...dEaD`:

```
┌────────────────────────────────────────────────────────────────┐
│                    PERMANENT LIQUIDITY                         │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  WHY BURN LP TOKENS?                                          │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                                                          │  │
│  │  Traditional Launch:                                     │  │
│  │  Launcher provides liquidity → Gets LP tokens           │  │
│  │  Later: Removes liquidity → "RUG PULL"                  │  │
│  │                                                          │  │
│  │  ─────────────────────────────────────────────────────  │  │
│  │                                                          │  │
│  │  Franchise Launch:                                       │  │
│  │  Launcher provides liquidity → LP tokens BURNED         │  │
│  │  Later: IMPOSSIBLE to remove liquidity                  │  │
│  │         Token will ALWAYS be tradeable                  │  │
│  │                                                          │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│  LP tokens sent to: 0x000000000000000000000000000000000000dEaD │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

**Benefits:**
- No rug pulls possible
- Token always has liquidity
- Builds trust with community

---

## Smart Contract Reference

### Mining Contracts

#### Miner.sol
```solidity
// Mine to become the active miner
function mine(
    address miner,      // Address to receive future tokens
    address provider,   // Referral address (gets 5% of 20% fee)
    uint256 epochId,    // Current epoch (frontrun protection)
    uint256 deadline,   // Transaction deadline
    uint256 maxPrice,   // Max price willing to pay (slippage)
    string memory uri   // Metadata URI for this epoch
) external returns (uint256 price);

// View current price
function getPrice() external view returns (uint256);

// View current emission rate
function getDps() external view returns (uint256);
```

#### Donut.sol
```solidity
// Only miner can mint
function mint(address account, uint256 amount) external;

// Anyone can burn their own tokens
function burn(uint256 amount) external;
```

### Governance Contracts

#### GovernanceToken.sol
```solidity
// Stake DONUT 1:1 for gDONUT
function stake(uint256 amount) external;

// Unstake (requires clearing votes first)
function unstake(uint256 amount) external;

// Delegate voting power
function delegate(address delegatee) external;
```

#### Voter.sol
```solidity
// Vote on strategies
function vote(
    address[] calldata strategies,
    uint256[] calldata weights
) external;

// Reset all votes (required before unstaking)
function reset() external;

// Claim bribe rewards
function claimBribes(address[] memory bribes) external;

// Distribute revenue to a strategy
function distribute(address strategy) external;
```

#### Strategy.sol
```solidity
// Buy revenue tokens from auction
function buy(
    address assetsReceiver,    // Where to send revenue tokens
    uint256 epochId,           // Frontrun protection
    uint256 deadline,          // Transaction deadline
    uint256 maxPaymentAmount   // Slippage protection
) external returns (uint256 paymentAmount);

// View current auction price
function getPrice() external view returns (uint256);
```

#### Bribe.sol
```solidity
// Claim accumulated rewards
function getReward(address account) external;

// View earned rewards
function earned(address account, address token) external view returns (uint256);

// View remaining rewards to distribute
function left(address token) external view returns (uint256);
```

### Franchise Contracts

#### Core.sol
```solidity
// Launch a new token
function launch(LaunchParams calldata params) external returns (
    address unit,     // The new token
    address rig,      // Mining contract
    address auction,  // Treasury auction
    address lpToken   // Uniswap LP token
);
```

#### Rig.sol
```solidity
// Same interface as Miner.sol
function mine(
    address miner,
    uint256 epochId,
    uint256 deadline,
    uint256 maxPrice,
    string memory uri
) external returns (uint256 price);
```

#### Auction.sol
```solidity
// Buy treasury assets with LP tokens
function buy(
    address[] calldata assets,
    address assetsReceiver,
    uint256 epochId,
    uint256 deadline,
    uint256 maxPaymentTokenAmount
) external returns (uint256 paymentAmount);
```

---

## Glossary

| Term | Definition |
|------|------------|
| **DONUT** | Native token of DonutDAO, minted through mining |
| **gDONUT** | Governance DONUT - non-transferable staked token for voting |
| **DPS/UPS** | Donuts Per Second / Units Per Second - emission rate |
| **Epoch** | Time period for Dutch auctions (typically 1 hour for mining, 7 days for voting) |
| **Dutch Auction** | Auction where price starts high and decreases over time |
| **LSG** | Liquid Signal Governance - the voting system |
| **Strategy** | A contract representing how revenue should be used (e.g., buyback DONUT) |
| **Bribe** | Rewards distributed to voters for participating in governance |
| **Rig** | Franchise mining contract (same mechanics as main Miner) |
| **Unit** | The native token of a Franchise project |
| **VRGDA** | Variable Rate Gradual Dutch Auction - pricing mechanism |
| **Treasury** | DAO-controlled funds accumulated from fees |
| **Halving** | Periodic reduction in emission rate (like Bitcoin) |
| **LP Token** | Liquidity Provider token representing share of Uniswap pool |
| **Burn** | Permanently remove tokens from circulation |
| **Slippage** | Maximum acceptable price difference for a transaction |
| **Frontrun Protection** | epochId parameter prevents MEV attacks |

---

## Links & Resources

- **GlazeCorp Webapp**: https://glazecorp.com
- **DonutDAO**: https://donutdao.com
- **Base Chain**: https://base.org
- **Contract Addresses**: See [Token Addresses](#token-addresses-base) section

---

*Documentation maintained by GlazeCorp. Last updated: December 2024*
