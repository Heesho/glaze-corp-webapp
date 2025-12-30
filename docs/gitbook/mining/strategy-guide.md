# Mining Strategy Guide

A comprehensive guide to maximizing your mining returns.

---

## Understanding Your Returns

When you mine, you receive returns from two sources:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         YOUR MINING RETURNS                                 │
└─────────────────────────────────────────────────────────────────────────────┘

  1. MINTED DONUT
     ├── Formula: timeHeld × DPS
     ├── Earned continuously while you're the active miner
     └── Received when someone else mines (or you call claim)

  2. ETH FROM NEXT MINER
     ├── Formula: nextMinerPayment × 80%
     ├── Received when someone else takes over
     └── The longer you wait, the lower their price might be

  TOTAL RETURN = DONUT value + ETH received - ETH paid - gas
```

---

## ROI Calculation

### Basic Formula

```
ROI = (DONUT_value + ETH_received - ETH_paid - gas) / (ETH_paid + gas)
```

### Detailed Example

```
SCENARIO:
├── You pay: 0.05 ETH (when price decayed to this level)
├── Gas cost: 0.002 ETH
├── You hold for: 3 hours
├── DPS: 2 DONUT/sec
├── DONUT price: $0.001
├── ETH price: $3,500
├── Next miner pays: 0.08 ETH

CALCULATIONS:
├── DONUT earned: 3 × 3600 × 2 = 21,600 DONUT
├── DONUT value: 21,600 × $0.001 = $21.60
├── ETH received: 0.08 × 80% = 0.064 ETH = $224
├── ETH paid: 0.05 ETH = $175
├── Gas: 0.002 ETH = $7

RESULT:
├── Total in: $175 + $7 = $182
├── Total out: $21.60 + $224 = $245.60
├── Profit: $63.60
└── ROI: 35%
```

---

## Strategy Matrix

### By Emission Phase

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    STRATEGY BY EMISSION PHASE                               │
└─────────────────────────────────────────────────────────────────────────────┘

  HIGH DPS (4-2 DONUT/sec) - Months 1-2
  ════════════════════════════════════════════════════════════════════════════
  Priority: Maximize mining time
  Entry: Can enter at 20-40% decay (still very profitable)
  Risk: Higher competition, but massive DONUT rewards
  Focus: DONUT accumulation is primary value driver

  ─────────────────────────────────────────────────────────────────────────────

  MEDIUM DPS (1-0.25 DONUT/sec) - Months 3-5
  ════════════════════════════════════════════════════════════════════════════
  Priority: Balance entry price vs mining time
  Entry: Wait for 40-60% decay for better ROI
  Risk: Moderate competition
  Focus: Both DONUT and ETH returns matter

  ─────────────────────────────────────────────────────────────────────────────

  LOW DPS (0.125-0.01 DONUT/sec) - Months 6+
  ════════════════════════════════════════════════════════════════════════════
  Priority: Minimize entry cost
  Entry: Wait for 60-80% decay
  Risk: Lower competition, but also lower DONUT rewards
  Focus: ETH from next miner is primary value driver
```

### By Market Conditions

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    STRATEGY BY MARKET CONDITIONS                            │
└─────────────────────────────────────────────────────────────────────────────┘

  HIGH ACTIVITY (many miners)
  ════════════════════════════════════════════════════════════════════════════
  ├── Faster turnover = quicker returns
  ├── Can enter earlier (someone will mine soon)
  ├── Price typically stays elevated due to 2x multiplier
  └── Focus on DONUT accumulation per hour, not per epoch

  ─────────────────────────────────────────────────────────────────────────────

  LOW ACTIVITY (few miners)
  ════════════════════════════════════════════════════════════════════════════
  ├── Slower turnover = need patience
  ├── Wait for deep discounts (70%+ decay)
  ├── Price will be lower due to late mining
  └── Focus on ROI per ETH spent

  ─────────────────────────────────────────────────────────────────────────────

  VOLATILE MARKET (ETH/DONUT prices moving)
  ════════════════════════════════════════════════════════════════════════════
  ├── Factor in price movements to ROI
  ├── Rising ETH → ETH returns more valuable
  ├── Rising DONUT → DONUT returns more valuable
  └── Consider which asset you want exposure to
```

---

## Entry Timing Guide

### The Decay Spectrum

```
  0%                                                              100%
  │                                                                │
  │  TOO EARLY    │  GOOD ENTRY   │    OPTIMAL    │   RISKY     │
  │───────────────│───────────────│───────────────│─────────────│
  │    0-20%      │    20-40%     │    40-60%     │   60-100%   │
  │               │               │               │              │
  │  Max price    │  Reasonable   │  Sweet spot   │  Cheap but  │
  │  Rarely       │  Good for     │  Best ROI     │  might miss │
  │  worth it     │  high DPS     │  vs risk      │  the window │
