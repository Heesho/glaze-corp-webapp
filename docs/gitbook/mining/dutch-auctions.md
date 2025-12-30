# Dutch Auction Mechanics

Dutch auctions are the core mechanism for fair token distribution in GlazeCorp. Understanding them is key to maximizing your returns.

---

## What is a Dutch Auction?

A Dutch auction starts at a high price and decreases over time until someone buys. This is the opposite of a traditional "English" auction where prices increase.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    DUTCH vs ENGLISH AUCTION                                 │
└─────────────────────────────────────────────────────────────────────────────┘

  ENGLISH AUCTION (Traditional)          DUTCH AUCTION (GlazeCorp)

  Price                                   Price
    │           ████                        │ ████
    │       ████                            │     ████
    │   ████                                │         ████
    │ ██                                    │             ████
    └────────────────► Time                 └────────────────────► Time

  "Going once, going twice..."            "Price dropping..."
  Bidders compete UP                      First buyer wins
  Emotional, competitive                  Rational, patient
```

---

## Why Dutch Auctions for Token Distribution?

### Problem: Snipers and Front-runners

Traditional token launches suffer from:

```
TRADITIONAL LAUNCH PROBLEMS

1. SNIPERS
   ┌───────────────────────────────────────────────┐
   │  Bots detect launch → Buy instantly          │
   │  Regular users get nothing or pay more       │
   └───────────────────────────────────────────────┘

2. FRONT-RUNNING
   ┌───────────────────────────────────────────────┐
   │  MEV bots see your transaction               │
   │  Insert their buy before yours               │
   │  You get worse price                         │
   └───────────────────────────────────────────────┘

3. WHALE DOMINATION
   ┌───────────────────────────────────────────────┐
   │  Rich buyers gobble up supply                │
   │  Small buyers priced out                     │
   └───────────────────────────────────────────────┘
```

### Solution: Dutch Auctions

```
DUTCH AUCTION ADVANTAGES

1. BEING FIRST = WORST DEAL
   ┌───────────────────────────────────────────────┐
   │  Sniping means paying MAXIMUM price          │
   │  No advantage to speed                       │
   │  Patience is rewarded                        │
   └───────────────────────────────────────────────┘

2. FRONT-RUNNING UNPROFITABLE
   ┌───────────────────────────────────────────────┐
   │  Front-runner pays higher price              │
   │  Victim gets lower price                     │
   │  MEV attack benefits the victim!            │
   └───────────────────────────────────────────────┘

3. FAIR ACCESS
   ┌───────────────────────────────────────────────┐
   │  Everyone sees the same price                │
   │  No hidden deals or whitelists              │
   │  Market finds natural clearing price        │
   └───────────────────────────────────────────────┘
```

---

## The Math

### Linear Price Decay

GlazeCorp uses a linear decay function:

```
currentPrice = initPrice × (epochPeriod - elapsed) / epochPeriod
```

Where:
- `initPrice` = Starting price for this epoch
- `epochPeriod` = Total epoch duration (e.g., 3600 seconds = 1 hour)
- `elapsed` = Time since epoch started

### Visual: Price Over Time

```
Price
  │
1.0│██
   │  ██
0.8│    ██
   │      ██
0.6│        ██
   │          ██
0.4│            ██
   │              ██
0.2│                ██
   │                  ██
0.0│____________________██
   └──────────────────────────► Time (% of epoch)
   0%   20%   40%   60%   80%  100%
```

### Price Table (1 ETH initPrice, 1 hour epoch)

| Time Elapsed | % Elapsed | Current Price | You Save |
|--------------|-----------|---------------|----------|
| 0 min | 0% | 1.000 ETH | 0% |
| 6 min | 10% | 0.900 ETH | 10% |
| 12 min | 20% | 0.800 ETH | 20% |
| 18 min | 30% | 0.700 ETH | 30% |
| 24 min | 40% | 0.600 ETH | 40% |
| 30 min | 50% | 0.500 ETH | 50% |
| 36 min | 60% | 0.400 ETH | 60% |
| 42 min | 70% | 0.300 ETH | 70% |
| 48 min | 80% | 0.200 ETH | 80% |
| 54 min | 90% | 0.100 ETH | 90% |
| 60 min | 100% | 0.000 ETH | 100% (free!) |

---

## Price Multiplier Effect

When someone mines, the next epoch's initPrice is set:

```
newInitPrice = paymentPrice × PRICE_MULTIPLIER
```

With a 2x multiplier:

```
EPOCH PROGRESSION EXAMPLE

