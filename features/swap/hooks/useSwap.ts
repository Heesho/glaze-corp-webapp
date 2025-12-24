"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAccount, useBalance, useReadContract, useSendTransaction, useWaitForTransactionReceipt } from "wagmi";
import { base } from "wagmi/chains";
import type { Address } from "viem";
import { parseEther, formatEther, formatUnits } from "viem";

import {
  getKyberQuote,
  buildKyberSwap,
  NATIVE_ETH_ADDRESS,
  type KyberQuoteResponse,
  type SwapToken,
} from "@/lib/api/kyber";
import {
  getUniV2Quote,
  buildUniV2SwapCalldata,
  type UniV2Quote,
} from "@/lib/api/uniswapV2";
import { TOKEN_ADDRESSES, ERC20_ABI, LAUNCHPAD_ADDRESSES } from "@/lib/blockchain/contracts";
import { getRigs, fetchRigMetadata, ipfsToHttp, type SubgraphRig } from "@/lib/api/launchpad";

// Base tokens with logos
export const BASE_TOKENS: SwapToken[] = [
  {
    address: NATIVE_ETH_ADDRESS,
    symbol: "ETH",
    name: "Ethereum",
    decimals: 18,
    logoUrl: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
  },
  {
    address: TOKEN_ADDRESSES.donut,
    symbol: "DONUT",
    name: "Donut",
    decimals: 18,
    logoUrl: "/donut-logo.png", // Local donut logo
  },
  {
    address: TOKEN_ADDRESSES.usdc,
    symbol: "USDC",
    name: "USD Coin",
    decimals: 6,
    logoUrl: "https://assets.coingecko.com/coins/images/6319/small/usdc.png",
  },
];

export type SwapStep = "idle" | "quoting" | "approving" | "swapping" | "confirming";

