# GlazeCorp Documentation

> **GlazeCorp** is a contributor to DonutDAO, building decentralized infrastructure on Base chain.

---

## What We Build

GlazeCorp creates products that work together to form a self-sustaining economic flywheel for DonutDAO:

| Product | What It Does |
|---------|--------------|
| **Miner** | Continuous Dutch auction that mints DONUT tokens |
| **LSG (Governance)** | Vote on how protocol revenue is allocated |
| **Franchise** | Launch new tokens with permanent liquidity |

---

## The DONUT Flywheel

```
                    ┌─────────────────┐
                    │                 │
                    │     MINING      │
                    │                 │
                    │  Miners compete │
                    │  to mint DONUT  │
                    │                 │
                    └────────┬────────┘
                             │
                             │ DONUT minted
                             │ Fees collected
                             ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│    FRANCHISE    │◄───│   GOVERNANCE    │───►│    TREASURY     │
│                 │    │                 │    │                 │
│  Launch tokens  │    │  Stake DONUT    │    │  DAO-controlled │
│  using DONUT    │    │  Vote on usage  │    │  funds grow     │
│  for liquidity  │    │  Earn rewards   │    │                 │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                     ▲
         │                     │
         └─────────────────────┘
           New tokens add value
           to ecosystem
```

---

## Quick Links

### For Users
- [Quick Start Guide](getting-started/quick-start.md) - Get started in 5 minutes
- [Mining Strategy Guide](mining/strategy-guide.md) - Maximize your mining returns
- [Staking & Voting](governance/staking.md) - Participate in governance

### For Developers
- [Contract Addresses](technical/addresses.md) - All deployed contracts
- [Integration Guide](technical/integration.md) - Build on GlazeCorp
- [Smart Contract API](technical/contracts.md) - Function reference

### For Token Launchers
- [Launching a Token](franchise/launching.md) - Launch your own token
- [Franchise Overview](franchise/overview.md) - Understand the platform

---

## Why GlazeCorp?

### No Rug Pulls
Franchise tokens have **permanent liquidity** - LP tokens are burned at launch, making it impossible to remove liquidity.

### Fair Distribution
Tokens are distributed through **Dutch auctions** over time, not sold in bulk. This defeats snipers and ensures fair access.

### Decentralized Governance
Revenue allocation is decided by **token holders**, not a multisig. Your vote directly controls where protocol revenue flows.

### Aligned Incentives
Every part of the system feeds into the others. Mining creates tokens, governance directs revenue, and Franchise expands the ecosystem.

---

## Contract Addresses (Base Mainnet)

| Contract | Address |
|----------|---------|
| DONUT Token | `0xAE4a37d554C6D6F3E398546d8566B25052e0169C` |
| gDONUT (Governance) | `0xC78B6e362cB0f48b59E573dfe7C99d92153a16d3` |
| Miner | `0xF69614F4Ee8D4D3879dd53d5A039eB3114C794F6` |
| Voter (LSG) | `0x9C5Cf3246d7142cdAeBBD5f653d95ACB73DdabA6` |
| Franchise Core | `0xA35588D152F45C95f5b152e099647f081BD9F5AB` |

[View all contract addresses →](technical/addresses.md)

---

## Get Involved

- **Mine DONUT**: [glazecorp.com/mine](https://glazecorp.com/mine)
- **Stake & Vote**: [glazecorp.com/govern](https://glazecorp.com/govern)
- **Launch a Token**: [glazecorp.com/franchise](https://glazecorp.com/franchise)

---

*Built by GlazeCorp for DonutDAO on Base*
