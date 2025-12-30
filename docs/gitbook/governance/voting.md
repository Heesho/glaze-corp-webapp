# Voting on Strategies

Allocate your voting power to determine how protocol revenue is distributed.

---

## How Voting Works

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          VOTING MECHANISM                                   │
└─────────────────────────────────────────────────────────────────────────────┘

  YOUR gDONUT BALANCE = YOUR VOTING POWER

  You allocate this power across strategies using weights:

  Example: You have 10,000 gDONUT

  vote([cbBTC, USDC, DONUT], [50, 30, 20])

  Result (after normalization):
  ├── cbBTC Strategy: 5,000 gDONUT (50%)
  ├── USDC Strategy:  3,000 gDONUT (30%)
  └── DONUT Strategy: 2,000 gDONUT (20%)

  These votes determine your share of bribe rewards from each strategy.
```

---

## Step-by-Step Voting

### 1. View Strategies

On the governance page, you'll see all active strategies:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  STRATEGIES                                                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │ ₿  cbBTC Strategy                                        42.5%       │ │
│  │    APR: 104%  │  Earned: 0.00005 cbBTC  │  Your vote: [  50  ]%     │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │ $  USDC Strategy                                         28.3%       │ │
│  │    APR: 45%   │  Earned: 2.50 USDC      │  Your vote: [  30  ]%     │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │ 🍩 DONUT Strategy                                        18.2%       │ │
│  │    APR: 78%   │  Earned: 50 DONUT       │  Your vote: [  20  ]%     │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │ 🔷 LP Strategy                                           11.0%       │ │
│  │    APR: 32%   │  Earned: 0.5 LP         │  Your vote: [   0  ]%     │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ─────────────────────────────────────────────────────────────────────────  │
│  Total: 100%                                                                │
│                                                                             │
│  [                         VOTE                         ]                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2. Enter Weights

Enter percentage weights for each strategy you want to vote for.

**Rules:**
- Weights are relative (will be normalized)
- Can leave strategies at 0% (no vote)
- Total can be any number (normalized to 100%)

### 3. Submit Vote

Click "VOTE" and confirm the transaction:

```
Transaction: Vote
├── Contract: Voter
├── Function: vote(strategies[], weights[])
├── Gas: ~200,000 - 400,000 (depends on # of strategies)
└── Result: Votes recorded, deposited into bribe contracts
```

---

## Weight Normalization

Your weights are automatically normalized to equal your full voting power:

```
EXAMPLE:

Input weights: [50, 30, 20]
Your gDONUT: 10,000

Normalization:
├── Total input: 50 + 30 + 20 = 100
├── cbBTC: 50/100 × 10,000 = 5,000 gDONUT
├── USDC: 30/100 × 10,000 = 3,000 gDONUT
└── DONUT: 20/100 × 10,000 = 2,000 gDONUT

Same result with input [5, 3, 2] or [500, 300, 200]!
```

---

## Epoch Restrictions

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          EPOCH TIMING                                       │
└─────────────────────────────────────────────────────────────────────────────┘

  ├─────────────── EPOCH 1 ───────────────┼─────────────── EPOCH 2 ──────────┤
  │                                       │                                   │
  │  You vote here                        │  You can vote again               │
  │  ↓                                    │  OR keep previous votes           │
  │  [VOTE]                               │                                   │
  │                                       │                                   │
  │  Cannot vote again                    │  [VOTE] or [RESET]                │
  │  Cannot reset                         │                                   │
  │                                       │                                   │
  ├───────────────────────────────────────┼───────────────────────────────────┤

  Each epoch = 7 days
  Epoch starts: Every Thursday 00:00 UTC (approximately)
```

### What Happens Each Epoch

```
EPOCH START
    │
    ▼
┌─────────────────────────────────────────┐
│  Your previous votes still active       │
│  Rewards continue accruing              │
└────────────────────┬────────────────────┘
                     │
         ┌───────────┴───────────┐
         ▼                       ▼
    VOTE AGAIN              KEEP VOTES
         │                       │
         ▼                       ▼
    New allocation          Same allocation
    takes effect            continues
```

---

## Voting Strategies

### Strategy 1: APR Maximizer

Vote for the highest APR strategies:

```
Check APRs → Vote highest → Maximize rewards

PROS:
├── Maximum short-term returns
└── Simple decision making

CONS:
├── APRs can change quickly
├── May not align with long-term DAO goals
└── High APR might indicate low participation (risky)
```

### Strategy 2: Diversified

Spread votes across multiple strategies:

```
Example: 40% cbBTC, 30% USDC, 20% DONUT, 10% LP

PROS:
├── Reduced risk
├── Multiple reward types
└── Supports ecosystem balance

CONS:
├── May not maximize any single reward
└── More complexity in tracking
```

### Strategy 3: DAO Aligned

Vote for what you believe benefits the protocol:

```
Think: "What does the DAO need?"
├── Need stability? → USDC
├── Need BTC reserves? → cbBTC
├── Need liquidity? → LP
├── Need deflation? → DONUT

PROS:
├── Contributes to protocol health
├── May increase DONUT value long-term
└── Community-minded

CONS:
├── May sacrifice short-term APR
└── Requires understanding of DAO needs
```

---

## Viewing Your Votes

After voting, you can see your allocation:

```
┌─────────────────────────────────────────────────────────────────┐
│  YOUR VOTES THIS EPOCH                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  cbBTC:  50% (5,000 gDONUT)  ████████████████████               │
│  USDC:   30% (3,000 gDONUT)  ████████████                       │
│  DONUT:  20% (2,000 gDONUT)  ████████                           │
│  LP:      0% (0 gDONUT)      -                                  │
│                                                                 │
│  Status: VOTED                                                  │
│  Next vote available: 4d 12h 30m                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Resetting Votes

To clear all your votes (required before unstaking):

```
voter.reset()
```

**What Reset Does:**
1. Removes votes from all strategies
2. Withdraws from all bribe contracts
3. Sets account_UsedWeights to 0
4. Records lastVoted timestamp

**When to Reset:**
- Before unstaking gDONUT
- To stop earning rewards (if desired)
- To free up voting power

**Important:**
- Can only reset once per epoch (same as voting)
- Claim rewards before resetting!

---

## Common Issues

### "Already voted this epoch"

You can only vote OR reset once per epoch. Wait for the next epoch.

### "Zero total weight"

You must allocate to at least one strategy with weight > 0.

### "Cannot unstake with active votes"

Reset your votes first, then unstake.

### Votes seem to have no effect

Remember:
- Your votes are weighted by your gDONUT balance
- Impact = your balance / total votes on that strategy
- Small balances have proportionally small impact

---

## Next Steps

- [Revenue Distribution](revenue.md) - How your votes affect revenue flow
- [Bribe Rewards & APR](rewards.md) - What you earn for voting
