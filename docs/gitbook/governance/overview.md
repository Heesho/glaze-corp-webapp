# Governance Overview

Liquid Signal Governance (LSG) enables DONUT holders to control how protocol revenue is allocated.

---

## What is LSG?

LSG (Liquid Signal Governance) is a decentralized system where:
- Token holders stake DONUT to receive voting power
- Votes direct protocol revenue to different strategies
- Voters earn rewards proportional to their participation

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           LSG OVERVIEW                                      │
└─────────────────────────────────────────────────────────────────────────────┘

  TRADITIONAL APPROACH              LSG APPROACH

  Protocol Revenue                  Protocol Revenue
       │                                 │
       ▼                                 ▼
  ┌─────────────┐                   ┌─────────────┐
  │  Multisig   │                   │   VOTERS    │
  │  decides    │                   │   decide    │
  └──────┬──────┘                   └──────┬──────┘
         │                                 │
         ▼                                 ▼
  Fixed allocation                  Dynamic allocation
  (trust required)                  (trustless, on-chain)
```

---

## The Governance Cycle

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        GOVERNANCE CYCLE                                     │
└─────────────────────────────────────────────────────────────────────────────┘

                         ┌─────────────────┐
                         │   STAKE DONUT   │
                         │   Get gDONUT    │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │      VOTE       │
                         │  on strategies  │
                         └────────┬────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    ▼                           ▼
           ┌─────────────────┐         ┌─────────────────┐
           │ Revenue flows   │         │   Earn bribe    │
           │ per vote weight │         │   rewards       │
           └────────┬────────┘         └────────┬────────┘
                    │                           │
                    ▼                           ▼
           ┌─────────────────┐         ┌─────────────────┐
           │ Strategies sell │         │ Claim rewards   │
           │ via auction     │         │ (cbBTC, USDC..) │
           └────────┬────────┘         └────────┬────────┘
                    │                           │
                    ▼                           │
           ┌─────────────────┐                  │
           │  DAO Treasury   │                  │
           │  accumulates    │◄─────────────────┘
           │  payment tokens │    Reinvest or
           └─────────────────┘    hold rewards
```

---

## Key Components

### 1. Governance Token (gDONUT)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         gDONUT                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  WHAT IT IS:                                                               │
│  • Non-transferable staked DONUT                                           │
│  • Represents your voting power                                            │
│  • 1:1 ratio with underlying DONUT                                         │
│                                                                             │
│  WHY NON-TRANSFERABLE:                                                     │
│  • Prevents flash loan attacks                                             │
│  • Ensures real commitment                                                 │
│  • No vote buying on secondary markets                                     │
│                                                                             │
│  COMPATIBILITY:                                                            │
│  • ERC20Votes standard                                                     │
│  • Works with: Tally, Snapshot, Aragon                                     │
│  • Full OpenZeppelin Governor support                                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2. Voter Contract

The central hub that:
- Tracks all votes and their weights
- Distributes revenue proportionally
- Manages strategies and bribes

### 3. Strategies

Each strategy represents a use for revenue:

| Strategy | Payment Token | What It Does |
|----------|---------------|--------------|
| cbBTC | cbBTC | Accumulates Bitcoin for DAO |
| USDC | USDC | Builds stable reserves |
| DONUT | DONUT | Token buybacks |
| LP | DONUT-ETH LP | Deepens liquidity |

### 4. Bribes

Reward contracts that distribute payment tokens to voters.

---

## Epoch Timing

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         EPOCH TIMING                                        │
└─────────────────────────────────────────────────────────────────────────────┘

  ├────────── EPOCH 1 (7 days) ──────────┼────── EPOCH 2 (7 days) ─────────┤

  Actions:                                Actions:
  • Vote (once per epoch)                 • Vote again OR
  • Claim rewards anytime                 • Keep previous votes
  • Reset votes (if needed)               • Claim rewards anytime

  Rules:
  • Can only vote OR reset once per epoch
  • Votes persist until you change them
  • Must wait for next epoch to modify votes
  • Rewards accrue continuously
```

---

## Revenue Distribution

Revenue is distributed based on vote weights:

```
EXAMPLE:

Total gDONUT voting: 1,000,000
├── cbBTC Strategy: 400,000 votes (40%)
├── USDC Strategy:  300,000 votes (30%)
├── DONUT Strategy: 200,000 votes (20%)
└── LP Strategy:    100,000 votes (10%)

When 10 WETH of revenue arrives:
├── cbBTC Strategy: 4 WETH
├── USDC Strategy:  3 WETH
├── DONUT Strategy: 2 WETH
└── LP Strategy:    1 WETH

Each strategy then auctions its WETH for the payment token.
```

---

## Current Strategies

### cbBTC Strategy
- **Purpose**: Accumulate Bitcoin for long-term DAO treasury
- **Payment**: Buyers pay in cbBTC
- **Appeal**: Bitcoin exposure without selling DONUT

### USDC Strategy
- **Purpose**: Build stable reserves for DAO operations
- **Payment**: Buyers pay in USDC
- **Appeal**: Stability, operational runway

### DONUT Strategy
- **Purpose**: Token buybacks, reducing circulating supply
- **Payment**: Buyers pay in DONUT
- **Appeal**: Deflationary pressure on token

### LP Strategy
- **Purpose**: Deepen DONUT-ETH liquidity
- **Payment**: Buyers pay in LP tokens
- **Appeal**: Better trading, lower slippage

---

## Why Participate?

### 1. Earn Rewards

```
Vote → Earn bribe rewards in payment tokens (cbBTC, USDC, etc.)
More votes → More rewards
```

### 2. Shape Protocol Direction

```
Your votes directly control where revenue flows.
Want more BTC? Vote cbBTC.
Want stability? Vote USDC.
```

### 3. Compound Value

```
Rewards → More DONUT → More voting power → More rewards
```

---

## Quick Comparison

| Feature | Traditional DAO | LSG |
|---------|-----------------|-----|
| Revenue allocation | Multisig/fixed | Vote-weighted |
| Participation reward | Usually none | Bribe rewards |
| Change allocation | Proposal + vote | Just vote differently |
| Capital efficiency | Locked tokens | Liquid (can unstake) |
| Sybil resistance | Token-based | Stake required |

---

## Next Steps

- [Staking DONUT](staking.md) - How to stake and get gDONUT
- [Voting on Strategies](voting.md) - Cast your votes
- [Bribe Rewards & APR](rewards.md) - Understanding your earnings
