# How Mining Works

Mining is the primary mechanism for distributing DONUT tokens. Instead of a traditional token sale, DONUT is continuously minted through a competitive Dutch auction.

---

## The Mining Cycle

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           MINING EPOCH CYCLE                                │
└─────────────────────────────────────────────────────────────────────────────┘

  EPOCH N                                          EPOCH N+1
  ───────────────────────────────────────────────  ───────────────────────────

  Price                                            Price
    │                                                │
    │ ████ initPrice                                │ ████ newInitPrice
    │     ████                                       │     ████
    │         ████                                   │         ████
    │             ████                               │             ████
    │                 ████                           │                 ████
    │                     ████ ← Someone mines!     │                     ████
    │                         │                      │
    └─────────────────────────┼──────► Time          └──────────────────────────►
                              │
                              │
              ┌───────────────┴───────────────┐
              │                               │
              │  MINING TRANSACTION           │
              │                               │
              │  1. Miner pays current price  │
              │  2. Previous miner receives:  │
              │     • Minted DONUT tokens     │
              │     • 80% of payment          │
              │  3. Treasury receives 20%     │
              │  4. New epoch starts          │
              │     initPrice = price × 2     │
              │  5. New miner is now active   │
              │                               │
              └───────────────────────────────┘
```

---

## Key Concepts

### Active Miner
The current holder of the mining position. While active, you earn DONUT tokens at the current emission rate (DPS - Donuts Per Second).

### Epoch
A time period during which the auction price decays. Default: **1 hour**.

### Initial Price (initPrice)
The starting price for each epoch. After someone mines:
```
newInitPrice = paymentPrice × PRICE_MULTIPLIER (2x)
```

### Tokens Minted
When someone new mines, the previous miner receives:
```
tokensMinted = timeAsMiner × currentDPS
```

---

## Step-by-Step Example

Let's walk through a complete mining scenario:

```
STARTING STATE
├── initPrice: 0.1 ETH
├── DPS: 4 DONUT/second
├── Active miner: Alice
├── Alice's start time: 10:00:00

TIMELINE
├── 10:00:00 - Alice becomes miner (paid 0.1 ETH when price was there)
├── 10:30:00 - Current price: 0.05 ETH (decayed 50%)
├── 10:45:00 - Current price: 0.025 ETH (decayed 75%)
├── 10:50:00 - Bob decides to mine!

BOB MINES AT 10:50:00
├── Current price: 0.0167 ETH (50 min / 60 min decay)
├── Bob pays: 0.0167 ETH
│
├── ALICE RECEIVES:
│   ├── DONUT: 50 minutes × 60 sec × 4 DPS = 12,000 DONUT
│   └── ETH: 0.0167 × 80% = 0.0134 ETH
│
├── TREASURY RECEIVES:
│   └── ETH: 0.0167 × 20% = 0.0033 ETH
│
└── NEW EPOCH STARTS:
    ├── initPrice: 0.0167 × 2 = 0.0334 ETH
    ├── Active miner: Bob
    └── Bob's start time: 10:50:00
```

---

## Price Decay Formula

The price follows a linear decay from `initPrice` to `0` over the epoch period:

```
currentPrice = initPrice × (epochPeriod - timePassed) / epochPeriod
```

### Visual Representation

```
Price (ETH)
    │
0.10│████████
    │        ████████
0.05│                ████████
    │                        ████████
0.00│________________________________████████
    └────────────────────────────────────────► Time
    0min    15min    30min    45min    60min
```

### Price at Different Times (0.1 ETH initPrice, 1 hour epoch)

| Time | Price | % Decayed |
|------|-------|-----------|
| 0 min | 0.100 ETH | 0% |
| 15 min | 0.075 ETH | 25% |
| 30 min | 0.050 ETH | 50% |
| 45 min | 0.025 ETH | 75% |
| 55 min | 0.0083 ETH | 92% |
| 60 min | 0.000 ETH | 100% (free!) |

---

## Fee Distribution

When you mine, your payment is split:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          FEE DISTRIBUTION                                   │
└─────────────────────────────────────────────────────────────────────────────┘

  YOUR PAYMENT (e.g., 0.1 ETH)
         │
         ├──────────────────────────────────────────► 80% → Previous Miner
         │                                                   (0.08 ETH)
         │
         └──────────────────────────────────────────► 20% → Treasury
                                                            (0.02 ETH)
                                                               │
                                                               ├─► 15% base
                                                               ├─► 4% provider (if referral)
                                                               └─► 1% team
```

### Code Reference

```solidity
// From Miner.sol
uint256 public constant FEE = 2_000;      // 20%
uint256 public constant DIVISOR = 10_000;

uint256 totalFee = price * FEE / DIVISOR;  // 20% of payment
uint256 minerFee = price - totalFee;        // 80% to previous miner
```

---

## What If No One Mines?

If the epoch expires without anyone mining:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         EPOCH EXPIRATION                                    │
└─────────────────────────────────────────────────────────────────────────────┘

  Price
    │
    │ ████
    │     ████
    │         ████
    │             ████
    │                 ████
    │                     ████
    │                         └─── Price reaches 0
    │                               │
    │                               ▼
    │                         Next mine is FREE!
    │                         (But still starts new epoch)
    │
    └────────────────────────────────────────────────────► Time


  WHEN PRICE = 0:
  ├── Payment required: 0 ETH (just gas)
  ├── Previous miner still receives their minted DONUT
  ├── Previous miner receives 0 ETH (80% of 0)
  ├── New initPrice: minInitPrice (0.0001 ETH)
  └── New epoch starts normally
```

---

## Contract Constants

| Constant | Value | Description |
|----------|-------|-------------|
| `EPOCH_PERIOD` | 1 hour | Duration of each epoch |
| `PRICE_MULTIPLIER` | 2x (2e18) | New initPrice = lastPrice × 2 |
| `MIN_INIT_PRICE` | 0.0001 ETH | Floor for initPrice |
| `ABS_MAX_INIT_PRICE` | type(uint192).max | Ceiling for initPrice |
| `FEE` | 20% (2000/10000) | Treasury fee |

---

## Next Steps

- [Dutch Auction Mechanics](dutch-auctions.md) - Deep dive into auction theory
- [Emission Schedule](emissions.md) - How token supply changes over time
- [Mining Strategy Guide](strategy-guide.md) - Maximize your returns
