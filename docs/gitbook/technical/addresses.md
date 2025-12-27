# Contract Addresses

All deployed contract addresses on Base mainnet (Chain ID: 8453).

---

## Core Tokens

| Token | Address | Decimals |
|-------|---------|----------|
| DONUT | `0xAE4a37d554C6D6F3E398546d8566B25052e0169C` | 18 |
| gDONUT (Governance) | `0xC78B6e362cB0f48b59E573dfe7C99d92153a16d3` | 18 |
| DONUT-ETH LP | `0xD1DbB2E56533C55C3A637D13C53aeEf65c5D5703` | 18 |
| WETH | `0x4200000000000000000000000000000000000006` | 18 |
| USDC | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` | 6 |
| cbBTC | `0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf` | 8 |

---

## Mining Contracts

| Contract | Address |
|----------|---------|
| Miner | `0xF69614F4Ee8D4D3879dd53d5A039eB3114C794F6` |
| Miner Multicall | `0x3ec144554b484C6798A683E34c8e8E222293f323` |

---

## Governance (LSG) Contracts

| Contract | Address |
|----------|---------|
| Voter | `0x9C5Cf3246d7142cdAeBBD5f653d95ACB73DdabA6` |
| GovernanceToken (gDONUT) | `0xC78B6e362cB0f48b59E573dfe7C99d92153a16d3` |
| Revenue Router | `0x4799CBe9782265C0633d24c7311dD029090dED33` |
| LSG Multicall | `0x41eA22dF0174cF3Cc09B1469a95D604E1833a462` |
| DAO | `0x690C2e187c8254a887B35C0B4477ce6787F92855` |

---

## Franchise (Launchpad) Contracts

| Contract | Address |
|----------|---------|
| Core | `0xA35588D152F45C95f5b152e099647f081BD9F5AB` |
| Multicall | `0x5D16A5EB8Ac507eF417A44b8d767104dC52EFa87` |
| Uniswap V2 Router | `0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24` |
| Uniswap V2 Factory | `0x8909Dc15e40173Ff4699343b6eB8132c65e18eC6` |

---

## Strategy Contracts

Each strategy has three associated contracts:

### cbBTC Strategy
| Contract | Address |
|----------|---------|
| Strategy | *Query from Voter* |
| Bribe | *Query from Voter* |
| BribeRouter | *Query from Voter* |

### USDC Strategy
| Contract | Address |
|----------|---------|
| Strategy | *Query from Voter* |
| Bribe | *Query from Voter* |
| BribeRouter | *Query from Voter* |

### DONUT Strategy
| Contract | Address |
|----------|---------|
| Strategy | *Query from Voter* |
| Bribe | *Query from Voter* |
| BribeRouter | *Query from Voter* |

### LP Strategy
| Contract | Address |
|----------|---------|
| Strategy | *Query from Voter* |
| Bribe | *Query from Voter* |
| BribeRouter | *Query from Voter* |

---

## Querying Strategy Addresses

```javascript
// Get all strategies
const strategies = await voter.getStrategies();

// For each strategy, get associated contracts
for (const strategy of strategies) {
  const bribe = await voter.strategy_Bribe(strategy);
  const bribeRouter = await voter.strategy_BribeRouter(strategy);
  const paymentToken = await voter.strategy_PaymentToken(strategy);

  console.log({
    strategy,
    bribe,
    bribeRouter,
    paymentToken
  });
}
```

---

## Network Configuration

```javascript
// Base Mainnet
const baseConfig = {
  chainId: 8453,
  chainName: "Base",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18
  },
  rpcUrls: ["https://mainnet.base.org"],
  blockExplorerUrls: ["https://basescan.org"]
};
```

---

## Verification

All contracts are verified on BaseScan. Click any address above to view the source code and ABI.

---

## Adding to Wallet

### DONUT Token
```
Token Address: 0xAE4a37d554C6D6F3E398546d8566B25052e0169C
Symbol: DONUT
Decimals: 18
```

### gDONUT Token
```
Token Address: 0xC78B6e362cB0f48b59E573dfe7C99d92153a16d3
Symbol: gDONUT
Decimals: 18
Note: Non-transferable (will show balance but cannot send)
```