export function useSwap() {
  const { address: userAddress } = useAccount();

  // Token state
  const [tokenIn, setTokenIn] = useState<SwapToken>(BASE_TOKENS[0]); // ETH
  const [tokenOut, setTokenOut] = useState<SwapToken>(BASE_TOKENS[1]); // DONUT
  const [inputAmount, setInputAmount] = useState("");
  const [franchiseTokens, setFranchiseTokens] = useState<SwapToken[]>([]);

  // Quote state
  const [quote, setQuote] = useState<KyberQuoteResponse | null>(null);
  const [uniV2Quote, setUniV2Quote] = useState<UniV2Quote | null>(null);
  const [isQuoting, setIsQuoting] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  // Swap state
  const [swapStep, setSwapStep] = useState<SwapStep>("idle");
  const [swapError, setSwapError] = useState<string | null>(null);

  // Transaction
  const { sendTransaction, data: txHash, isPending: isSending } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  // Get ETH balance
  const { data: ethBalance } = useBalance({
    address: userAddress,
    chainId: base.id,
  });

  // Get ERC20 token balance
  const { data: tokenInBalance, refetch: refetchTokenBalance } = useReadContract({
    address: tokenIn.address !== NATIVE_ETH_ADDRESS ? tokenIn.address as Address : undefined,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: userAddress ? [userAddress] : undefined,
    chainId: base.id,
    query: {
      enabled: !!userAddress && tokenIn.address !== NATIVE_ETH_ADDRESS,
    },
  });

  // Get allowance for non-ETH tokens
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: tokenIn.address !== NATIVE_ETH_ADDRESS ? tokenIn.address as Address : undefined,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: userAddress && quote ? [userAddress, quote.routerAddress as Address] : undefined,
    chainId: base.id,
    query: {
      enabled: !!userAddress && !!quote && tokenIn.address !== NATIVE_ETH_ADDRESS,
    },
  });

  // All available tokens
  const allTokens = useMemo(() => [...BASE_TOKENS, ...franchiseTokens], [franchiseTokens]);

  // Fetch franchise tokens with logos on mount
  useEffect(() => {
    async function loadFranchiseTokens() {
      try {
        const rigs = await getRigs(100, 0, "revenue", "desc");
        const rigsWithUnits = rigs.filter((rig) => rig.unit);

        // Fetch metadata for each rig to get logos
        const tokensWithLogos = await Promise.all(
          rigsWithUnits.map(async (rig) => {
            let logoUrl: string | undefined;
            if (rig.uri) {
              try {
                const metadata = await fetchRigMetadata(rig.uri);
                if (metadata?.image) {
                  logoUrl = ipfsToHttp(metadata.image);
                }
              } catch {
                // Ignore metadata fetch errors
              }
            }
            return {
              address: rig.unit,
              symbol: rig.symbol,
              name: rig.name,
              decimals: 18,
              logoUrl,
            };
          })
        );

        setFranchiseTokens(tokensWithLogos);
      } catch (error) {
        console.error("Failed to load franchise tokens:", error);
      }
    }
    loadFranchiseTokens();
  }, []);

  // Check if this is a DONUT swap that can use UniV2 as fallback
  const canUseUniV2 = useMemo(() => {
    const donutAddr = TOKEN_ADDRESSES.donut.toLowerCase();
    const tokenInAddr = tokenIn.address.toLowerCase();
    const tokenOutAddr = tokenOut.address.toLowerCase();
    const isEthOrWeth = (addr: string) =>
      addr === NATIVE_ETH_ADDRESS.toLowerCase() ||
      addr === TOKEN_ADDRESSES.weth.toLowerCase();

    return (
      (tokenInAddr === donutAddr && isEthOrWeth(tokenOutAddr)) ||
      (tokenOutAddr === donutAddr && isEthOrWeth(tokenInAddr))
    );
  }, [tokenIn.address, tokenOut.address]);

  // Debounced quote fetching
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (!inputAmount || parseFloat(inputAmount) <= 0) {
        setQuote(null);
        setUniV2Quote(null);
        return;
      }

      setIsQuoting(true);
      setQuoteError(null);

      try {
        const amountInWei = BigInt(Math.floor(parseFloat(inputAmount) * Math.pow(10, tokenIn.decimals)));

        // Always try Kyber first
        const kyberResult = await getKyberQuote(tokenIn.address, tokenOut.address, amountInWei.toString());

        if (kyberResult?.routeSummary) {
          setQuote(kyberResult);
          setUniV2Quote(null);
        } else if (canUseUniV2) {
          // Fall back to UniV2 for DONUT swaps if Kyber fails
          console.log("Kyber failed, trying UniV2 fallback...");
          const uniResult = await getUniV2Quote(tokenIn.address, tokenOut.address, amountInWei);
          if (uniResult) {
            setUniV2Quote(uniResult);
            setQuote(null);
          } else {
            setQuoteError("No route found");
            setUniV2Quote(null);
          }
        } else {
          setQuoteError("No route found");
          setQuote(null);
        }
      } catch (err) {
        console.error("Quote error:", err);
        setQuoteError("Failed to get quote");
        setQuote(null);
        setUniV2Quote(null);
      }

      setIsQuoting(false);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [inputAmount, tokenIn, tokenOut, canUseUniV2]);

  // Format balances
  const formattedBalance = useMemo(() => {
    if (tokenIn.address === NATIVE_ETH_ADDRESS) {
      return ethBalance ? formatEther(ethBalance.value) : "0";
    }
    return tokenInBalance ? formatUnits(tokenInBalance as bigint, tokenIn.decimals) : "0";
  }, [tokenIn, ethBalance, tokenInBalance]);

  // Output amount from quote
  const outputAmount = useMemo(() => {
    if (uniV2Quote) {
      return formatUnits(uniV2Quote.amountOut, tokenOut.decimals);
    }
    if (quote?.routeSummary) {
      return formatUnits(BigInt(quote.routeSummary.amountOut), tokenOut.decimals);
    }
    return "";
  }, [quote, uniV2Quote, tokenOut]);

  // Price impact from UniV2 quote
  const priceImpact = useMemo(() => {
    if (uniV2Quote) return uniV2Quote.priceImpact;
    return 0;
  }, [uniV2Quote]);

  // Check if approval needed
  const needsApproval = useMemo(() => {
    if (tokenIn.address === NATIVE_ETH_ADDRESS) return false;
    if (!quote && !uniV2Quote) return false;
    if (!inputAmount) return false;
    const amountInWei = BigInt(Math.floor(parseFloat(inputAmount) * Math.pow(10, tokenIn.decimals)));
    return (allowance as bigint || 0n) < amountInWei;
  }, [tokenIn, quote, uniV2Quote, inputAmount, allowance]);

  // Flip tokens
  const handleFlip = useCallback(() => {
    const temp = tokenIn;
    setTokenIn(tokenOut);
    setTokenOut(temp);
    setInputAmount("");
    setQuote(null);
    setUniV2Quote(null);
  }, [tokenIn, tokenOut]);

  // Set max amount
  const handleSetMax = useCallback(() => {
    const balance = parseFloat(formattedBalance);
    if (tokenIn.address === NATIVE_ETH_ADDRESS) {
      // Leave some for gas
      setInputAmount(Math.max(0, balance - 0.001).toFixed(6));
    } else {
      setInputAmount(balance.toString());
    }
  }, [formattedBalance, tokenIn]);

  // Approve token
  const handleApprove = useCallback(async () => {
    if ((!quote && !uniV2Quote) || !userAddress) return;

    setSwapStep("approving");
    setSwapError(null);

    try {
      const amountInWei = BigInt(Math.floor(parseFloat(inputAmount) * Math.pow(10, tokenIn.decimals)));

      // Use UniV2 router for DONUT swaps, Kyber router otherwise
      const spender = uniV2Quote
        ? LAUNCHPAD_ADDRESSES.uniV2Router
        : (quote?.routerAddress ?? "");

      sendTransaction(
        {
          to: tokenIn.address as Address,
          data: `0x095ea7b3${spender.slice(2).padStart(64, "0")}${amountInWei.toString(16).padStart(64, "0")}` as `0x${string}`,
          chainId: base.id,
        },
        {
          onSuccess: () => {
            setSwapStep("idle");
            refetchAllowance();
          },
          onError: (error) => {
            console.error("Approve error:", error);
            setSwapStep("idle");
            setSwapError("Approval failed");
          },
        }
      );
    } catch (error) {
      console.error("Approve error:", error);
      setSwapStep("idle");
      setSwapError("Approval failed");
    }
  }, [quote, uniV2Quote, userAddress, inputAmount, tokenIn, sendTransaction, refetchAllowance]);

  // Execute swap
  const handleSwap = useCallback(async () => {
    if ((!quote && !uniV2Quote) || !userAddress) return;

    setSwapStep("swapping");
    setSwapError(null);

    try {
      // Handle UniV2 swaps for DONUT
      if (uniV2Quote) {
        const isEthIn = tokenIn.address === NATIVE_ETH_ADDRESS;
        const swapData = buildUniV2SwapCalldata(
          uniV2Quote,
          userAddress as Address,
          100, // 1% slippage
          isEthIn
        );

        sendTransaction(
          {
            to: swapData.to,
            data: swapData.data,
            value: swapData.value,
            chainId: base.id,
          },
          {
            onSuccess: () => {
              setSwapStep("confirming");
            },
            onError: (error) => {
              console.error("Swap error:", error);
              setSwapStep("idle");
              setSwapError("Swap failed");
            },
          }
        );
        return;
      }

      // Handle Kyber swaps for other tokens
      if (!quote?.routeSummary || !quote?.routerAddress) {
        setSwapStep("idle");
        setSwapError("Invalid quote");
        return;
      }

      const buildResult = await buildKyberSwap(
        quote.routeSummary,
        quote.routerAddress,
        userAddress,
        userAddress,
        100 // 1% slippage
      );

      if (!buildResult?.data) {
        setSwapStep("idle");
        setSwapError("Failed to build swap");
        return;
      }

      const value = tokenIn.address === NATIVE_ETH_ADDRESS
        ? BigInt(quote.routeSummary.amountIn)
        : 0n;

      sendTransaction(
        {
          to: buildResult.data.routerAddress as Address,
          data: buildResult.data.data as `0x${string}`,
          value,
          chainId: base.id,
        },
        {
          onSuccess: () => {
            setSwapStep("confirming");
          },
          onError: (error) => {
            console.error("Swap error:", error);
            setSwapStep("idle");
            setSwapError("Swap failed");
          },
        }
      );
    } catch (error) {
      console.error("Swap error:", error);
      setSwapStep("idle");
      setSwapError("Swap failed");
    }
  }, [quote, uniV2Quote, userAddress, tokenIn, sendTransaction]);

  // Handle confirmation
  useEffect(() => {
    if (isSuccess && swapStep === "confirming") {
      setSwapStep("idle");
      setInputAmount("");
      setQuote(null);
      setUniV2Quote(null);
      refetchTokenBalance();
    }
  }, [isSuccess, swapStep, refetchTokenBalance]);

  const isBusy = swapStep !== "idle" || isSending || isConfirming;

  // Has any quote (Kyber or UniV2)
  const hasQuote = !!(quote || uniV2Quote);

  return {
    // Tokens
    tokenIn,
    tokenOut,
    setTokenIn,
    setTokenOut,
    allTokens,
    handleFlip,

    // Amounts
    inputAmount,
    setInputAmount,
    outputAmount,
    formattedBalance,
    handleSetMax,

    // Quote
    quote,
    uniV2Quote,
    hasQuote,
    isQuoting,
    quoteError,
    priceImpact,

    // Swap
    swapStep,
    swapError,
    isBusy,
    needsApproval,
    handleApprove,
    handleSwap,
  };
}
