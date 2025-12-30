# Revenue Distribution

How protocol revenue flows from source to strategies to the DAO treasury.

---

## Revenue Flow Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        COMPLETE REVENUE FLOW                                │
└─────────────────────────────────────────────────────────────────────────────┘

  REVENUE SOURCES                           DESTINATION
  ─────────────────                         ───────────

  Mining Fees (20%)  ───┐
                        │
  Franchise Fees (15%) ─┼──►  REVENUE ROUTER  ──►  VOTER  ──► STRATEGIES
                        │          │                              │
  Other Sources ────────┘          │                              │
                                   ▼                              │
                              Accumulates                         │
                              WETH                                ▼
                                                          ┌───────────────┐
                                                          │  STRATEGY     │
                                                          │  AUCTIONS     │
                                                          │               │
                                                          │  Sell WETH    │
                                                          │  for payment  │
                                                          │  tokens       │
                                                          └───────┬───────┘
                                                                  │
                                                    ┌─────────────┴─────────────┐
                                                    ▼                           ▼
                                              BRIBE SPLIT               DAO TREASURY
                                              (to voters)              (payment tokens)
```

---

## Step 1: Revenue Collection

Revenue accumulates in the RevenueRouter:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        REVENUE ROUTER                                       │
└─────────────────────────────────────────────────────────────────────────────┘

  INCOMING:
  ├── Mining treasury fees (WETH)
  ├── Franchise treasury fees (WETH)
  └── Other protocol revenue (WETH)

  FUNCTION:
  ├── Accumulates WETH over time
  ├── flush() sends all to Voter
  └── Anyone can call flush()

  Example:
  ├── Day 1-3: Mining generates 5 WETH
  ├── Day 3: flush() called
  └── 5 WETH → Voter contract
```

---

## Step 2: Vote-Weighted Distribution

The Voter distributes revenue proportionally:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        VOTER DISTRIBUTION                                   │
└─────────────────────────────────────────────────────────────────────────────┘

  Revenue arrives: 10 WETH
  Total votes: 1,000,000 gDONUT

  Vote Distribution:
  ├── cbBTC Strategy: 400,000 votes (40%)
  ├── USDC Strategy:  300,000 votes (30%)
  ├── DONUT Strategy: 200,000 votes (20%)
  └── LP Strategy:    100,000 votes (10%)

  Revenue Distribution:
  ├── cbBTC Strategy: 4 WETH
  ├── USDC Strategy:  3 WETH
  ├── DONUT Strategy: 2 WETH
  └── LP Strategy:    1 WETH

  FORMULA:
  strategyShare = (strategyWeight / totalWeight) × revenue
```

### Index Mechanism

The Voter uses a global index for efficient distribution:

```solidity
// When revenue arrives
uint256 _ratio = amount * 1e18 / totalWeight;
index += _ratio;

// Each strategy tracks its own index
// Delta between global and strategy index = pending revenue
```

This allows:
- O(1) revenue notification
- Lazy claiming per strategy
- Gas-efficient for many strategies

---

## Step 3: Strategy Auctions

Each strategy sells its WETH via Dutch auction:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        STRATEGY AUCTION                                     │
└─────────────────────────────────────────────────────────────────────────────┘

  EXAMPLE: cbBTC Strategy has 4 WETH

  AUCTION PARAMETERS:
  ├── initPrice: 0.0002 cbBTC per WETH
  ├── epochPeriod: 24 hours
  ├── priceMultiplier: 1.2x
  └── minInitPrice: 0.00001 cbBTC per WETH

  AUCTION PROGRESSION:
  ├── Hour 0: Price = 0.0002 cbBTC/WETH → Total cost = 0.0008 cbBTC
  ├── Hour 6: Price = 0.00015 cbBTC/WETH → Total cost = 0.0006 cbBTC
  ├── Hour 12: Price = 0.0001 cbBTC/WETH → Total cost = 0.0004 cbBTC
  ├── Hour 18: Price = 0.00005 cbBTC/WETH → Total cost = 0.0002 cbBTC
  └── Hour 24: Price = 0 → Free!

  BUYER PURCHASES:
  ├── Buyer pays: 0.0004 cbBTC (at hour 12)
  ├── Buyer receives: 4 WETH
  └── Strategy receives: 0.0004 cbBTC
```

