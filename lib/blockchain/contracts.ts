// Contract Addresses
export const MULTICALL_ADDRESS = "0x3ec144554b484C6798A683E34c8e8E222293f323";
export const MINER_ADDRESS = "0xF69614F4Ee8D4D3879dd53d5A039eB3114C794F6";

// Token Addresses
export const TOKEN_ADDRESSES = {
  donut: "0xAE4a37d554C6D6F3E398546d8566B25052e0169C",
  weth: "0x4200000000000000000000000000000000000006",
  usdc: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
  donutEthLp: "0xD1DbB2E56533C55C3A637D13C53aeEf65c5D5703",
  gDonut: "0x2e5BaC759449b9673Ce2e2e7C87cFce8D8A0b2c3", // GovernanceToken
} as const;

// LSG (Liquid Signal Governance) Contract Addresses
export const LSG_ADDRESSES = {
  governanceToken: "0x2e5BaC759449b9673Ce2e2e7C87cFce8D8A0b2c3",
  voter: "0x1fAfC7Ec84ee588F1836833a4217b8a3e6632522",
  lsgMulticall: "0x1a90e9A7f0ED2C0CB054F470e8F9c06a935B9789",
} as const;

// Payment token symbols for display
export const PAYMENT_TOKEN_SYMBOLS: Record<string, string> = {
  [TOKEN_ADDRESSES.donut.toLowerCase()]: "DONUT",
  [TOKEN_ADDRESSES.donutEthLp.toLowerCase()]: "DONUT-ETH LP",
  [TOKEN_ADDRESSES.usdc.toLowerCase()]: "USDC",
};

// RPC Configuration
export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL;