Epoch 1: initPrice = 1.00 ETH
         Someone mines at 0.50 ETH (50% decay)

Epoch 2: initPrice = 0.50 × 2 = 1.00 ETH
         Someone mines at 0.25 ETH (75% decay)

Epoch 3: initPrice = 0.25 × 2 = 0.50 ETH
         Someone mines at 0.40 ETH (20% decay)

Epoch 4: initPrice = 0.40 × 2 = 0.80 ETH
         ...
```

### Price Discovery

This creates natural price discovery:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        PRICE DISCOVERY                                      │
└─────────────────────────────────────────────────────────────────────────────┘

  HIGH DEMAND                              LOW DEMAND
  People mine early                        People wait longer
  (pay higher prices)                      (pay lower prices)
        │                                        │
        ▼                                        ▼
  Next epoch starts                        Next epoch starts
  with higher initPrice                    with lower initPrice
        │                                        │
        ▼                                        ▼
  Market signals                           Market signals
  high value                               lower value

  This creates a self-adjusting system that finds equilibrium!
```

---

## Protection Mechanisms

### Epoch ID (Frontrun Protection)

Every mining call requires the current `epochId`:

```solidity
function mine(
    address miner,
    address provider,
    uint256 epochId,    // Must match current epoch
    uint256 deadline,
    uint256 maxPrice,
    string memory uri
) external;
```

If someone mines before you:
- The epochId increments
- Your transaction fails (mismatch)
- You're protected from bad prices

### Max Price (Slippage Protection)

You set the maximum price you're willing to pay:

```solidity
if (price > maxPrice) revert Miner__MaxPriceExceeded();
```

This prevents:
- Paying more than intended
- Surprise price changes between submission and execution

### Deadline

Transactions expire after your deadline:

```solidity
if (block.timestamp > deadline) revert Miner__Expired();
```

Prevents:
- Stale transactions executing at unexpected times
- Delayed transactions from network congestion

---

## Strategy Implications

### When to Mine

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     STRATEGIC CONSIDERATIONS                                │
└─────────────────────────────────────────────────────────────────────────────┘

  EARLY (0-25% decay)
  ├── Pro: Secure the position quickly
  ├── Pro: More time to earn DONUT
  ├── Con: Highest price
  └── Con: Next miner pays more → higher multiplied initPrice

  MID (25-50% decay)
  ├── Pro: Balanced risk/reward
  ├── Pro: Still good time to earn
  └── Con: Others might take it first

  LATE (50-75% decay)
  ├── Pro: Much lower price
  ├── Pro: Better ROI potential
  ├── Con: Risk of someone else mining first
  └── Con: Less time if epoch ends

  VERY LATE (75-100% decay)
  ├── Pro: Minimum price
  ├── Con: High competition (everyone waiting)
  ├── Con: Might miss the window
  └── Con: Very low initPrice for next epoch
```

### Optimal Play

```
The "optimal" time depends on:

1. CURRENT DPS (emission rate)
   Higher DPS → earlier mining more valuable

2. ACTIVITY LEVEL
   High activity → can't wait too long
   Low activity → wait for lower prices

3. YOUR CAPITAL
   More capital → can afford early entry
   Less capital → need to wait for better prices

4. RISK TOLERANCE
   Risk-averse → mine earlier to secure position
   Risk-tolerant → wait for lower prices
```

---

## Common Mistakes

### Mistake 1: Mining at Epoch Start

```
BAD: Mining immediately when epoch starts
     ├── Paying maximum price
     └── Everyone else gets better deals

BETTER: Wait for reasonable decay
        ├── 30-50% decay is often sweet spot
        └── Balance between price and security
```

### Mistake 2: Waiting Too Long

```
BAD: Waiting until price is almost 0
     ├── High competition at low prices
     ├── Might miss the window
     └── Very low initPrice hurts next epoch

BETTER: Accept good price, don't chase perfect
```

### Mistake 3: Ignoring Gas Costs

```
BAD: Mining 0.001 ETH worth, paying 0.005 ETH gas
     ├── Net loss on transaction

BETTER: Factor in gas
        ├── totalCost = price + gas
        ├── Wait for price drops that exceed gas savings
```

---

## Next Steps

- [Emission Schedule](emissions.md) - How DPS changes over time
- [Mining Strategy Guide](strategy-guide.md) - Complete optimization guide