---

## Step 4: Bribe Split

When a strategy auction is purchased, payment is split:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        BRIBE SPLIT                                          │
└─────────────────────────────────────────────────────────────────────────────┘

  Payment received: 0.0004 cbBTC
  bribeSplit: 30% (configurable by governance)

  SPLIT:
  ├── Bribe contract: 0.00012 cbBTC (30%)
  └── DAO treasury:   0.00028 cbBTC (70%)

  The bribe portion goes to voters who voted for this strategy.
```

---

## Step 5: DAO Treasury

The non-bribe portion accumulates in the DAO treasury:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        DAO TREASURY                                         │
└─────────────────────────────────────────────────────────────────────────────┘

  ACCUMULATED ASSETS:
  ├── cbBTC: from cbBTC strategy auctions
  ├── USDC:  from USDC strategy auctions
  ├── DONUT: from DONUT strategy auctions (buybacks!)
  └── LP:    from LP strategy auctions

  CONTROLLED BY:
  └── DAO governance (Governor contract)

  POTENTIAL USES:
  ├── Protocol development
  ├── Liquidity provision
  ├── Grants and bounties
  └── Emergency reserves
```

---

## Triggering Distribution

Distribution happens through these calls:

### 1. Flush Revenue

```solidity
revenueRouter.flush();
// Sends accumulated WETH to Voter
// Anyone can call this
```

### 2. Distribute to Strategies

```solidity
voter.distribute(strategyAddress);
// Sends accumulated revenue to one strategy

voter.distributeAll();
// Distributes to all strategies
```

### 3. Buy from Auction

```solidity
strategy.buy(receiver, epochId, deadline, maxPayment);
// Buyer purchases WETH, triggers bribe split
```

---

## Revenue Flow Diagram

```
                                    ┌───────────────┐
                                    │               │
                                    │    MINERS     │
                                    │               │
                                    └───────┬───────┘
                                            │
                                            │ 20% fee
                                            ▼
┌───────────────┐    flush()    ┌───────────────────────┐
│               │◄──────────────│                       │
│    VOTER      │               │   REVENUE ROUTER      │
│               │               │                       │
└───────┬───────┘               └───────────────────────┘
        │
        │ distribute()
        │
        ├───────────────────────────────────────────────────────┐
        │                           │                           │
        ▼                           ▼                           ▼
┌───────────────┐           ┌───────────────┐           ┌───────────────┐
│ cbBTC Strategy│           │ USDC Strategy │           │ DONUT Strategy│
│               │           │               │           │               │
│   4 WETH      │           │   3 WETH      │           │   2 WETH      │
└───────┬───────┘           └───────┬───────┘           └───────┬───────┘
        │                           │                           │
        │ buy()                     │ buy()                     │ buy()
        ▼                           ▼                           ▼
┌───────────────┐           ┌───────────────┐           ┌───────────────┐
│ Buyer pays    │           │ Buyer pays    │           │ Buyer pays    │
│ cbBTC         │           │ USDC          │           │ DONUT         │
└───────┬───────┘           └───────┬───────┘           └───────┬───────┘
        │                           │                           │
        │ split                     │ split                     │ split
        ▼                           ▼                           ▼
   ┌────┴────┐                 ┌────┴────┐                 ┌────┴────┐
   ▼         ▼                 ▼         ▼                 ▼         ▼
Bribe     Treasury          Bribe     Treasury          Bribe     Treasury
(30%)      (70%)            (30%)      (70%)            (30%)      (70%)
```

---

## Key Parameters

| Parameter | Value | Description |
|-----------|-------|-------------|
| `DURATION` | 7 days | Voting epoch length |
| `MAX_BRIBE_SPLIT` | 50% | Maximum % to bribes |
| `bribeSplit` | Configurable | Current % to bribes |
| Strategy `epochPeriod` | 1h - 365d | Auction duration |
| Strategy `priceMultiplier` | 1.1x - 3x | Price reset multiplier |

---

## Next Steps

- [Bribe Rewards & APR](rewards.md) - How you earn from voting
- [Overview](overview.md) - Back to governance basics
