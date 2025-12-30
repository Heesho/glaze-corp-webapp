# Integration Guide

Build applications that interact with GlazeCorp contracts.

---

## Setup

### Install Dependencies

```bash
npm install ethers viem wagmi
```

### Configure Provider

```javascript
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

const client = createPublicClient({
  chain: base,
  transport: http('https://mainnet.base.org'),
});
```

---

## Mining Integration

### Read Mining State

```javascript
import { MULTICALL_ADDRESS, MULTICALL_ABI } from './contracts';

async function getMinerState(userAddress) {
  const state = await client.readContract({
    address: MULTICALL_ADDRESS,
    abi: MULTICALL_ABI,
    functionName: 'getMiner',
    args: [userAddress],
  });

  return {
    epochId: state.epochId,
    initPrice: state.initPrice,
    startTime: state.startTime,
    glazed: state.glazed,
    price: state.price,           // Current price
    dps: state.dps,               // Donuts per second
    nextDps: state.nextDps,       // After next halving
    donutPrice: state.donutPrice, // DONUT price in ETH
    miner: state.miner,           // Current miner
    uri: state.uri,
    ethBalance: state.ethBalance,
    wethBalance: state.wethBalance,
    donutBalance: state.donutBalance,
  };
}
```

### Execute Mining

```javascript
import { parseEther } from 'viem';

async function mine(walletClient, epochId, maxPrice, uri = '') {
  const deadline = Math.floor(Date.now() / 1000) + 300; // 5 minutes

  const hash = await walletClient.writeContract({
    address: MULTICALL_ADDRESS,
    abi: MULTICALL_ABI,
    functionName: 'mine',
    args: [
      '0x0000000000000000000000000000000000000000', // provider (none)
      epochId,
      deadline,
      maxPrice,
      uri,
    ],
    value: maxPrice, // Send ETH
  });

  return hash;
}
```

---

## Governance Integration

### Read Governance Data

```javascript
import { LSG_MULTICALL_ADDRESS, LSG_MULTICALL_ABI } from './contracts';

async function getGovernanceData(userAddress) {
  const [voterData, bribesData, strategiesData] = await Promise.all([
    client.readContract({
      address: LSG_MULTICALL_ADDRESS,
      abi: LSG_MULTICALL_ABI,
      functionName: 'getVoterData',
      args: [userAddress],
    }),
    client.readContract({
      address: LSG_MULTICALL_ADDRESS,
      abi: LSG_MULTICALL_ABI,
      functionName: 'getAllBribesData',
      args: [userAddress],
    }),
    client.readContract({
      address: LSG_MULTICALL_ADDRESS,
      abi: LSG_MULTICALL_ABI,
      functionName: 'getAllStrategiesData',
      args: [userAddress],
    }),
  ]);

  return { voterData, bribesData, strategiesData };
}
```

### Stake DONUT

```javascript
import { GOVERNANCE_TOKEN_ADDRESS, GOVERNANCE_TOKEN_ABI, DONUT_ADDRESS, ERC20_ABI } from './contracts';

async function stakeDONUT(walletClient, amount) {
  // 1. Approve DONUT spending
  await walletClient.writeContract({
    address: DONUT_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'approve',
    args: [GOVERNANCE_TOKEN_ADDRESS, amount],
  });

  // 2. Stake
  const hash = await walletClient.writeContract({
    address: GOVERNANCE_TOKEN_ADDRESS,
    abi: GOVERNANCE_TOKEN_ABI,
    functionName: 'stake',
    args: [amount],
  });

  return hash;
}
```

### Vote on Strategies

```javascript
import { VOTER_ADDRESS, VOTER_ABI } from './contracts';

async function vote(walletClient, strategies, weights) {
  const hash = await walletClient.writeContract({
    address: VOTER_ADDRESS,
    abi: VOTER_ABI,
    functionName: 'vote',
    args: [strategies, weights],
  });

  return hash;
}

// Example usage
await vote(walletClient, [
  '0x1234...', // cbBTC strategy
  '0x5678...', // USDC strategy
], [
  50n, // 50% weight
  50n, // 50% weight
]);
```

### Claim Bribes

```javascript
async function claimBribes(walletClient, bribeAddresses) {
  const hash = await walletClient.writeContract({
    address: VOTER_ADDRESS,
    abi: VOTER_ABI,
    functionName: 'claimBribes',
    args: [bribeAddresses],
  });

  return hash;
}
```

---

## Franchise Integration

### Read Rig State

```javascript
import { FRANCHISE_MULTICALL_ADDRESS, FRANCHISE_MULTICALL_ABI } from './contracts';

async function getRigState(rigAddress, userAddress) {
  const state = await client.readContract({
    address: FRANCHISE_MULTICALL_ADDRESS,
    abi: FRANCHISE_MULTICALL_ABI,
    functionName: 'getRig',
    args: [rigAddress, userAddress],
  });

  return state;
}
```

