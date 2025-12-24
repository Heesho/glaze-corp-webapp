"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { base } from "wagmi/chains";
import { type Address, zeroAddress } from "viem";

import {
  LSG_ADDRESSES,
  LSG_MULTICALL_ABI,
  ERC20_ABI,
  PAYMENT_TOKEN_SYMBOLS,
} from "@/lib/blockchain/contracts";
import { POLLING_INTERVAL_MS } from "@/config/constants";

// Strategy data from LSG Multicall
export interface StrategyAuctionData {
  strategy: Address;
  bribe: Address;
  bribeRouter: Address;
  paymentToken: Address;
  paymentReceiver: Address;
  isAlive: boolean;
  paymentTokenDecimals: number;
  strategyWeight: bigint;
  votePercent: bigint;
  claimable: bigint;
  pendingRevenue: bigint;
  routerRevenue: bigint;
  totalPotentialRevenue: bigint;
  epochPeriod: bigint;
  priceMultiplier: bigint;
  minInitPrice: bigint;
  epochId: bigint;
  initPrice: bigint;
  startTime: bigint;
  currentPrice: bigint;
  revenueBalance: bigint;
  accountVotes: bigint;
  accountPaymentTokenBalance: bigint;
}

export type BuyStep = "idle" | "approving" | "buying";

export function useAuctions(userAddress?: Address) {
  const [selectedStrategy, setSelectedStrategy] = useState<StrategyAuctionData | null>(null);
  const [buyStep, setBuyStep] = useState<BuyStep>("idle");
  const [buyResult, setBuyResult] = useState<"success" | "failure" | null>(null);

  // Clear result after delay
  useEffect(() => {
    if (buyResult) {
      const timeout = setTimeout(() => setBuyResult(null), 3000);
      return () => clearTimeout(timeout);
    }
  }, [buyResult]);

  // Fetch all strategies data
  const { data: rawStrategiesData, refetch: refetchStrategies, isLoading } = useReadContract({
    address: LSG_ADDRESSES.lsgMulticall as Address,
    abi: LSG_MULTICALL_ABI,
    functionName: "getAllStrategiesData",
    args: [userAddress ?? zeroAddress],
    chainId: base.id,
    query: {
      refetchInterval: POLLING_INTERVAL_MS,
    },
  });

  // Parse strategies data
  const strategies = useMemo(() => {
    if (!rawStrategiesData) return [];
    return (rawStrategiesData as unknown as StrategyAuctionData[]).filter((s) => s.isAlive);
  }, [rawStrategiesData]);

  // Auto-select first strategy
  useEffect(() => {
    if (!selectedStrategy && strategies.length > 0) {
      setSelectedStrategy(strategies[0]);
    }
  }, [strategies, selectedStrategy]);

  // Update selected strategy when data refreshes
  useEffect(() => {
    if (selectedStrategy && strategies.length > 0) {
      const updated = strategies.find(
        (s) => s.strategy.toLowerCase() === selectedStrategy.strategy.toLowerCase()
      );
      if (updated) {
        setSelectedStrategy(updated);
      }
    }
  }, [strategies, selectedStrategy]);

  // Check allowance for payment token
  const { data: paymentTokenAllowance, refetch: refetchAllowance } = useReadContract({
    address: selectedStrategy?.paymentToken as Address,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: userAddress && selectedStrategy
      ? [userAddress, LSG_ADDRESSES.lsgMulticall as Address]
      : undefined,
    chainId: base.id,
    query: {
      enabled: !!userAddress && !!selectedStrategy,
    },
  });

  // Write hooks
  const {
    data: approveTxHash,
    writeContract: writeApprove,
    isPending: isApprovePending,
    reset: resetApprove,
  } = useWriteContract();

  const {
    data: buyTxHash,
    writeContract: writeBuy,
    isPending: isBuyPending,
    reset: resetBuy,
  } = useWriteContract();

  // Wait for receipts
  const { data: approveReceipt, isLoading: isApproveConfirming } = useWaitForTransactionReceipt({
    hash: approveTxHash,
    chainId: base.id,
  });

  const { data: buyReceipt, isLoading: isBuyConfirming } = useWaitForTransactionReceipt({
    hash: buyTxHash,
    chainId: base.id,
  });

  // Handle approve completion
  useEffect(() => {
    if (approveReceipt?.status === "success") {
      setBuyStep("idle");
      resetApprove();
      refetchAllowance();
      refetchStrategies();
    } else if (approveReceipt?.status === "reverted") {
      setBuyResult("failure");
      setBuyStep("idle");
      resetApprove();
    }
  }, [approveReceipt, resetApprove, refetchAllowance, refetchStrategies]);

  // Handle buy completion
  useEffect(() => {
    if (buyReceipt?.status === "success") {
      setBuyResult("success");
      setBuyStep("idle");
      resetBuy();
      refetchStrategies();
    } else if (buyReceipt?.status === "reverted") {
      setBuyResult("failure");
      setBuyStep("idle");
      resetBuy();
    }
  }, [buyReceipt, resetBuy, refetchStrategies]);

  // Approve payment tokens
  const handleApprove = useCallback(async () => {
    if (!userAddress || !selectedStrategy) return;
    setBuyStep("approving");
    try {
      await writeApprove({
        account: userAddress,
        address: selectedStrategy.paymentToken,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [
          LSG_ADDRESSES.lsgMulticall as Address,
          BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
        ],
        chainId: base.id,
      });
    } catch (error) {
      console.error("Approve failed:", error);
      setBuyResult("failure");
      setBuyStep("idle");
    }
  }, [userAddress, selectedStrategy, writeApprove]);

  // Buy from auction (distributeAndBuy)
  const handleBuy = useCallback(
    async (maxPaymentAmount: bigint) => {
      if (!userAddress || !selectedStrategy) return;
      setBuyStep("buying");
      try {
        const deadline = BigInt(Math.floor(Date.now() / 1000) + 900); // 15 min

        await writeBuy({
          account: userAddress,
          address: LSG_ADDRESSES.lsgMulticall as Address,
          abi: LSG_MULTICALL_ABI,
          functionName: "distributeAndBuy",
          args: [
            selectedStrategy.strategy,
            selectedStrategy.epochId,
            deadline,
            maxPaymentAmount,
          ],
          chainId: base.id,
        });
      } catch (error) {
        console.error("Buy failed:", error);
        setBuyResult("failure");
        setBuyStep("idle");
      }
    },
    [userAddress, selectedStrategy, writeBuy]
  );

  // Check if needs approval
  const needsApproval = useCallback(
    (amount: bigint) => {
      if (!paymentTokenAllowance) return true;
      return (paymentTokenAllowance as bigint) < amount;
    },
    [paymentTokenAllowance]
  );

  const isBusy =
    buyStep !== "idle" ||
    isApprovePending ||
    isBuyPending ||
    isApproveConfirming ||
    isBuyConfirming;

  // Get payment token symbol
  const getPaymentTokenSymbol = (address: Address) => {
    return PAYMENT_TOKEN_SYMBOLS[address.toLowerCase()] || "TOKEN";
  };

  return {
    strategies,
    selectedStrategy,
    setSelectedStrategy,
    isLoading,
    buyStep,
    buyResult,
    isBusy,
    needsApproval,
    handleApprove,
    handleBuy,
    refetchStrategies,
    getPaymentTokenSymbol,
    paymentTokenAllowance: paymentTokenAllowance as bigint | undefined,
  };
}
