# Rig Mining

How mining works on Franchise tokens - identical mechanics to DONUT mining.

---

## Rig Overview

Each Franchise token has its own Rig contract that handles mining:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          RIG CONTRACT                                       │
└─────────────────────────────────────────────────────────────────────────────┘

  DONUT MINER                           FRANCHISE RIG
  ───────────                           ─────────────
  • Mints DONUT                         • Mints UNIT tokens
  • 80/20 fee split                     • 80/15/4/1 fee split
  • Single global miner                 • Per-token miner
  • Same mechanics                      • Same mechanics
```

---

## Mining Mechanics

Franchise Rigs use the exact same Dutch auction mechanism as DONUT:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      RIG MINING CYCLE                                       │
└─────────────────────────────────────────────────────────────────────────────┘

  EPOCH N                                EPOCH N+1
  ────────                               ────────

  initPrice ████                         newInitPrice ████
                ████                                      ████
                    ████                                      ████
                        ████ ← Mine!                              ████
                            │
              ┌─────────────┴─────────────┐
              │                           │
              │  1. Miner pays WETH       │
              │  2. Previous miner gets:  │
              │     • UNIT tokens         │
              │     • 80% of payment      │
              │  3. Fees distributed      │
              │  4. New epoch starts      │
              │                           │
              └───────────────────────────┘
```

---

## Fee Distribution

Franchise Rigs have a different fee split than DONUT:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      FEE DISTRIBUTION                                       │
└─────────────────────────────────────────────────────────────────────────────┘

  MINING PAYMENT (e.g., 0.1 ETH)
           │
           ├──► 80% → Previous Miner (0.08 ETH)
           │
           ├──► 15% → Treasury (0.015 ETH)
           │          └── Accumulates for LP auctions
           │
           ├──► 4%  → Team (0.004 ETH)
           │          └── Launcher's configured address
           │
           └──► 1%  → Protocol (0.001 ETH)
                      └── GlazeCorp
```

---

## Token Minting

Tokens are minted based on time held:

```
TOKENS MINTED = timeAsMiner × currentUPS

Example:
├── UPS: 4 tokens/second
├── Time held: 2 hours = 7,200 seconds
└── Tokens minted: 7,200 × 4 = 28,800 UNIT tokens
```

---

## Emission Schedule

Same halving mechanics as DONUT:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      EMISSION HALVING                                       │
└─────────────────────────────────────────────────────────────────────────────┘

  UPS
  (tokens/sec)
      │
    4 │████████
      │        │
    2 │        ████████
      │                │
    1 │                ████████
      │
 0.01 │.................................████████████████████
      └──────────────────────────────────────────────────────► Time
           Period 1   Period 2   Period 3      Tail

  At tail emission, rate stays constant forever
```

---

## How to Mine

### Using the WebApp

1. Navigate to the Rig's page: `/franchise/[rigAddress]`
2. View current price and emission rate
3. Enter max price (slippage protection)
4. Click "MINE"
5. Confirm transaction

### Using the Multicall

```javascript
// Mine with ETH (auto-wraps to WETH)
await multicall.mine(
  rigAddress,
  currentEpochId,
  deadline,
  maxPrice,
  "optional metadata uri",
  { value: maxPrice }
);
```

### Direct Rig Call

```javascript
// First approve WETH
await weth.approve(rigAddress, maxPrice);

// Then mine
await rig.mine(
  minerAddress,    // Who receives future tokens
  epochId,         // Current epoch (frontrun protection)
  deadline,        // Transaction deadline
  maxPrice,        // Slippage protection
  "metadata uri"   // Optional
);
```

---

## Mining Strategy

### Similar to DONUT Mining

All strategies from the [DONUT Mining Strategy Guide](../mining/strategy-guide.md) apply:

- Wait for price decay (30-50%)
- Consider gas costs
- Monitor activity levels
- Factor in emission rates

### Key Differences

```
DONUT MINING:
├── Single global miner
├── Very active (more competition)
├── Established price patterns
└── Higher stakes

FRANCHISE MINING:
├── Per-token miner
├── Activity varies by token
├── New price discovery
├── Often less competition
└── Higher variance in returns
```

---

## Rig State

View current rig state:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  RIG: MyAwesomeToken (MAT)                                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Current Price:     0.05 ETH (50% decay)                                   │
│  Epoch ID:          47                                                      │
│  Time Left:         32 minutes                                             │
│                                                                             │
│  Current Miner:     0x1234...5678                                          │
│  Mining Since:      28 minutes ago                                          │
│  Pending Tokens:    6,720 MAT                                              │
│                                                                             │
│  Emission Rate:     4 MAT/sec                                              │
│  Next Rate:         2 MAT/sec (in 12 days)                                 │
│                                                                             │
│  [  MINE  ]                                                                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Next Steps

- [Auctions & Liquidity](auctions.md) - Treasury mechanics
- [Mining Strategy Guide](../mining/strategy-guide.md) - Optimize returns
