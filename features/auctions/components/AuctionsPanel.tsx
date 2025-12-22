"use client";

import React, { useState, useMemo } from "react";
import { formatUnits } from "viem";
import { Gavel, TrendingDown, Clock, ChevronDown, Wallet } from "lucide-react";
import type { Address } from "viem";

import { Card, Button } from "@/components/ui";
import { useAuctions } from "../hooks/useAuctions";
import { type SubgraphRig } from "@/lib/api/launchpad";

interface AuctionsPanelProps {
  userAddress?: Address;
}

const formatEth = (value: bigint, decimals = 18) => {
  const num = Number(formatUnits(value, decimals));
  return num.toFixed(5);
};

const formatLp = (value: bigint) => {
  const num = Number(formatUnits(value, 18));
  if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(2)}K`;
  return num.toFixed(2);
};

function RigSelector({
  rigs,
  selected,
  onSelect,
}: {
  rigs: SubgraphRig[];
  selected: SubgraphRig | null;
  onSelect: (rig: SubgraphRig) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 p-3 bg-zinc-900 border border-zinc-800 hover:border-brand-pink/30 rounded transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-brand-pink/20 border border-brand-pink/30 flex items-center justify-center">
            <span className="text-brand-pink font-bold text-xs">
              {selected?.symbol?.slice(0, 2) || "?"}
            </span>
          </div>
          <div className="text-left">
            <div className="text-sm font-bold text-white">{selected?.name || "Select Rig"}</div>
            <div className="text-[10px] font-mono text-zinc-500">${selected?.symbol || "-"}</div>
          </div>
        </div>
        <ChevronDown
          size={16}
          className={`text-zinc-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-zinc-800 rounded shadow-xl z-50 max-h-48 overflow-y-auto custom-scrollbar">
          {rigs.map((rig) => (
            <button
              key={rig.id}
              onClick={() => {
                onSelect(rig);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 p-2 hover:bg-zinc-800 transition-colors ${
                selected?.id === rig.id ? "bg-brand-pink/10" : ""
              }`}
            >
              <div className="w-6 h-6 rounded bg-brand-pink/20 flex items-center justify-center">
                <span className="text-brand-pink font-bold text-[10px]">
                  {rig.symbol?.slice(0, 2)}
                </span>
              </div>
              <div className="text-left flex-1">
                <div className="text-xs font-bold text-white">{rig.name}</div>
                <div className="text-[9px] font-mono text-zinc-500">${rig.symbol}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function AuctionsPanel({ userAddress }: AuctionsPanelProps) {
  const {
    rigs,
    selectedRig,
    setSelectedRig,
    auctionState,
    isLoading,
    buyStep,
    buyResult,
    isBusy,
    handleApprove,
    handleBuy,
  } = useAuctions(userAddress);

  const [buyAmount, setBuyAmount] = useState("");

  // Parse buy amount
  const parsedBuyAmount = useMemo(() => {
    try {
      if (!buyAmount) return 0n;
      const [whole, fraction = ""] = buyAmount.split(".");
      const paddedFraction = fraction.padEnd(18, "0").slice(0, 18);
      return BigInt(whole || "0") * 10n ** 18n + BigInt(paddedFraction);
    } catch {
      return 0n;
    }
  }, [buyAmount]);

  // Check if needs approval
  const needsApproval = useMemo(() => {
    if (!auctionState) return false;
    return auctionState.accountLpAllowance < parsedBuyAmount;
  }, [auctionState, parsedBuyAmount]);

  // Check if has sufficient balance
  const hasSufficientBalance = useMemo(() => {
    if (!auctionState) return false;
    return auctionState.accountLpBalance >= parsedBuyAmount;
  }, [auctionState, parsedBuyAmount]);

  // Time until next price drop
  const timeUntilDrop = useMemo(() => {
    if (!auctionState) return "-";
    const elapsed = BigInt(Math.floor(Date.now() / 1000)) - auctionState.startTime;
    // Assuming 24 hour epochs
    const epochDuration = 86400n;
    const remaining = epochDuration - (elapsed % epochDuration);
    const hours = Number(remaining / 3600n);
    const minutes = Number((remaining % 3600n) / 60n);
    return `${hours}h ${minutes}m`;
  }, [auctionState]);

  const handleSubmit = async () => {
    if (!userAddress || parsedBuyAmount === 0n) return;

    if (needsApproval) {
      await handleApprove();
    } else {
      await handleBuy(parsedBuyAmount);
    }
  };

  const getButtonText = () => {
    if (buyResult === "success") return "SUCCESS!";
    if (buyResult === "failure") return "FAILED";
    if (buyStep === "approving") return "APPROVING...";
    if (buyStep === "buying") return "BUYING...";
    if (!userAddress) return "CONNECT WALLET";
    if (parsedBuyAmount === 0n) return "ENTER AMOUNT";
    if (!hasSufficientBalance) return "INSUFFICIENT LP";
    if (needsApproval) return "APPROVE LP";
    return "BUY TOKENS";
  };

  const canBuy = userAddress && parsedBuyAmount > 0n && hasSufficientBalance;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-zinc-600 text-xs font-mono">Loading auctions...</div>
      </div>
    );
  }

  if (rigs.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-zinc-600 text-xs font-mono">No rigs available</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-3 overflow-hidden">
      {/* Rig Selector */}
      <RigSelector rigs={rigs} selected={selectedRig} onSelect={setSelectedRig} />

      {/* Auction Info */}
      <div className="grid grid-cols-2 gap-2 shrink-0">
        <Card variant="cyber" noPadding>
          <div className="p-3">
            <div className="flex items-center gap-1 mb-1">
              <TrendingDown size={10} className="text-emerald-400" />
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">
                Current Price
              </span>
            </div>
            <div className="text-xl font-bold font-mono text-emerald-400">
              Ξ{auctionState ? formatEth(auctionState.price) : "-"}
            </div>
            <div className="text-[9px] font-mono text-zinc-600">
              per {selectedRig?.symbol || "token"}
            </div>
          </div>
        </Card>
        <Card variant="cyber" noPadding>
          <div className="p-3">
            <div className="flex items-center gap-1 mb-1">
              <Clock size={10} className="text-yellow-400" />
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">
                Next Drop
              </span>
            </div>
            <div className="text-xl font-bold font-mono text-yellow-400">{timeUntilDrop}</div>
            <div className="text-[9px] font-mono text-zinc-600">Dutch auction</div>
          </div>
        </Card>
      </div>

      {/* LP Balance */}
      <Card variant="cyber" noPadding className="shrink-0">
        <div className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Wallet size={10} className="text-brand-pink" />
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">
                Your LP Balance
              </span>
            </div>
            <span className="text-sm font-bold font-mono text-white">
              {auctionState ? formatLp(auctionState.accountLpBalance) : "0"} LP
            </span>
          </div>
        </div>
      </Card>

      {/* Buy Form */}
      <Card variant="cyber" noPadding className="flex-1">
        <div className="p-3 flex flex-col h-full">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
              LP Amount to Spend
            </span>
            <button
              onClick={() => {
                if (auctionState) {
                  setBuyAmount(formatUnits(auctionState.accountLpBalance, 18));
                }
              }}
              className="text-[10px] font-mono text-brand-pink hover:text-brand-pinkHover"
            >
              MAX
            </button>
          </div>
          <div className="flex items-center gap-3 bg-black/40 border border-white/10 rounded px-3 py-2">
            <input
              type="text"
              value={buyAmount}
              onChange={(e) => {
                const val = e.target.value;
                if (/^\d*\.?\d*$/.test(val)) setBuyAmount(val);
              }}
              placeholder="0.00"
              className="flex-1 bg-transparent text-xl font-bold font-mono text-white placeholder:text-zinc-700 focus:outline-none"
            />
            <span className="text-sm font-mono text-zinc-500">LP</span>
          </div>

          {parsedBuyAmount > 0n && auctionState && auctionState.price > 0n && (
            <div className="mt-2 p-2 bg-zinc-900/50 rounded">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-zinc-500">You will receive:</span>
                <span className="text-emerald-400">
                  ~{formatLp((parsedBuyAmount * 10n ** 18n) / auctionState.price)}{" "}
                  {selectedRig?.symbol}
                </span>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Buy Button */}
      <Button
        variant="primary"
        fullWidth
        onClick={handleSubmit}
        disabled={isBusy || !canBuy}
        className={`shrink-0 !py-3 ${
          buyResult === "success"
            ? "!bg-emerald-500"
            : buyResult === "failure"
            ? "!bg-red-500"
            : ""
        }`}
      >
        <Gavel size={16} className="mr-2" />
        {getButtonText()}
      </Button>
    </div>
  );
}
