# Quick Start Guide

Get started with GlazeCorp in 5 minutes.

---

## Prerequisites

1. **Wallet**: MetaMask or any Web3 wallet
2. **Network**: Base chain (Chain ID: 8453)
3. **ETH**: Small amount for gas fees
4. **WETH/DONUT**: Depending on what you want to do

---

## Option 1: Start Mining DONUT

Mining is the easiest way to get started. You compete in a Dutch auction to become the active miner and earn DONUT tokens.

### Step-by-Step

```
1. Go to glazecorp.com/mine
2. Connect your wallet
3. Watch the current price (it decays over time)
4. When you're happy with the price, click "GLAZE"
5. Confirm the transaction
6. You're now mining! Earn DONUT until someone else mines.
```

### What Happens

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│  YOU PAY: Current auction price (in ETH)                  │
│                                                            │
│  YOU BECOME: The active miner                             │
│                                                            │
│  YOU EARN: DONUT tokens every second                      │
│            (rate depends on emission schedule)            │
│                                                            │
│  WHEN SOMEONE ELSE MINES:                                 │
│  - You receive your minted DONUT                          │
│  - You receive 80% of what they paid                      │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Tips
- **Wait for lower prices** - The price decays every second
- **Check the emission rate** - Higher rate = more DONUT per hour
- **Monitor activity** - Active periods mean quicker turnovers

---

## Option 2: Stake & Vote in Governance

Stake your DONUT to earn voting rewards (bribes) paid in cbBTC, USDC, and more.

### Step-by-Step

```
1. Go to glazecorp.com/govern
2. Connect your wallet
3. Enter DONUT amount and click "STAKE"
4. Approve DONUT spending (first time only)
5. Confirm stake transaction
6. Allocate your votes across strategies
7. Click "VOTE"
8. Claim rewards anytime!
```

### What Happens

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│  STAKE DONUT:                                              │
│  Your DONUT → gDONUT (1:1, non-transferable)              │
│                                                            │
│  VOTE:                                                     │
│  Allocate voting power to strategies                       │
│  Example: 50% cbBTC, 30% USDC, 20% DONUT                  │
│                                                            │
│  EARN:                                                     │
│  Rewards stream based on your share of votes              │
│  Higher vote % on a strategy = more rewards from it       │
│                                                            │
│  CLAIM:                                                    │
│  Click "Claim" anytime to receive earned rewards          │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Tips
- **Check APRs** - Different strategies have different reward rates
- **Vote every epoch** - You can change votes each week
- **Claim regularly** - Rewards accrue but don't auto-compound

---

## Option 3: Launch a Token on Franchise

Create your own token with permanent liquidity and fair distribution.

### Step-by-Step

```
1. Go to glazecorp.com/franchise
2. Connect your wallet
3. Click "Launch"
4. Configure your token:
   - Name and symbol
   - DONUT amount for liquidity
   - Emission parameters
5. Approve DONUT spending
6. Confirm launch transaction
7. Share your Rig address with your community!
```

### What Happens

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│  YOU PROVIDE: DONUT tokens                                │
│                                                            │
│  CREATED FOR YOU:                                         │
│  - UNIT token (your new token)                            │
│  - RIG contract (mining for your token)                   │
│  - Uniswap LP (UNIT-DONUT pair)                          │
│  - AUCTION contract (treasury management)                 │
│                                                            │
│  LP TOKENS: Burned to 0xdead (permanent liquidity!)       │
│                                                            │
│  DISTRIBUTION: Through mining, not presale                │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Tips
- **Choose emission rate carefully** - Affects token distribution speed
- **Plan your epoch period** - Shorter = more frequent mining events
- **Engage your community** - Mining works best with active participants

---

## Common Actions Reference

| Action | Where | What You Need |
|--------|-------|---------------|
| Mine DONUT | /mine | ETH (for payment + gas) |
| Stake DONUT | /govern | DONUT tokens |
| Vote | /govern | Staked gDONUT |
| Claim Rewards | /govern | Pending rewards |
| Unstake | /govern | Must reset votes first |
| Launch Token | /franchise | DONUT tokens |
| Mine Franchise | /franchise/[address] | ETH |

---

## Next Steps

- [Understand Mining Mechanics](../mining/how-it-works.md)
- [Learn About Governance](../governance/overview.md)
- [Explore Franchise](../franchise/overview.md)
