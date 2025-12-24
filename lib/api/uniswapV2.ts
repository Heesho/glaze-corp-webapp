// Uniswap V2 direct integration for DONUT swaps
import { createPublicClient, http, formatUnits, parseUnits, type Address } from "viem";
import { base } from "viem/chains";
import { TOKEN_ADDRESSES, LAUNCHPAD_ADDRESSES, RPC_URL } from "@/lib/blockchain/contracts";

// Uniswap V2 Pair ABI (minimal)
const PAIR_ABI = [
  {
    inputs: [],
    name: "getReserves",
    outputs: [
      { name: "reserve0", type: "uint112" },
      { name: "reserve1", type: "uint112" },
      { name: "blockTimestampLast", type: "uint32" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "token0",
    outputs: [{ type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "token1",
    outputs: [{ type: "address" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

// Uniswap V2 Router ABI (minimal for swaps)
export const UNIV2_ROUTER_ABI = [
  {
    inputs: [
      { name: "amountOutMin", type: "uint256" },
      { name: "path", type: "address[]" },
      { name: "to", type: "address" },
      { name: "deadline", type: "uint256" },
    ],
    name: "swapExactETHForTokens",
    outputs: [{ name: "amounts", type: "uint256[]" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { name: "amountIn", type: "uint256" },
      { name: "amountOutMin", type: "uint256" },
      { name: "path", type: "address[]" },
      { name: "to", type: "address" },
      { name: "deadline", type: "uint256" },
    ],
    name: "swapExactTokensForETH",
    outputs: [{ name: "amounts", type: "uint256[]" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "amountIn", type: "uint256" },
      { name: "amountOutMin", type: "uint256" },
      { name: "path", type: "address[]" },
      { name: "to", type: "address" },
      { name: "deadline", type: "uint256" },
    ],
    name: "swapExactTokensForTokens",
    outputs: [{ name: "amounts", type: "uint256[]" }],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const client = createPublicClient({
  chain: base,
  transport: http(RPC_URL),
});

export interface UniV2Quote {
  amountIn: bigint;
  amountOut: bigint;
  path: Address[];
  priceImpact: number;
}

// Get output amount using constant product formula (x * y = k)
function getAmountOut(amountIn: bigint, reserveIn: bigint, reserveOut: bigint): bigint {
  const amountInWithFee = amountIn * 997n; // 0.3% fee
  const numerator = amountInWithFee * reserveOut;
  const denominator = reserveIn * 1000n + amountInWithFee;
  return numerator / denominator;
}

// Get input amount needed for desired output
function getAmountIn(amountOut: bigint, reserveIn: bigint, reserveOut: bigint): bigint {
  const numerator = reserveIn * amountOut * 1000n;
  const denominator = (reserveOut - amountOut) * 997n;
  return numerator / denominator + 1n;
}

// Calculate price impact
function calculatePriceImpact(
  amountIn: bigint,
  amountOut: bigint,
  reserveIn: bigint,
  reserveOut: bigint
): number {
  // Spot price before swap
  const spotPrice = (reserveOut * 10n ** 18n) / reserveIn;
  // Execution price
  const executionPrice = (amountOut * 10n ** 18n) / amountIn;
  // Price impact = 1 - (execution / spot)
  const impact = 1 - Number(executionPrice) / Number(spotPrice);
  return Math.max(0, impact * 100); // Return as percentage
}

/**
 * Get a quote for swapping between ETH/WETH and DONUT
 */
export async function getUniV2Quote(
  tokenInAddress: string,
  tokenOutAddress: string,
  amountIn: bigint
): Promise<UniV2Quote | null> {
  try {
    const lpAddress = TOKEN_ADDRESSES.donutEthLp as Address;

    // Get reserves and token order from LP
    const [reserves, token0] = await Promise.all([
      client.readContract({
        address: lpAddress,
        abi: PAIR_ABI,
        functionName: "getReserves",
      }),
      client.readContract({
        address: lpAddress,
        abi: PAIR_ABI,
        functionName: "token0",
      }),
    ]);

    const [reserve0, reserve1] = reserves;
    const isDonutToken0 = token0.toLowerCase() === TOKEN_ADDRESSES.donut.toLowerCase();

    // Determine reserves based on token order
    let reserveIn: bigint;
    let reserveOut: bigint;
    let path: Address[];

    const isSwappingToDonut =
      tokenOutAddress.toLowerCase() === TOKEN_ADDRESSES.donut.toLowerCase();

    if (isSwappingToDonut) {
      // ETH/WETH -> DONUT
      reserveIn = isDonutToken0 ? reserve1 : reserve0; // WETH reserve
      reserveOut = isDonutToken0 ? reserve0 : reserve1; // DONUT reserve
      path = [TOKEN_ADDRESSES.weth as Address, TOKEN_ADDRESSES.donut as Address];
    } else {
      // DONUT -> ETH/WETH
      reserveIn = isDonutToken0 ? reserve0 : reserve1; // DONUT reserve
      reserveOut = isDonutToken0 ? reserve1 : reserve0; // WETH reserve
      path = [TOKEN_ADDRESSES.donut as Address, TOKEN_ADDRESSES.weth as Address];
    }

    const amountOut = getAmountOut(amountIn, reserveIn, reserveOut);
    const priceImpact = calculatePriceImpact(amountIn, amountOut, reserveIn, reserveOut);

    return {
      amountIn,
      amountOut,
      path,
      priceImpact,
    };
  } catch (error) {
    console.error("UniV2 quote error:", error);
    return null;
  }
}

/**
 * Build swap calldata for Uniswap V2 Router
 */
export function buildUniV2SwapCalldata(
  quote: UniV2Quote,
  recipient: Address,
  slippageBps: number = 100, // 1% default
  isEthIn: boolean
): { to: Address; data: `0x${string}`; value: bigint } {
  const router = LAUNCHPAD_ADDRESSES.uniV2Router as Address;
  const deadline = BigInt(Math.floor(Date.now() / 1000) + 1800); // 30 minutes
  const amountOutMin = (quote.amountOut * BigInt(10000 - slippageBps)) / 10000n;

  if (isEthIn) {
    // swapExactETHForTokens(uint amountOutMin, address[] path, address to, uint deadline)
    const selector = "0x7ff36ab5";
    const encodedParams = [
      amountOutMin.toString(16).padStart(64, "0"),
      "80".padStart(64, "0"), // offset to path array (128 bytes = 0x80)
      recipient.slice(2).toLowerCase().padStart(64, "0"),
      deadline.toString(16).padStart(64, "0"),
      "2".padStart(64, "0"), // path length
      quote.path[0].slice(2).toLowerCase().padStart(64, "0"),
      quote.path[1].slice(2).toLowerCase().padStart(64, "0"),
    ].join("");

    return {
      to: router,
      data: `${selector}${encodedParams}` as `0x${string}`,
      value: quote.amountIn,
    };
  } else {
    // swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] path, address to, uint deadline)
    const selector = "0x18cbafe5";
    const encodedParams = [
      quote.amountIn.toString(16).padStart(64, "0"),
      amountOutMin.toString(16).padStart(64, "0"),
      "a0".padStart(64, "0"), // offset to path array (160 bytes = 0xa0)
      recipient.slice(2).toLowerCase().padStart(64, "0"),
      deadline.toString(16).padStart(64, "0"),
      "2".padStart(64, "0"), // path length
      quote.path[0].slice(2).toLowerCase().padStart(64, "0"),
      quote.path[1].slice(2).toLowerCase().padStart(64, "0"),
    ].join("");

    return {
      to: router,
      data: `${selector}${encodedParams}` as `0x${string}`,
      value: 0n,
    };
  }
}
