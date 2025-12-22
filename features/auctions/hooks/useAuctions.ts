"use client";

import { useState, useEffect, useCallback } from "react";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { base } from "wagmi/chains";
import { type Address } from "viem";

import {
  LAUNCHPAD_ADDRESSES,
  LAUNCHPAD_MULTICALL_ABI,
  ERC20_ABI,
} from "@/lib/blockchain/contracts";
import { getRigs, type SubgraphRig } from "@/lib/api/launchpad";
import { POLLING_INTERVAL_MS } from "@/config/constants";

export interface AuctionData {
  rig: SubgraphRig;
  epochId: bigint;
  initPrice: bigint;
  startTime: bigint;
  price: bigint;
  accountLpBalance: bigint;
  accountLpAllowance: bigint;
}

export type BuyStep = "idle" | "approving" | "buying";

export function useAuctions(userAddress?: Address) {
  const [rigs, setRigs] = useState<SubgraphRig[]>([]);
  const [selectedRig, setSelectedRig] = useState<SubgraphRig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [buyStep, setBuyStep] = useState<BuyStep>("idle");
  const [buyResult, setBuyResult] = useState<"success" | "failure" | null>(null);

  // Clear result after delay
  useEffect(() => {
    if (buyResult) {
      const timeout = setTimeout(() => setBuyResult(null), 3000);
      return () => clearTimeout(timeout);
    }
  }, [buyResult]);

  // Fetch rigs
  const fetchRigs = useCallback(async () => {
    try {
      const fetchedRigs = await getRigs(20, 0, "revenue", "desc");
      setRigs(fetchedRigs);
      if (!selectedRig && fetchedRigs.length > 0) {
        setSelectedRig(fetchedRigs[0]);
      }
    } catch (error) {
      console.error("Failed to fetch rigs:", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedRig]);

  useEffect(() => {
    fetchRigs();
    const interval = setInterval(fetchRigs, POLLING_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchRigs]);

  // Get auction state for selected rig
  const { data: auctionState, refetch: refetchAuction } = useReadContract({
    address: LAUNCHPAD_ADDRESSES.multicall as Address,
    abi: LAUNCHPAD_MULTICALL_ABI,
    functionName: "getAuctionState",
    args: [
      (selectedRig?.id as Address) ?? "0x0000000000000000000000000000000000000000",
      userAddress ?? "0x0000000000000000000000000000000000000000",
    ],
    chainId: base.id,
    query: {
      enabled: !!selectedRig,
      refetchInterval: POLLING_INTERVAL_MS,
    },
  });

  // Write hooks for buying
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
      refetchAuction();
    } else if (approveReceipt?.status === "reverted") {
      setBuyResult("failure");
      setBuyStep("idle");
      resetApprove();
    }
  }, [approveReceipt, resetApprove, refetchAuction]);

  // Handle buy completion
  useEffect(() => {
    if (buyReceipt?.status === "success") {
      setBuyResult("success");
      setBuyStep("idle");
      resetBuy();
      refetchAuction();
    } else if (buyReceipt?.status === "reverted") {
      setBuyResult("failure");
      setBuyStep("idle");
      resetBuy();
    }
  }, [buyReceipt, resetBuy, refetchAuction]);

  // Approve LP tokens
  const handleApprove = useCallback(async () => {
    if (!userAddress || !selectedRig) return;
    setBuyStep("approving");
    try {
      await writeApprove({
        account: userAddress,
        address: selectedRig.lp as Address,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [LAUNCHPAD_ADDRESSES.multicall as Address, BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")],
        chainId: base.id,
      });
    } catch (error) {
      console.error("Approve failed:", error);
      setBuyResult("failure");
      setBuyStep("idle");
    }
  }, [userAddress, selectedRig, writeApprove]);

  // Buy from auction
  const handleBuy = useCallback(
    async (lpAmount: bigint) => {
      if (!userAddress || !selectedRig || !auctionState) return;
      setBuyStep("buying");
      try {
        const state = auctionState as {
          epochId: bigint;
          price: bigint;
        };
        const deadline = BigInt(Math.floor(Date.now() / 1000) + 900); // 15 min

        await writeBuy({
          account: userAddress,
          address: LAUNCHPAD_ADDRESSES.multicall as Address,
          abi: LAUNCHPAD_MULTICALL_ABI,
          functionName: "buy",
          args: [
            selectedRig.id as Address,
            userAddress,
            state.epochId,
            deadline,
            state.price,
            lpAmount,
          ],
          chainId: base.id,
        });
      } catch (error) {
        console.error("Buy failed:", error);
        setBuyResult("failure");
        setBuyStep("idle");
      }
    },
    [userAddress, selectedRig, auctionState, writeBuy]
  );

  const isBusy =
    buyStep !== "idle" ||
    isApprovePending ||
    isBuyPending ||
    isApproveConfirming ||
    isBuyConfirming;

  return {
    rigs,
    selectedRig,
    setSelectedRig,
    auctionState: auctionState as {
      epochId: bigint;
      initPrice: bigint;
      startTime: bigint;
      price: bigint;
      accountLpBalance: bigint;
      accountLpAllowance: bigint;
    } | undefined,
    isLoading,
    buyStep,
    buyResult,
    isBusy,
    handleApprove,
    handleBuy,
    refetchAuction,
  };
}
