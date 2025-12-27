# Emission Schedule

DONUT tokens are minted at a decreasing rate over time, similar to Bitcoin's halving schedule.

---

## Halving Mechanism

The emission rate (DPS - Donuts Per Second) halves every 30 days:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          EMISSION HALVING                                   │
└─────────────────────────────────────────────────────────────────────────────┘

  DPS
  (DONUT/sec)
      │
    4 │████████████████████████████████
      │                                │
    2 │                                ████████████████████████████████
      │                                                                │
    1 │                                                                ████████
      │                                                                        │
  0.5 │                                                                        ██
      │                                                                          │
 0.01 │..........................................................................██
      └──────────────────────────────────────────────────────────────────────────►
           Month 1        Month 2        Month 3        Month 4      ...

  TAIL_DPS = 0.01 DONUT/second (floor, never goes below this)
```

---

## Emission Constants

| Constant | Value | Description |
|----------|-------|-------------|
| `INITIAL_DPS` | 4 DONUT/sec | Starting emission rate |
| `HALVING_PERIOD` | 30 days | Time between halvings |
| `TAIL_DPS` | 0.01 DONUT/sec | Minimum emission rate (forever) |

---

## Emission Schedule Table

| Period | DPS | DONUT/Hour | DONUT/Day | DONUT/Month |
|--------|-----|------------|-----------|-------------|
| Month 1 | 4.00 | 14,400 | 345,600 | 10,368,000 |
| Month 2 | 2.00 | 7,200 | 172,800 | 5,184,000 |
| Month 3 | 1.00 | 3,600 | 86,400 | 2,592,000 |
| Month 4 | 0.50 | 1,800 | 43,200 | 1,296,000 |
| Month 5 | 0.25 | 900 | 21,600 | 648,000 |
| Month 6 | 0.125 | 450 | 10,800 | 324,000 |
| Month 7 | 0.0625 | 225 | 5,400 | 162,000 |
| Month 8 | 0.03125 | 112.5 | 2,700 | 81,000 |
| Month 9 | 0.015625 | 56.25 | 1,350 | 40,500 |
| Month 10+ | 0.01 | 36 | 864 | 25,920 |

---

## Cumulative Supply

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        CUMULATIVE SUPPLY                                    │
└─────────────────────────────────────────────────────────────────────────────┘

  Total DONUT
      │
      │                                          ┌─────── Tail emission
      │                                         ╱        (slow linear growth)
  30M │                              ........../
      │                         ...../
  25M │                     ..../
      │                 .../
  20M │             .../
      │          ../
  15M │       ../
      │     ./
  10M │   ./
      │  /
   5M │ /
      │/
   0M └────────────────────────────────────────────────────────────────────────►
         M1    M2    M3    M4    M5    M6    M7    M8    M9    M10   ...

  ~20M DONUT minted in first 9 months
  Then ~0.9M per year at tail emission
```

### Approximate Milestones

| Milestone | Approximate Time |
|-----------|------------------|
| 10M DONUT | ~1 month |
| 15M DONUT | ~2 months |
| 20M DONUT | ~5 months |
| 25M DONUT | ~15 months |
| 30M DONUT | ~3+ years |

---

## Formula

The smart contract calculates DPS:

```solidity
function _getDpsFromTime(uint256 time) internal view returns (uint256 dps) {
    // Calculate number of halvings that have occurred
    uint256 halvings = time <= startTime ? 0 : (time - startTime) / HALVING_PERIOD;

    // Divide initial DPS by 2^halvings
    dps = INITIAL_DPS >> halvings;  // Bitshift right = divide by 2

    // Floor at tail DPS
    if (dps < TAIL_DPS) dps = TAIL_DPS;

    return dps;
}
```

### Example Calculation

```
Current time: 75 days after launch
HALVING_PERIOD: 30 days

halvings = 75 / 30 = 2 (integer division)
dps = 4 >> 2 = 4 / 4 = 1 DONUT/sec

So after 75 days, emission is 1 DONUT/second.
```

---

## Impact on Mining Strategy

### Early Phase (High Emissions)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  HIGH EMISSION PHASE (Month 1-3)                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  • DPS: 4 → 2 → 1 DONUT/sec                                                │
│  • Mining is very lucrative                                                 │
│  • Competition is typically higher                                          │
│  • Holding mining position longer = massive DONUT accumulation             │
│                                                                             │
│  EXAMPLE (Month 1, 4 DPS):                                                 │
│  Hold for 1 hour = 4 × 3600 = 14,400 DONUT                                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Mid Phase (Moderate Emissions)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  MODERATE EMISSION PHASE (Month 4-6)                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  • DPS: 0.5 → 0.25 → 0.125 DONUT/sec                                       │
│  • Mining still profitable but less dramatic                               │
│  • May see less competition                                                 │
│  • Longer holds needed for significant accumulation                        │
│                                                                             │
│  EXAMPLE (Month 5, 0.25 DPS):                                              │
│  Hold for 1 hour = 0.25 × 3600 = 900 DONUT                                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Tail Phase (Steady Low Emissions)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  TAIL EMISSION PHASE (Month 10+)                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  • DPS: 0.01 DONUT/sec (constant)                                          │
│  • Mining for accumulation less attractive                                  │
│  • Economic focus shifts to governance & trading                           │
│  • Token becomes more scarce over time                                     │
│                                                                             │
│  EXAMPLE (Tail, 0.01 DPS):                                                 │
│  Hold for 1 hour = 0.01 × 3600 = 36 DONUT                                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Comparison to Bitcoin

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    DONUT vs BITCOIN EMISSIONS                               │
└─────────────────────────────────────────────────────────────────────────────┘

                    BITCOIN                     DONUT
  ─────────────────────────────────────────────────────────────────────────────
  Initial Rate      50 BTC/block               4 DONUT/second
  Halving Period    ~4 years                   30 days
  Tail Emission     0 (21M cap)                0.01/sec (no hard cap)
  Time to Tail      ~140 years                 ~9 months

  Both share:
  ├── Decreasing emission over time
  ├── Predictable supply schedule
  ├── Early participants get more
  └── Scarcity increases over time

  DONUT differs:
  ├── Much faster halving (agile token distribution)
  ├── Has tail emission (never goes to zero)
  └── Total supply grows slowly forever at tail
```

---

## Viewing Current DPS

On the webapp, you can see:
- Current DPS on the mining page
- "Next DPS" showing what happens after current halving

```
┌─────────────────────────────────┐
│  Current: 2.0 DONUT/sec        │
│  Next:    1.0 DONUT/sec        │
│  Halving in: 12d 5h 23m        │
└─────────────────────────────────┘
```

---

## Next Steps

- [Mining Strategy Guide](strategy-guide.md) - Optimize for current emission phase
- [How Mining Works](how-it-works.md) - Core mechanics review
