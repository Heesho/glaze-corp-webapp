# Auctions & Liquidity

How Franchise treasury auctions work and the permanent liquidity mechanism.

---

## Treasury Accumulation

15% of all mining fees accumulate in the Rig's treasury:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    TREASURY ACCUMULATION                                    │
└─────────────────────────────────────────────────────────────────────────────┘

  Mining Event #1: 0.1 ETH paid
  └── Treasury: +0.015 ETH

  Mining Event #2: 0.08 ETH paid
  └── Treasury: +0.012 ETH

  Mining Event #3: 0.15 ETH paid
  └── Treasury: +0.0225 ETH

  Total Treasury: 0.0495 ETH

  This WETH is available for auction purchase.
```

---

## Treasury Auctions

The treasury WETH is sold through Dutch auctions, but with a twist:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    AUCTION MECHANISM                                        │
└─────────────────────────────────────────────────────────────────────────────┘

  STANDARD STRATEGY AUCTION           FRANCHISE TREASURY AUCTION
  ─────────────────────────           ──────────────────────────

  Sells: WETH                         Sells: WETH
  Payment: cbBTC/USDC/DONUT          Payment: LP TOKENS
  Result: Payment to DAO             Result: LP TOKENS BURNED

  The key difference: LP tokens paid are BURNED, not kept!
```

---

## LP Burning Mechanism

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    LP BURNING EFFECT                                        │
└─────────────────────────────────────────────────────────────────────────────┘

  BEFORE AUCTION:
  ├── LP Total Supply: 100,000
  ├── Your LP Balance: 1,000 (1% of pool)
  └── Pool Value: $10,000 total

  AUCTION PURCHASE:
  ├── Buyer pays: 500 LP tokens
  ├── Buyer receives: 0.5 ETH from treasury
  └── 500 LP tokens → BURNED

  AFTER AUCTION:
  ├── LP Total Supply: 99,500 (decreased!)
  ├── Your LP Balance: 1,000 (now 1.005% of pool)
  └── Your share increased!

  EFFECT: Each LP token represents larger pool share
```

---

## Why Burn LP?

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    BENEFITS OF LP BURNING                                   │
└─────────────────────────────────────────────────────────────────────────────┘

  1. DEFLATIONARY LP SUPPLY
     └── Each remaining LP worth more over time

  2. REWARDS LONG-TERM HOLDERS
     └── If you don't sell LP, your share grows

  3. CREATES VALUE FLOOR
     └── Underlying pool assets remain, supply shrinks

  4. ALIGNS INCENTIVES
     └── Encourages holding LP vs dumping
```

---

## Auction Parameters

| Parameter | Description | Typical Value |
|-----------|-------------|---------------|
| `initPrice` | Starting LP price | 1 LP per WETH |
| `epochPeriod` | Auction duration | 24 hours |
| `priceMultiplier` | Reset multiplier | 1.2x |
| `minInitPrice` | Price floor | 0.001 LP |

---

## Participating in Auctions

### As a Buyer

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  TREASURY AUCTION                                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Available WETH:  0.5 ETH                                                  │
│  Current Price:   0.0012 LP per WETH (total: 0.0006 LP)                   │
│  Time Left:       18 hours                                                 │
│                                                                             │
│  Your LP Balance: 0.05 LP                                                  │
│                                                                             │
│  [  BUY TREASURY  ]                                                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

Steps:
1. Check current price and treasury balance
2. Approve LP tokens for Auction contract
3. Call buy() with max LP you're willing to pay
4. Receive WETH, your LP tokens are burned
```

### Profitability Calculation

```
Is this auction profitable?

Treasury WETH: 0.5 ETH ($1,750 at $3,500/ETH)
Current LP Price: 0.0006 LP total
LP Token Value: $2,500 per LP (example)
Cost: 0.0006 × $2,500 = $1.50

Value received: $1,750
Cost: $1.50
Profit: $1,748.50

(Extreme example - prices decay to make auctions attractive)
```

---

## Permanent Liquidity

At launch, initial LP tokens are burned:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    INITIAL LP BURNING                                       │
└─────────────────────────────────────────────────────────────────────────────┘

  LAUNCH:
  ├── DONUT deposited: 100,000
  ├── UNIT minted: 1,000,000
  ├── LP tokens created: X
  └── LP tokens sent to: 0x000000000000000000000000000000000000dEaD

  RESULT:
  ├── NO ONE holds initial LP
  ├── Liquidity can NEVER be removed
  ├── Token is ALWAYS tradeable
  └── Rug pull is IMPOSSIBLE

  The 0xdead address:
  ├── Not controlled by anyone
  ├── Tokens sent there are unrecoverable
  └── Standard "burn" address in crypto
```

---

## Liquidity Growth

Over time, liquidity can grow through:

```
1. TRADING FEES
   └── 0.3% of each trade adds to pool

2. NEW LP PROVIDERS
   └── Others can add liquidity to the pool

3. NATURAL PRICE APPRECIATION
   └── If token value increases, pool value increases
```

But it can NEVER decrease from rug pull because initial LP is burned.

---

## Viewing Auction State

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  AUCTION STATE                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Epoch ID:           12                                                     │
│  Init Price:         0.002 LP per WETH                                     │
│  Current Price:      0.0008 LP per WETH (60% decay)                        │
│  Time Left:          9h 45m                                                │
│                                                                             │
│  Treasury Assets:                                                          │
│  ├── WETH: 0.75                                                            │
│  └── Total Value: ~$2,625                                                  │
│                                                                             │
│  To purchase all at current price:                                         │
│  └── 0.75 × 0.0008 = 0.0006 LP tokens                                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Next Steps

- [Overview](overview.md) - Back to Franchise basics
- [Launching](launching.md) - Launch your own token
