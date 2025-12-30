# Architecture Overview

Understanding how GlazeCorp's systems connect and interact.

---

## System Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           GLAZECORP ARCHITECTURE                            │
└─────────────────────────────────────────────────────────────────────────────┘

                              EXTERNAL INPUTS
                    ┌──────────────────────────────────┐
                    │  Users pay ETH/WETH to:          │
                    │  • Mine DONUT                    │
                    │  • Mine Franchise tokens         │
                    │  • Buy from Strategy auctions    │
                    └───────────────┬──────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              MINING LAYER                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────┐         ┌─────────────────────────────────────┐   │
│  │                     │         │                                     │   │
│  │    DONUT MINER      │         │         FRANCHISE RIGS              │   │
│  │                     │         │                                     │   │
│  │  • Dutch auction    │         │  • One per launched token           │   │
│  │  • Mints DONUT      │         │  • Same Dutch auction mechanics     │   │
│  │  • 80/20 fee split  │         │  • Mints UNIT tokens               │   │
│  │                     │         │  • 80/15/4/1 fee split             │   │
│  └──────────┬──────────┘         └──────────────┬──────────────────────┘   │
│             │                                    │                          │
│             │ 20% fees                          │ 15% to treasury           │
│             ▼                                    ▼                          │
│  ┌─────────────────────┐         ┌─────────────────────────────────────┐   │
│  │     TREASURY        │         │      FRANCHISE AUCTIONS             │   │
│  │   (DAO-owned)       │         │   (LP buyback & burn)              │   │
│  └─────────────────────┘         └─────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ Treasury WETH
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            GOVERNANCE LAYER (LSG)                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────────────┐ │
│  │                 │    │                 │    │                         │ │
│  │ GovernanceToken │───►│     VOTER       │───►│      STRATEGIES         │ │
│  │    (gDONUT)     │    │                 │    │                         │ │
│  │                 │    │  Tracks votes   │    │  ┌─────────────────┐   │ │
│  │  Stake DONUT    │    │  Distributes    │    │  │ cbBTC Strategy  │   │ │
│  │  to get gDONUT  │    │  revenue based  │    │  │ Dutch auction   │   │ │
│  │                 │    │  on weights     │    │  │ sells WETH for  │   │ │
│  │  Non-transfer   │    │                 │    │  │ cbBTC → DAO     │   │ │
│  │                 │    │                 │    │  └─────────────────┘   │ │
│  └─────────────────┘    └────────┬────────┘    │  ┌─────────────────┐   │ │
│                                  │             │  │ USDC Strategy   │   │ │
│                                  │             │  └─────────────────┘   │ │
│                                  │             │  ┌─────────────────┐   │ │
│                                  │             │  │ DONUT Strategy  │   │ │
│                                  │             │  └─────────────────┘   │ │
│                                  │             │  ┌─────────────────┐   │ │
│                                  │             │  │ LP Strategy     │   │ │
│                                  │             │  └─────────────────┘   │ │
│                                  │             └─────────────────────────┘ │
│                                  │                         │               │
│                                  │                         │ Bribe split   │
│                                  ▼                         ▼               │
│                         ┌─────────────────────────────────────────────┐   │
│                         │              BRIBE CONTRACTS                │   │
│                         │                                             │   │
│                         │  Distribute rewards to voters proportional  │   │
│                         │  to their vote weight on each strategy      │   │
│                         │                                             │   │
│                         └─────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ Payment tokens flow to DAO
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DAO TREASURY                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Accumulates: cbBTC, USDC, DONUT, LP tokens, WETH                          │
│                                                                             │
│  Controlled by: Token holder governance                                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow: Mining to Rewards

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    COMPLETE REVENUE FLOW EXAMPLE                            │
└─────────────────────────────────────────────────────────────────────────────┘

1. MINING EVENT
   User pays 1 ETH to mine DONUT

   ┌─────────────────────────────────────────────┐
   │  1 ETH Payment Distribution:                │
   │  ├── 0.80 ETH → Previous miner             │
   │  └── 0.20 ETH → Treasury (as WETH)         │
   └─────────────────────────────────────────────┘
                         │
                         ▼
2. REVENUE ROUTER
   Accumulates treasury WETH from multiple mining events

   ┌─────────────────────────────────────────────┐
   │  Treasury accumulates: 10 WETH              │
   │  Flush triggered → Voter.notifyRevenue()   │
   └─────────────────────────────────────────────┘
                         │
                         ▼
3. VOTER DISTRIBUTION
   Revenue split based on vote weights

   ┌─────────────────────────────────────────────┐
   │  Total votes: 1,000,000 gDONUT              │
   │  ├── cbBTC Strategy: 400,000 (40%)         │
   │  ├── USDC Strategy:  300,000 (30%)         │
   │  ├── DONUT Strategy: 200,000 (20%)         │
   │  └── LP Strategy:    100,000 (10%)         │
   │                                             │
   │  Distribution:                              │
   │  ├── cbBTC Strategy: 4 WETH                │
   │  ├── USDC Strategy:  3 WETH                │
   │  ├── DONUT Strategy: 2 WETH                │
   │  └── LP Strategy:    1 WETH                │
   └─────────────────────────────────────────────┘
                         │
                         ▼
