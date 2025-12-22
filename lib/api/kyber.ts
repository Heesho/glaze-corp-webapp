// KyberSwap Aggregator API for Base chain
const KYBER_API_BASE = "https://aggregator-api.kyberswap.com/base";

export interface KyberQuoteResponse {
  routeSummary: {
    tokenIn: string;
    amountIn: string;
    tokenOut: string;
    amountOut: string;
    amountOutUsd: string;
    gas: string;
    gasUsd: string;
  };
  routerAddress: string;
}

export interface KyberBuildRouteResponse {
  data: {
    amountIn: string;
    amountOut: string;
    routerAddress: string;
    data: string; // encoded swap calldata
  };
}

export interface SwapToken {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoUrl?: string;
}

// Native ETH represented as zero address in Kyber
export const NATIVE_ETH_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

// Get quote from Kyber aggregator
export async function getKyberQuote(
  tokenIn: string,
  tokenOut: string,
  amountIn: string, // in wei
  slippageBps = 100 // 1% default
): Promise<KyberQuoteResponse | null> {
  try {
    const params = new URLSearchParams({
      tokenIn,
      tokenOut,
      amountIn,
      saveGas: "false",
      gasInclude: "true",
    });

    const res = await fetch(`${KYBER_API_BASE}/api/v1/routes?${params}`, {
      headers: {
        "x-client-id": "glazecorp",
      },
    });

    if (!res.ok) {
      console.error("Kyber quote error:", res.status, await res.text());
      return null;
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Kyber quote error:", error);
    return null;
  }
}

// Build swap transaction from Kyber
export async function buildKyberSwap(
  routeSummary: KyberQuoteResponse["routeSummary"],
  routerAddress: string,
  sender: string,
  recipient: string,
  slippageBps = 100 // 1% default
): Promise<KyberBuildRouteResponse | null> {
  try {
    const res = await fetch(`${KYBER_API_BASE}/api/v1/route/build`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": "glazecorp",
      },
      body: JSON.stringify({
        routeSummary,
        sender,
        recipient,
        slippageTolerance: slippageBps,
      }),
    });

    if (!res.ok) {
      console.error("Kyber build error:", res.status, await res.text());
      return null;
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Kyber build error:", error);
    return null;
  }
}

// Format amount with decimals
export function formatTokenAmount(amount: string, decimals: number): string {
  const num = parseFloat(amount) / Math.pow(10, decimals);
  if (num < 0.0001) return num.toExponential(2);
  if (num < 1) return num.toFixed(6);
  if (num < 1000) return num.toFixed(4);
  if (num < 1000000) return (num / 1000).toFixed(2) + "K";
  return (num / 1000000).toFixed(2) + "M";
}

// Parse amount to wei
export function parseTokenAmount(amount: string, decimals: number): string {
  try {
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) return "0";
    return BigInt(Math.floor(num * Math.pow(10, decimals))).toString();
  } catch {
    return "0";
  }
}
