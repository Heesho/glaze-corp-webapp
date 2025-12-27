# What is Franchise?

Franchise is GlazeCorp's token launchpad for creating new tokens with permanent liquidity and fair distribution.

---

## The Problem with Token Launches

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    TRADITIONAL LAUNCH PROBLEMS                              │
└─────────────────────────────────────────────────────────────────────────────┘

  1. RUG PULLS
     Launcher provides liquidity → Gets LP tokens → Removes liquidity → RUG
     Users left with worthless tokens

  2. SNIPERS & BOTS
     Bots detect launch → Buy instantly → Dump on retail
     Regular users get worst prices

  3. UNFAIR DISTRIBUTION
     Team allocations, presales, private rounds
     Insiders dump on public

  4. NO LIQUIDITY
     Low initial liquidity → High slippage
     Users can't trade effectively
```

---

## The Franchise Solution

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    FRANCHISE ADVANTAGES                                     │
└─────────────────────────────────────────────────────────────────────────────┘

  1. PERMANENT LIQUIDITY
     LP tokens burned at launch → Liquidity can NEVER be removed
     Rug pulls impossible

  2. SNIPER RESISTANT
     Dutch auction mining → Being first = paying more
     No advantage to speed

  3. FAIR DISTRIBUTION
     Tokens minted through mining over time
     No presale, no team allocation, no insiders

  4. GUARANTEED LIQUIDITY
     Launcher provides DONUT for initial pool
     Token is immediately tradeable
```

---

## How It Works

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    FRANCHISE LAUNCH FLOW                                    │
└─────────────────────────────────────────────────────────────────────────────┘

  LAUNCHER                              CREATED CONTRACTS
  ────────                              ─────────────────

  Provides:                             1. UNIT TOKEN
  • DONUT tokens                           Your new token
  • Token name/symbol                      Mintable only by Rig
  • Parameters
                                        2. RIG
           │                               Mining contract
           │                               Dutch auction
           ▼                               Mints UNIT tokens
  ┌─────────────────┐
  │   CORE.launch() │                   3. AUCTION
  │                 │                      Treasury management
  │   Creates all   │──────────────────►   Burns LP tokens
  │   contracts     │
  │                 │                   4. LP TOKEN
  └─────────────────┘                      UNIT-DONUT pair
           │                               Initial LP burned
           │
           ▼
  ┌─────────────────┐
  │  UNISWAP POOL   │
  │                 │
  │  DONUT + UNIT   │
  │  liquidity      │
  │                 │
  │  LP → BURNED    │
  └─────────────────┘
```

---

## Key Features

### 1. Permanent Liquidity

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PERMANENT LIQUIDITY                                      │
└─────────────────────────────────────────────────────────────────────────────┘

  At launch:
  ├── DONUT + UNIT deposited to Uniswap
  ├── LP tokens minted
  ├── LP tokens sent to: 0x000000000000000000000000000000000000dEaD
  └── Liquidity locked FOREVER

  Result:
  ├── No one can remove liquidity
  ├── Token will always be tradeable
  ├── Trust is built into the contract
  └── Community can trade with confidence
```

### 2. Fair Mining Distribution

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    MINING DISTRIBUTION                                      │
└─────────────────────────────────────────────────────────────────────────────┘

  UNIT tokens are distributed through mining:

  • Same Dutch auction as DONUT
  • Tokens minted to active miner
  • Emission rate halves over time
  • No pre-mine, no team allocation

  Everyone competes on equal footing!
```

### 3. Treasury Management

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    TREASURY AUCTION                                         │
└─────────────────────────────────────────────────────────────────────────────┘

  Mining fees (15%) accumulate in treasury:

  Treasury WETH
       │
       ▼
  DUTCH AUCTION
       │
       ├── Buyers pay with LP tokens
       │
       └── LP tokens BURNED
            │
            ▼
       LP supply decreases
       Each LP worth more
```

---

## Fee Structure

When someone mines a Franchise token:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    FEE DISTRIBUTION                                         │
└─────────────────────────────────────────────────────────────────────────────┘

  Mining Payment
       │
       ├──► 80% → Previous Miner
       │
       ├──► 15% → Treasury (for LP auctions)
       │
       ├──► 4%  → Team (launcher's address)
       │
       └──► 1%  → Protocol (GlazeCorp)
```

---

## Who Should Use Franchise?

### Good For

```
✓ Community tokens with fair launch
✓ Meme coins that want credibility
✓ Projects wanting rug-proof tokenomics
✓ DAOs needing governance tokens
✓ Experiments with token economics
```

### Consider Carefully

```
? Projects needing immediate large liquidity
? Tokens requiring complex vesting
? Projects needing team allocations
```

---

## Comparison

| Feature | Traditional Launch | Franchise |
|---------|-------------------|-----------|
| Liquidity removal | Possible | Impossible |
| Distribution | Presale/ICO | Mining |
| Sniper advantage | High | None |
| Team allocation | Common | None |
| Trust required | High | Low (trustless) |
| Initial liquidity | Variable | Guaranteed |

---

## Next Steps

- [Launching a Token](launching.md) - Step-by-step guide
- [Rig Mining](mining-rigs.md) - How mining works
- [Auctions & Liquidity](auctions.md) - Treasury mechanics
