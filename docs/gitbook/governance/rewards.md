# Bribe Rewards & APR

Understanding how you earn rewards for voting and how APR is calculated.

---

## How Bribe Rewards Work

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        BRIBE REWARD SYSTEM                                  │
└─────────────────────────────────────────────────────────────────────────────┘

  WHEN A STRATEGY AUCTION IS PURCHASED:

  Payment (e.g., 0.001 cbBTC)
           │
           ├──► 30% to Bribe Contract ────► Distributed to voters
           │                                     │
           │                                     ▼
           │                               ┌──────────────────┐
           │                               │  YOUR REWARD =   │
           │                               │  total × (your   │
           │                               │  votes / total   │
           │                               │  votes)          │
           │                               └──────────────────┘
           │
           └──► 70% to DAO Treasury


  REWARD STREAMING:
  ├── Rewards stream over 7 days (DURATION)
  ├── New rewards added to existing stream
  ├── Claim anytime
  └── Rewards accumulate until claimed
```

---

## Reward Calculation

### Per-Strategy Rewards

Your rewards from a strategy depend on:
1. Total rewards sent to that strategy's bribe
2. Your share of votes on that strategy

```
YOUR REWARD = (totalBribeReward × yourVotes) / totalVotesOnStrategy
```

### Example

```
cbBTC Strategy Bribe:
├── Total rewards this period: 0.001 cbBTC
├── Total votes: 400,000 gDONUT
├── Your votes: 40,000 gDONUT (10% share)
└── Your reward: 0.0001 cbBTC

USDC Strategy Bribe:
├── Total rewards this period: 100 USDC
├── Total votes: 300,000 gDONUT
├── Your votes: 30,000 gDONUT (10% share)
└── Your reward: 10 USDC
```

---

## APR Calculation

APR (Annual Percentage Rate) tells you the expected yearly return on your staked gDONUT.

### The Formula

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        APR CALCULATION                                      │
└─────────────────────────────────────────────────────────────────────────────┘

  FROM THE BRIBE CONTRACT:

  rewardsPerToken = (rewardRate × 604800) × 1e18 / totalSupply

  This gives: weekly rewards (in base units) per 1e18 gDONUT staked

  ───────────────────────────────────────────────────────────────────────────

  STEP 1: Get weekly rewards per gDONUT
          weeklyRewards = rewardsPerToken  (in base units)

  STEP 2: Annualize (52 weeks)
          annualRewards = weeklyRewards × 52  (still in base units)

  STEP 3: Convert to human-readable
          annualRewardsHuman = annualRewards / (10 ^ tokenDecimals)

  STEP 4: Convert to USD
          annualRewardsUSD = annualRewardsHuman × tokenPriceUSD
          stakedValueUSD = 1 gDONUT × gDONUTPriceUSD

  STEP 5: Calculate APR
          APR = (annualRewardsUSD / stakedValueUSD) × 100
```

### Real Example: cbBTC Strategy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                   EXAMPLE: cbBTC APR CALCULATION                            │
└─────────────────────────────────────────────────────────────────────────────┘

  Given:
  ├── rewardsPerToken = 2 (from contract)
  ├── cbBTC decimals = 8
  ├── cbBTC price = $100,000
  └── gDONUT price = $0.10

  Step 1: Weekly rewards per gDONUT = 2 base units

  Step 2: Annual rewards = 2 × 52 = 104 base units

  Step 3: Human readable = 104 / 10^8 = 0.00000104 cbBTC

  Step 4: USD values
          Annual rewards USD = 0.00000104 × $100,000 = $0.104
          Staked value USD = 1 × $0.10 = $0.10

  Step 5: APR = ($0.104 / $0.10) × 100 = 104%

  ───────────────────────────────────────────────────────────────────────────

  IMPORTANT: rewardsPerToken = 2 looks tiny, but with 8 decimals
             and high cbBTC price, the APR is actually 104%!