```

### Decision Framework

```
SHOULD I MINE NOW?

    ┌─────────────────────────────────────────┐
    │ What is the current price decay %?      │
    └──────────────────┬──────────────────────┘
                       │
           ┌───────────┴───────────┐
           ▼                       ▼
      < 30% decay             > 30% decay
           │                       │
           ▼                       ▼
    ┌─────────────────┐     ┌─────────────────┐
    │ Is DPS > 1?     │     │ Is activity     │
    │                 │     │ high?           │
    └────────┬────────┘     └────────┬────────┘
             │                       │
        ┌────┴────┐             ┌────┴────┐
        ▼         ▼             ▼         ▼
      Yes        No           Yes        No
        │         │             │         │
        ▼         ▼             ▼         ▼
    ┌───────┐ ┌───────┐     ┌───────┐ ┌───────┐
    │CONSIDER│ │ WAIT  │     │ MINE  │ │WAIT   │
    │ MINING │ │ MORE  │     │ NOW   │ │MORE   │
    └───────┘ └───────┘     └───────┘ └───────┘
```

---

## Advanced Tactics

### 1. Epoch Sniping

Target epochs right before they expire (price near 0):

```
PROS:
├── Minimum price (nearly free)
├── Low capital requirement
└── Sets low initPrice for next epoch

CONS:
├── High competition (everyone waiting)
├── Might miss the window
├── Very little ETH return (80% of ~0)
└── Need to hold longer for DONUT value
```

### 2. Momentum Riding

During high activity, mine quickly to ride the wave:

```
High activity → Fast turnover → Quick 80% returns

EXAMPLE:
├── Epoch 1: You pay 0.1 ETH
├── 15 min later: Someone pays 0.2 ETH
├── You receive: 0.16 ETH + DONUT mined
├── Net ETH: +0.06 ETH in 15 minutes!
└── Plus DONUT earned
```

### 3. Gas Optimization

```
TIMING GAS COSTS:
├── Check gas prices before mining
├── Low-priority times: 2-4 AM UTC typically cheaper
├── Avoid: NFT mints, major DeFi events

BATCH AWARENESS:
├── Mining transaction is ~150-200k gas
├── At 30 gwei: ~0.006 ETH
├── At 100 gwei: ~0.02 ETH
├── Factor this into your entry decision
```

### 4. Referral Stacking

If using a referral (provider address):

```
FEE SPLIT WITH REFERRAL:
├── 80% → Previous miner
├── 15% → Treasury
├── 4% → Provider (referrer)
└── 1% → Team

If YOU are the provider:
└── You earn 4% of payments when people use your referral
```

---

## Common Mistakes to Avoid

### Mistake 1: FOMO Mining

```
BAD:
└── "Price just reset, I need to mine NOW!"
    └── You pay maximum price
    └── Everyone else gets better deals

BETTER:
└── Set a target decay % and stick to it
    └── Example: "I only mine below 40% decay"
```

### Mistake 2: Ignoring Gas

```
BAD:
└── Mining 0.01 ETH worth, gas is 0.02 ETH
    └── Net loss of 0.01 ETH immediately

BETTER:
└── Check: is (potential return) > (price + gas)?
└── Skip mining if gas exceeds potential gains
```

### Mistake 3: Holding Forever

```
BAD:
└── "I'll just hold and accumulate forever"
    └── You need someone to mine to receive your DONUT
    └── Long holds in low-activity periods = capital locked

BETTER:
└── Monitor activity levels
└── In low activity, consider claiming manually if available
```

### Mistake 4: Not Checking DPS

```
BAD:
└── Mining at same price in month 1 vs month 6
    └── Month 1: 4 DPS = 14,400 DONUT/hour
    └── Month 6: 0.125 DPS = 450 DONUT/hour

BETTER:
└── Adjust entry price expectations based on current DPS
└── Higher DPS → can pay more
└── Lower DPS → wait for lower prices
```

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    MINING QUICK REFERENCE                                   │
└─────────────────────────────────────────────────────────────────────────────┘

  BEFORE MINING:
  ☐ Check current price and decay %
  ☐ Check current DPS
  ☐ Check recent activity (how fast are epochs turning?)
  ☐ Check gas prices
  ☐ Calculate: potential DONUT × price + likely ETH back - cost - gas

  GOOD ENTRY:
  ☐ Decay > 40% for medium/low DPS
  ☐ Decay > 20% for high DPS (>2)
  ☐ Gas is reasonable (<10% of mining cost)
  ☐ Activity level matches your timeline

  AVOID:
  ☐ Mining at 0% decay (maximum price)
  ☐ Mining when gas > potential short-term returns
  ☐ Mining when you need funds urgently (capital locked until takeover)

  REMEMBER:
  ☐ Your returns = DONUT minted + 80% of next payment - your payment - gas
  ☐ Price × 2 = next epoch's starting price
  ☐ DPS halves every 30 days
```

---

## Next Steps

- [Governance Overview](../governance/overview.md) - Use your DONUT in governance
- [Dutch Auction Mechanics](dutch-auctions.md) - Deeper theory