// Multicall ABI for getMiner and mine functions
export const MULTICALL_ABI = [
  {
    inputs: [{ name: "account", type: "address" }],
    name: "getMiner",
    outputs: [
      {
        components: [
          { name: "epochId", type: "uint16" },
          { name: "initPrice", type: "uint192" },
          { name: "startTime", type: "uint40" },
          { name: "glazed", type: "uint256" },
          { name: "price", type: "uint256" },
          { name: "dps", type: "uint256" },
          { name: "nextDps", type: "uint256" },
          { name: "donutPrice", type: "uint256" },
          { name: "miner", type: "address" },
          { name: "uri", type: "string" },
          { name: "ethBalance", type: "uint256" },
          { name: "wethBalance", type: "uint256" },
          { name: "donutBalance", type: "uint256" },
        ],
        name: "state",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "provider", type: "address" },
      { name: "epochId", type: "uint256" },
      { name: "deadline", type: "uint256" },
      { name: "maxPrice", type: "uint256" },
      { name: "uri", type: "string" },
    ],
    name: "mine",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
] as const;

// Miner ABI for startTime
export const MINER_ABI = [
  {
    inputs: [],
    name: "startTime",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

// LSG Multicall ABI
export const LSG_MULTICALL_ABI = [
  {
    inputs: [{ name: "account", type: "address" }],
    name: "getVoterData",
    outputs: [
      {
        components: [
          { name: "governanceToken", type: "address" },
          { name: "revenueToken", type: "address" },
          { name: "treasury", type: "address" },
          { name: "underlyingToken", type: "address" },
          { name: "underlyingTokenDecimals", type: "uint8" },
          { name: "totalWeight", type: "uint256" },
          { name: "strategyCount", type: "uint256" },
          { name: "governanceTokenTotalSupply", type: "uint256" },
          { name: "accountGovernanceTokenBalance", type: "uint256" },
          { name: "accountUnderlyingTokenBalance", type: "uint256" },
          { name: "accountUsedWeights", type: "uint256" },
          { name: "accountLastVoted", type: "uint256" },
        ],
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "account", type: "address" }],
    name: "getAllBribesData",
    outputs: [
      {
        components: [
          { name: "strategy", type: "address" },
          { name: "bribe", type: "address" },
          { name: "isAlive", type: "bool" },
          { name: "rewardTokens", type: "address[]" },
          { name: "rewardTokenDecimals", type: "uint8[]" },
          { name: "rewardsPerToken", type: "uint256[]" },
          { name: "accountRewardsEarned", type: "uint256[]" },
          { name: "rewardsLeft", type: "uint256[]" },
          { name: "voteWeight", type: "uint256" },
          { name: "votePercent", type: "uint256" },
          { name: "totalSupply", type: "uint256" },
          { name: "accountVote", type: "uint256" },
        ],
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "account", type: "address" }],
    name: "getAllStrategiesData",
    outputs: [
      {
        components: [
          { name: "strategy", type: "address" },
          { name: "bribe", type: "address" },
          { name: "bribeRouter", type: "address" },
          { name: "paymentToken", type: "address" },
          { name: "paymentReceiver", type: "address" },
          { name: "isAlive", type: "bool" },
          { name: "paymentTokenDecimals", type: "uint8" },
          { name: "strategyWeight", type: "uint256" },
          { name: "votePercent", type: "uint256" },
          { name: "claimable", type: "uint256" },
          { name: "pendingRevenue", type: "uint256" },
          { name: "routerRevenue", type: "uint256" },
          { name: "totalPotentialRevenue", type: "uint256" },
          { name: "epochPeriod", type: "uint256" },
          { name: "priceMultiplier", type: "uint256" },
          { name: "minInitPrice", type: "uint256" },
          { name: "epochId", type: "uint256" },
          { name: "initPrice", type: "uint256" },
          { name: "startTime", type: "uint256" },
          { name: "currentPrice", type: "uint256" },
          { name: "revenueBalance", type: "uint256" },
          { name: "accountVotes", type: "uint256" },
          { name: "accountPaymentTokenBalance", type: "uint256" },
        ],
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "strategy", type: "address" }],
    name: "distribute",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "distributeAll",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "strategy", type: "address" },
      { name: "epochId", type: "uint256" },
      { name: "deadline", type: "uint256" },
      { name: "maxPaymentAmount", type: "uint256" },
    ],
    name: "distributeAndBuy",
    outputs: [{ name: "paymentAmount", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

// Voter ABI
export const VOTER_ABI = [
  {
    inputs: [
      { name: "strategies", type: "address[]" },
      { name: "weights", type: "uint256[]" },
    ],
    name: "vote",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "reset",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "bribes", type: "address[]" }],
    name: "claimBribes",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

// Governance Token ABI (gDONUT)
export const GOVERNANCE_TOKEN_ABI = [
  {
    inputs: [{ name: "amount", type: "uint256" }],
    name: "stake",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "amount", type: "uint256" }],
    name: "unstake",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "delegatee", type: "address" }],
    name: "delegate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "account", type: "address" }],
    name: "delegates",
    outputs: [{ type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "account", type: "address" }],
    name: "getVotes",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

// ERC20 ABI
export const ERC20_ABI = [
  {
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

// ============================================
// LAUNCHPAD (Franchise) Contracts
// ============================================

export const LAUNCHPAD_ADDRESSES = {
  core: "0xA35588D152F45C95f5b152e099647f081BD9F5AB",
  multicall: "0x5D16A5EB8Ac507eF417A44b8d767104dC52EFa87",
  uniV2Router: "0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24",
  uniV2Factory: "0x8909Dc15e40173Ff4699343b6eB8132c65e18eC6",
} as const;

// Launchpad Core ABI
export const LAUNCHPAD_CORE_ABI = [
  {
    inputs: [],
    name: "getDeployedRigRegistries",
    outputs: [{ type: "address[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "rigRegistry", type: "address" }],
    name: "getLauncher",
    outputs: [{ type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "rigRegistry", type: "address" }],
    name: "getUnit",
    outputs: [{ type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "rigRegistry", type: "address" }],
    name: "getAuction",
    outputs: [{ type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "rigRegistry", type: "address" }],
    name: "getLP",
    outputs: [{ type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "minDonut",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

// Launchpad Multicall ABI
export const LAUNCHPAD_MULTICALL_ABI = [
  {
    inputs: [
      { name: "rigRegistry", type: "address" },
      { name: "account", type: "address" },
      { name: "epochId", type: "uint256" },
      { name: "deadline", type: "uint256" },
      { name: "maxPrice", type: "uint256" },
      { name: "uri", type: "string" },
    ],
    name: "mine",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { name: "rigRegistry", type: "address" },
      { name: "account", type: "address" },
      { name: "epochId", type: "uint256" },
      { name: "deadline", type: "uint256" },
      { name: "maxPrice", type: "uint256" },
      { name: "lpAmount", type: "uint256" },
    ],
    name: "buy",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "name", type: "string" },
      { name: "symbol", type: "string" },
      { name: "uri", type: "string" },
      { name: "launchDonut", type: "uint256" },
      { name: "launchWeth", type: "uint256" },
      { name: "rigEpochPeriod", type: "uint256" },
      { name: "rigPriceMultiplier", type: "uint256" },
      { name: "auctionEpochPeriod", type: "uint256" },
      { name: "auctionPriceMultiplier", type: "uint256" },
    ],
    name: "launch",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "rig", type: "address" },
      { name: "account", type: "address" },
    ],
    name: "getRig",
    outputs: [
      {
        components: [
          { name: "epochId", type: "uint256" },
          { name: "initPrice", type: "uint256" },
          { name: "epochStartTime", type: "uint256" },
          { name: "glazed", type: "uint256" },
          { name: "price", type: "uint256" },
          { name: "ups", type: "uint256" },
          { name: "nextUps", type: "uint256" },
          { name: "unitPrice", type: "uint256" },
          { name: "miner", type: "address" },
          { name: "epochUri", type: "string" },
          { name: "rigUri", type: "string" },
          { name: "ethBalance", type: "uint256" },
          { name: "wethBalance", type: "uint256" },
          { name: "donutBalance", type: "uint256" },
          { name: "unitBalance", type: "uint256" },
        ],
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "rig", type: "address" },
      { name: "account", type: "address" },
    ],
    name: "getAuction",
    outputs: [
      {
        components: [
          { name: "epochId", type: "uint256" },
          { name: "initPrice", type: "uint256" },
          { name: "startTime", type: "uint256" },
          { name: "paymentToken", type: "address" },
          { name: "price", type: "uint256" },
          { name: "paymentTokenPrice", type: "uint256" },
          { name: "wethAccumulated", type: "uint256" },
          { name: "wethBalance", type: "uint256" },
          { name: "donutBalance", type: "uint256" },
          { name: "paymentTokenBalance", type: "uint256" },
        ],
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

// Launch default parameters
export const LAUNCH_DEFAULTS = {
  launchDonut: 100000n * 10n ** 18n, // 100,000 DONUT
  launchWeth: 10n ** 17n, // 0.1 ETH
  rigEpochPeriod: 3600n, // 1 hour
  rigPriceMultiplier: 20000n, // 2x (in basis points / 100)
  auctionEpochPeriod: 86400n, // 24 hours
  auctionPriceMultiplier: 12000n, // 1.2x
} as const;