```

---

## Why Small Numbers Can Mean Big APR

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                   TOKEN DECIMALS MATTER                                     │
└─────────────────────────────────────────────────────────────────────────────┘

  cbBTC (8 decimals):
  ├── 1 cbBTC = 100,000,000 base units
  ├── rewardsPerToken = 2 looks small
  └── But 2 base units of cbBTC at $100k = significant value

  USDC (6 decimals):
  ├── 1 USDC = 1,000,000 base units
  ├── rewardsPerToken = 1000 looks larger
  └── But 1000 base units = only 0.001 USDC

  DONUT (18 decimals):
  ├── 1 DONUT = 1,000,000,000,000,000,000 base units
  ├── rewardsPerToken = 1000000000000000 (1e15) looks huge
  └── But that's only 0.001 DONUT

  KEY: Always convert to USD for fair comparison!
```

---

## Claiming Rewards

### When to Claim

```
CLAIM ANYTIME:
├── Rewards accumulate continuously
├── No penalty for waiting
├── No bonus for claiming early
└── Consider gas costs vs reward size

CLAIM BEFORE:
├── Resetting votes
├── Unstaking (if you want those rewards)
└── Strategy changes that might affect accrual
```

### How to Claim

```
┌─────────────────────────────────────────────────────────────────┐
│  PENDING REWARDS                                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  cbBTC:  0.00012 ($12.00)                                      │
│  USDC:   5.50                                                   │
│  DONUT:  100 ($10.00)                                          │
│  LP:     0.5 ($25.00)                                          │
│                                                                 │
│  Total: $52.50                                                  │
│                                                                 │
│  [         CLAIM ALL         ]                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Claiming Transaction

```solidity
// Claims from all bribe contracts you've voted for
voter.claimBribes([bribe1, bribe2, bribe3, bribe4]);
```

---

## Maximizing Your APR

### Strategy 1: Vote High APR Strategies

```
Check current APRs on each strategy
Vote heavier on higher APR strategies
Rebalance each epoch as APRs change

CAUTION:
├── High APR might mean low participation (risk)
├── APRs fluctuate based on auction activity
└── Don't chase APR at expense of diversification
```

### Strategy 2: Compound Rewards

```
1. Claim DONUT rewards
2. Stake additional DONUT
3. Vote with increased power
4. Earn more rewards

This creates exponential growth over time.
```

### Strategy 3: Long-Term Holding

```
Benefits of staying staked:
├── Continuous reward accrual
├── No missed epochs
├── Compound effect over time
└── Lower gas costs (fewer transactions)
```

---

## APR Display on WebApp

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  STRATEGY                          VOTES      APR       EARNED              │
├─────────────────────────────────────────────────────────────────────────────┤
│  ₿  cbBTC Strategy                 42.5%     104%      0.00012 cbBTC       │
│  $  USDC Strategy                  28.3%      45%      5.50 USDC           │
│  🍩 DONUT Strategy                 18.2%      78%      100 DONUT           │
│  🔷 LP Strategy                    11.0%      32%      0.5 LP              │
└─────────────────────────────────────────────────────────────────────────────┘

APR shows expected annual return if current reward rate continues.
Actual returns depend on:
├── Future auction activity
├── Vote distribution changes
├── Token price movements
└── Your continued participation
```

---

## FAQ

### Why is my APR different from displayed?

The displayed APR is based on current rates. Your actual APR depends on:
- When you voted (mid-period vs start)
- Changes in total votes
- Auction frequency

### Do rewards auto-compound?

No. You must:
1. Claim rewards
2. Swap to DONUT (if different token)
3. Stake the DONUT
4. Vote

### What if I don't claim for a long time?

Rewards accumulate indefinitely. There's no expiration. However, consider:
- Gas efficiency of larger claims
- Opportunity cost of not compounding

### Can I lose my rewards?

Unclaimed rewards persist. However, if you reset votes without claiming, you may forfeit pending rewards depending on timing.

---

## Next Steps

- [Staking DONUT](staking.md) - Stake more to earn more
- [Voting on Strategies](voting.md) - Optimize your vote allocation