4. STRATEGY AUCTIONS
   Each strategy sells its WETH via Dutch auction

   ┌─────────────────────────────────────────────┐
   │  cbBTC Strategy Auction:                    │
   │  ├── Sells: 4 WETH                         │
   │  ├── Buyer pays: 0.0001 cbBTC              │
   │  │                                          │
   │  │  Payment split (bribeSplit = 30%):      │
   │  │  ├── 0.00003 cbBTC → Bribe contract    │
   │  │  └── 0.00007 cbBTC → DAO treasury      │
   └─────────────────────────────────────────────┘
                         │
                         ▼
5. BRIBE DISTRIBUTION
   Voters earn rewards proportional to their votes

   ┌─────────────────────────────────────────────┐
   │  cbBTC Bribe Contract:                      │
   │  ├── Total rewards: 0.00003 cbBTC          │
   │  ├── Distribution period: 7 days           │
   │  │                                          │
   │  │  Alice voted 40,000 gDONUT (10% share)  │
   │  │  Alice earns: 0.000003 cbBTC over 7d    │
   │  │                                          │
   │  │  Bob voted 100,000 gDONUT (25% share)   │
   │  │  Bob earns: 0.0000075 cbBTC over 7d     │
   └─────────────────────────────────────────────┘
```

---

## Contract Relationships

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CONTRACT DEPENDENCIES                               │
└─────────────────────────────────────────────────────────────────────────────┘

DONUT Token
    │
    ├──► Miner (only minter)
    │
    └──► GovernanceToken (underlying for staking)
              │
              └──► Voter (reads balances for voting power)
                      │
                      ├──► Strategies (receives revenue distribution)
                      │        │
                      │        └──► BribeRouter (receives bribe split)
                      │                  │
                      │                  └──► Bribe (distributes to voters)
                      │
                      └──► RevenueRouter (revenue source)


FRANCHISE SYSTEM

Core (factory)
    │
    ├──► Unit Token (creates)
    │        │
    │        └──► Rig (only minter)
    │
    ├──► Rig (creates)
    │        │
    │        └──► Pays fees to Treasury, Team, Protocol
    │
    ├──► Auction (creates)
    │        │
    │        └──► Burns LP tokens
    │
    └──► LP Token (creates via Uniswap)
             │
             └──► Initial LP burned to 0xdead
```

---

## State Machine: Voting Lifecycle

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          VOTING STATE MACHINE                               │
└─────────────────────────────────────────────────────────────────────────────┘

                    ┌─────────────┐
                    │             │
                    │  NO STAKE   │◄─────────────────────────────┐
                    │             │                              │
                    └──────┬──────┘                              │
                           │                                     │
                           │ stake()                             │
                           ▼                                     │
                    ┌─────────────┐                              │
                    │             │                              │
                    │   STAKED    │                              │
                    │  (no votes) │                              │
                    │             │                              │
                    └──────┬──────┘                              │
                           │                                     │
                           │ vote()                              │ unstake()
                           ▼                                     │ (only if no votes)
                    ┌─────────────┐                              │
         ┌─────────►│             │                              │
         │          │   VOTED     │──────────────────────────────┤
         │          │             │                              │
         │          └──────┬──────┘                              │
         │                 │                                     │
         │                 │ reset() [next epoch]                │
         │                 ▼                                     │
         │          ┌─────────────┐                              │
         │          │             │                              │
         └──────────│   RESET     │──────────────────────────────┘
   vote() [next     │  (no votes) │
   epoch]           │             │
                    └─────────────┘


EPOCH TIMING:

├─── Epoch 1 (7 days) ───┼─── Epoch 2 (7 days) ───┼─── Epoch 3 ───►

     vote()                    Can vote() again
     │                         or reset()
     ▼                         │
     Locked until              ▼
     next epoch                New votes take effect
```

---

## Security Model

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SECURITY PROPERTIES                               │
└─────────────────────────────────────────────────────────────────────────────┘

1. NO FLASH LOAN ATTACKS
   ┌─────────────────────────────────────────────┐
   │  gDONUT is non-transferable                 │
   │  ├── Cannot borrow voting power             │
   │  ├── Cannot buy votes on secondary market   │
   │  └── Must actually commit capital to stake  │
   └─────────────────────────────────────────────┘

2. FRONTRUN PROTECTION
   ┌─────────────────────────────────────────────┐
   │  epochId parameter in all auctions          │
   │  ├── Transaction fails if epoch changed     │
   │  ├── Prevents sandwich attacks              │
   │  └── Users set maxPrice for slippage       │
   └─────────────────────────────────────────────┘

3. PERMANENT LIQUIDITY
   ┌─────────────────────────────────────────────┐
   │  Franchise LP tokens burned to 0xdead       │
   │  ├── No one can remove liquidity            │
   │  ├── Token always tradeable                 │
   │  └── Rug pulls impossible                   │
   └─────────────────────────────────────────────┘

4. IMMUTABLE PARAMETERS
   ┌─────────────────────────────────────────────┐
   │  After launch, cannot change:               │
   │  ├── Emission rates                         │
   │  ├── Token supply mechanics                 │
   │  ├── Fee distributions                      │
   │  └── Auction parameters                     │
   └─────────────────────────────────────────────┘

5. SEPARATION OF CONCERNS
   ┌─────────────────────────────────────────────┐
   │  Voter owner should be Governor, not EOA    │
   │  ├── Strategy changes require governance    │
   │  ├── No single point of failure            │
   │  └── Transparent on-chain decisions        │
   └─────────────────────────────────────────────┘
```

---

## Next Steps

- [How Mining Works](../mining/how-it-works.md)
- [Governance Overview](../governance/overview.md)
- [Contract Reference](../technical/contracts.md)