### Mine Franchise Token

```javascript
async function mineRig(walletClient, rigAddress, epochId, maxPrice, uri = '') {
  const deadline = Math.floor(Date.now() / 1000) + 300;

  const hash = await walletClient.writeContract({
    address: FRANCHISE_MULTICALL_ADDRESS,
    abi: FRANCHISE_MULTICALL_ABI,
    functionName: 'mine',
    args: [rigAddress, epochId, deadline, maxPrice, uri],
    value: maxPrice,
  });

  return hash;
}
```

### Launch New Token

```javascript
async function launchToken(walletClient, params) {
  // 1. Approve DONUT
  await walletClient.writeContract({
    address: DONUT_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'approve',
    args: [FRANCHISE_CORE_ADDRESS, params.donutAmount],
  });

  // 2. Launch
  const hash = await walletClient.writeContract({
    address: FRANCHISE_MULTICALL_ADDRESS,
    abi: FRANCHISE_MULTICALL_ABI,
    functionName: 'launch',
    args: [params],
  });

  return hash;
}
```

---

## APR Calculation

```javascript
import { formatUnits } from 'viem';

function calculateAPR(bribeData, tokenPrices, gDonutPriceUsd) {
  let annualRewardsUsd = 0;

  bribeData.rewardTokens.forEach((token, idx) => {
    const rewardsPerToken = bribeData.rewardsPerToken[idx];
    const decimals = bribeData.rewardTokenDecimals[idx];

    // Annualize first (52 weeks), then convert
    const annualRewards = rewardsPerToken * 52n;
    const annualRewardsHuman = Number(formatUnits(annualRewards, decimals));

    const tokenPrice = tokenPrices[token.toLowerCase()] || 0;
    annualRewardsUsd += annualRewardsHuman * tokenPrice;
  });

  // APR = annual rewards USD / staked value USD * 100
  const apr = gDonutPriceUsd > 0 ? (annualRewardsUsd / gDonutPriceUsd) * 100 : 0;

  return apr;
}
```

---

## Event Listening

```javascript
import { parseAbiItem } from 'viem';

// Listen for mining events
const unwatch = client.watchContractEvent({
  address: MINER_ADDRESS,
  abi: MINER_ABI,
  eventName: 'Miner__Mined',
  onLogs: (logs) => {
    for (const log of logs) {
      console.log('New mine:', {
        miner: log.args.miner,
        price: log.args.price,
        uri: log.args.uri,
      });
    }
  },
});

// Stop listening
unwatch();
```

---

## React/Wagmi Integration

```jsx
import { useReadContract, useWriteContract } from 'wagmi';

function MiningComponent() {
  // Read current price
  const { data: minerState } = useReadContract({
    address: MULTICALL_ADDRESS,
    abi: MULTICALL_ABI,
    functionName: 'getMiner',
    args: [userAddress],
  });

  // Write (mine)
  const { writeContract, isPending } = useWriteContract();

  const handleMine = () => {
    writeContract({
      address: MULTICALL_ADDRESS,
      abi: MULTICALL_ABI,
      functionName: 'mine',
      args: [provider, epochId, deadline, maxPrice, uri],
      value: maxPrice,
    });
  };

  return (
    <div>
      <p>Current Price: {formatEther(minerState?.price || 0n)} ETH</p>
      <button onClick={handleMine} disabled={isPending}>
        {isPending ? 'Mining...' : 'MINE'}
      </button>
    </div>
  );
}
```

---

## Error Handling

```javascript
// Common error codes
const ERRORS = {
  'Miner__Expired': 'Transaction deadline passed',
  'Miner__EpochIdMismatch': 'Epoch changed (someone else mined)',
  'Miner__MaxPriceExceeded': 'Price increased above your max',
  'Voter__AlreadyVotedThisEpoch': 'Already voted this epoch',
  'GovernanceToken__VotesNotCleared': 'Must reset votes before unstaking',
};

async function safeTransaction(fn) {
  try {
    return await fn();
  } catch (error) {
    const errorName = error.cause?.data?.errorName;
    if (errorName && ERRORS[errorName]) {
      throw new Error(ERRORS[errorName]);
    }
    throw error;
  }
}
```

---

## Best Practices

1. **Always use Multicall for reads** - Reduces RPC calls
2. **Set reasonable deadlines** - 5-10 minutes typical
3. **Add slippage buffer to maxPrice** - 5-10% above current price
4. **Check epochId before mining** - Prevents frontrun failures
5. **Poll for updates** - 5-15 second intervals for active pages
6. **Cache token prices** - Avoid excessive API calls
