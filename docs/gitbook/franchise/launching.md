# Launching a Token

Complete guide to launching your own token on Franchise.

---

## Prerequisites

Before launching, you need:

1. **DONUT tokens** - For initial liquidity (minimum set by Core contract)
2. **ETH** - For gas fees (~0.01-0.02 ETH)
3. **Token details** - Name, symbol, metadata
4. **Configuration decisions** - Emission rates, epoch periods

---

## Launch Parameters

| Parameter | Description | Typical Value | Constraints |
|-----------|-------------|---------------|-------------|
| `tokenName` | Display name | "MyToken" | Any string |
| `tokenSymbol` | Ticker | "MTK" | Any string |
| `unitUri` | Metadata URI | "ipfs://..." | Valid URI |
| `donutAmount` | Initial liquidity | 100,000 DONUT | ≥ minDonutForLaunch |
| `initialUps` | Starting emission | 4 tokens/sec | 1 - 1e24 |
| `tailUps` | Minimum emission | 0.01 tokens/sec | 1 - initialUps |
| `halvingPeriod` | Halving frequency | 30 days | ≥ 1 day |
| `rigEpochPeriod` | Mining epoch | 1 hour | 10 min - 365 days |
| `rigPriceMultiplier` | Price reset | 2x (2e18) | 1.1x - 3x |
| `rigMinInitPrice` | Price floor | 0.0001 ETH | ≥ 1e6 |
| `auctionInitPrice` | Auction start | 1 LP | Any |
| `auctionEpochPeriod` | Auction duration | 24 hours | 1 hour - 365 days |
| `auctionPriceMultiplier` | Auction reset | 1.2x | 1.1x - 3x |
| `auctionMinInitPrice` | Auction floor | 0.001 LP | ≥ 1e6 |

---

## Step-by-Step Launch

### Step 1: Prepare Your DONUT

Ensure you have enough DONUT in your wallet:

```
Required: At least minDonutForLaunch (check Core contract)
Recommended: 100,000+ DONUT for meaningful liquidity
```

### Step 2: Navigate to Franchise

Go to [glazecorp.com/franchise](https://glazecorp.com/franchise) and click "Launch".

### Step 3: Configure Your Token

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  LAUNCH NEW TOKEN                                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  TOKEN DETAILS                                                              │
│  ─────────────                                                              │
│  Name:    [MyAwesomeToken________________]                                  │
│  Symbol:  [MAT___]                                                          │
│  URI:     [ipfs://QmYourMetadataHash_____]                                 │
│                                                                             │
│  LIQUIDITY                                                                  │
│  ─────────                                                                  │
│  DONUT Amount: [100000_________] DONUT                                     │
│  Your balance: 150,000 DONUT                                               │
│                                                                             │
│  EMISSION SETTINGS                                                          │
│  ────────────────                                                           │
│  Initial Rate:    [4_______] tokens/second                                 │
│  Tail Rate:       [0.01____] tokens/second                                 │
│  Halving Period:  [30______] days                                          │
│                                                                             │
│  MINING SETTINGS                                                            │
│  ──────────────                                                             │
│  Epoch Period:     [1_______] hours                                        │
│  Price Multiplier: [2_______]x                                             │
│  Min Init Price:   [0.0001__] ETH                                          │
│                                                                             │
│  AUCTION SETTINGS                                                           │
│  ───────────────                                                            │
│  Epoch Period:     [24______] hours                                        │
│  Price Multiplier: [1.2_____]x                                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Step 4: Approve DONUT

First transaction - approve Core contract:

```
Transaction 1: Approve
├── Contract: DONUT token
├── Spender: Core contract
├── Amount: Your launch amount
└── Gas: ~50,000
```

### Step 5: Launch

Second transaction - execute launch:

```
Transaction 2: Launch
├── Contract: Core (via Multicall)
├── Function: launch(params)
├── Gas: ~3,000,000 (creates multiple contracts)
└── Result: All contracts created
```

### Step 6: Confirm Success

After launch, you'll receive:

```
LAUNCH SUCCESSFUL!

Created Contracts:
├── UNIT Token: 0x1234...
├── Rig:        0x5678...
├── Auction:    0x9abc...
└── LP Token:   0xdef0...

Initial Liquidity:
├── 100,000 DONUT
├── 1,000,000 MAT (initial mint to pool)
└── LP tokens BURNED to 0xdead

Your token is now live!
```

---

## Configuration Guide

### Emission Rate

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    EMISSION RATE CONSIDERATIONS                             │
└─────────────────────────────────────────────────────────────────────────────┘

  HIGH INITIAL RATE (10+ tokens/sec):
  ├── Fast initial distribution
  ├── More tokens in circulation quickly
  ├── Good for: High activity, large communities
  └── Risk: May inflate supply too fast

  LOW INITIAL RATE (1-4 tokens/sec):
  ├── Slower distribution
  ├── More scarcity early on
  ├── Good for: Smaller communities, longer timeline
  └── Risk: May discourage miners if rewards too low

  RECOMMENDATION:
  └── Start with 4 tokens/sec (same as DONUT) for balanced approach
```

### Epoch Period

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    EPOCH PERIOD CONSIDERATIONS                              │
└─────────────────────────────────────────────────────────────────────────────┘

  SHORT EPOCHS (10-30 minutes):
  ├── More frequent mining opportunities
  ├── Lower barriers to entry (lower prices)
  ├── Good for: Active, engaged communities
  └── Risk: May be too chaotic

  MEDIUM EPOCHS (1-6 hours):
  ├── Balanced approach
  ├── Time for price decay
  ├── Good for: Most projects
  └── RECOMMENDED

  LONG EPOCHS (12-24 hours):
  ├── Fewer mining events
  ├── Larger price swings
  ├── Good for: Slower-paced communities
  └── Risk: Less engagement
```

### Halving Period

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    HALVING PERIOD CONSIDERATIONS                            │
└─────────────────────────────────────────────────────────────────────────────┘

  SHORT HALVING (7-14 days):
  ├── Rapid emission reduction
  ├── Quick transition to scarcity
  ├── Good for: Short-term campaigns
  └── Risk: Early miners get disproportionate share

  MEDIUM HALVING (30 days):
  ├── Balanced approach (same as DONUT)
  ├── Gradual transition
  ├── Good for: Most projects
  └── RECOMMENDED

  LONG HALVING (60-90 days):
  ├── Extended high emission period
  ├── More even distribution over time
  ├── Good for: Long-term projects
  └── Risk: Inflation concerns
```

---

## After Launch

### What You Can Do

As the launcher (Rig owner), you can:

```
✓ Update metadata URI
✓ Change team address (fee recipient)
✓ Transfer ownership
```

### What You Cannot Do

```
✗ Mint additional tokens
✗ Change emission rates
✗ Remove liquidity
✗ Pause mining
✗ Change fee percentages
```

---

## Promoting Your Token

After launch:

1. **Share the Rig address** - Direct link to mining page
2. **Announce on socials** - Let your community know
3. **Explain the mechanics** - Educate on Dutch auction mining
4. **Engage miners** - Build community around the mining game

---

## Next Steps

- [Rig Mining](mining-rigs.md) - How your token's mining works
- [Auctions & Liquidity](auctions.md) - Treasury management
