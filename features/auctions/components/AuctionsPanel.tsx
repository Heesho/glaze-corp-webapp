"use client";

import React, { useState, useMemo } from "react";
import { formatUnits } from "viem";
import { Gavel, TrendingDown, Clock, ChevronDown, Wallet, Percent } from "lucide-react";
import type { Address } from "viem";

import { Card, Button } from "@/components/ui";
import { useAuctions, type StrategyAuctionData } from "../hooks/useAuctions";

interface AuctionsPanelProps {
  userAddress?: Address;
}

const formatTokenAmount = (value: bigint, decimals = 18) => {
  const num = Number(formatUnits(value, decimals));
  if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(2)}K`;
  if (num < 0.01 && num > 0) return num.toFixed(6);
  return num.toFixed(2);
};

const truncateAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

function StrategySelector({
  strategies,
  selected,
  onSelect,
  getPaymentTokenSymbol,
}: {
  strategies: StrategyAuctionData[];
  selected: StrategyAuctionData | null;
  onSelect: (strategy: StrategyAuctionData) => void;
  getPaymentTokenSymbol: (address: Address) => string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const getVotePercent = (strategy: StrategyAuctionData) => {
    const percent = Number(strategy.votePercent) / 100;
    return percent.toFixed(2);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 p-3 bg-zinc-900 border border-zinc-800 hover:border-glaze-500/30 rounded transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-glaze-500/20 border border-glaze-500/30 flex items-center justify-center">
            <Gavel size={14} className="text-glaze-400" />
          </div>
          <div className="text-left">
            <div className="text-sm font-bold text-white">
              {selected ? truncateAddress(selected.strategy) : "Select Strategy"}
            </div>
            <div className="text-[10px] font-mono text-zinc-500">
              {selected ? `${getVotePercent(selected)}% votes • ${getPaymentTokenSymbol(selected.paymentToken)}` : "-"}
            </div>
          </div>
        </div>
        <ChevronDown
          size={16}
          className={`text-zinc-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-zinc-800 rounded shadow-xl z-50 max-h-48 overflow-y-auto custom-scrollbar">
          {strategies.map((strategy) => (
            <button
              key={strategy.strategy}
              onClick={() => {
                onSelect(strategy);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 p-2 hover:bg-zinc-800 transition-colors ${
                selected?.strategy === strategy.strategy ? "bg-glaze-500/10" : ""
              }`}
            >
              <div className="w-6 h-6 rounded bg-glaze-500/20 flex items-center justify-center">
                <Gavel size={10} className="text-glaze-400" />
              </div>
              <div className="text-left flex-1">
                <div className="text-xs font-bold text-white">{truncateAddress(strategy.strategy)}</div>
                <div className="text-[9px] font-mono text-zinc-500">
                  {getVotePercent(strategy)}% • {getPaymentTokenSymbol(strategy.paymentToken)}
                </div>
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
    getPaymentTokenSymbol,
  } = useAuctions(userAddress);

  const [buyAmount, setBuyAmount] = useState("");

  const paymentDecimals = selectedStrategy?.paymentTokenDecimals ?? 18;
  const paymentSymbol = selectedStrategy ? getPaymentTokenSymbol(selectedStrategy.paymentToken) : "TOKEN";

  // Parse buy amount with correct decimals
  const parsedBuyAmount = useMemo(() => {
    try {
      if (!buyAmount) return 0n;
      const [whole, fraction = ""] = buyAmount.split(".");
      const paddedFraction = fraction.padEnd(paymentDecimals, "0").slice(0, paymentDecimals);
      return BigInt(whole || "0") * 10n ** BigInt(paymentDecimals) + BigInt(paddedFraction);
    } catch {
      return 0n;
    }
  }, [buyAmount, paymentDecimals]);

  // Check if needs approval for this amount
  const requiresApproval = useMemo(() => {
    return needsApproval(parsedBuyAmount);
  }, [needsApproval, parsedBuyAmount]);

  // Check if has sufficient balance
  const hasSufficientBalance = useMemo(() => {
    if (!selectedStrategy) return false;
    return selectedStrategy.accountPaymentTokenBalance >= parsedBuyAmount;
  }, [selectedStrategy, parsedBuyAmount]);

  // Time until next epoch/price drop
  const timeUntilDrop = useMemo(() => {
    if (!selectedStrategy) return "-";
    const now = BigInt(Math.floor(Date.now() / 1000));
    const elapsed = now - selectedStrategy.startTime;
    const epochDuration = selectedStrategy.epochPeriod;
    if (epochDuration === 0n) return "-";
    const remaining = epochDuration - (elapsed % epochDuration);
    const hours = Number(remaining / 3600n);
    const minutes = Number((remaining % 3600n) / 60n);
    return `${hours}h ${minutes}m`;
  }, [selectedStrategy]);

  const handleSubmit = async () => {
    if (!userAddress || parsedBuyAmount === 0n) return;

    if (requiresApproval) {
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
    if (!hasSufficientBalance) return `INSUFFICIENT ${paymentSymbol}`;
    if (requiresApproval) return `APPROVE ${paymentSymbol}`;
    return "BUY VOTES";
  };

  const canBuy = userAddress && parsedBuyAmount > 0n && hasSufficientBalance;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-zinc-600 text-xs font-mono">Loading strategies...</div>
      </div>
    );
  }

  if (strategies.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-zinc-600 text-xs font-mono">No strategies available</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-3 overflow-hidden">
      {/* Strategy Selector */}
      <StrategySelector
        strategies={strategies}
        selected={selectedStrategy}
        onSelect={setSelectedStrategy}
        getPaymentTokenSymbol={getPaymentTokenSymbol}
      />

      {/* Auction Info */}
      <div className="grid grid-cols-2 gap-3 shrink-0">
        <Card size="sm">
          <div className="flex flex-col items-center text-center">
            <div className="text-xs text-corp-400 mb-1 flex items-center gap-1">
              <TrendingDown size={12} className="text-emerald-400" />
              Current Price
            </div>
            <div className="text-2xl font-bold text-emerald-400">
              {selectedStrategy
                ? formatTokenAmount(selectedStrategy.currentPrice, paymentDecimals)
                : "-"}
            </div>
            <div className="text-xs text-corp-500">
              {paymentSymbol} per vote
            </div>
          </div>
        </Card>
        <Card size="sm">
          <div className="flex flex-col items-center text-center">
            <div className="text-xs text-corp-400 mb-1 flex items-center gap-1">
              <Clock size={12} className="text-yellow-400" />
              Next Epoch
            </div>
            <div className="text-2xl font-bold text-yellow-400">{timeUntilDrop}</div>
            <div className="text-xs text-corp-500">Dutch auction</div>
          </div>
        </Card>
      </div>

      {/* Revenue Info */}
      <Card size="sm" className="shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Percent size={14} className="text-glaze-400" />
            <span className="text-sm text-corp-400">Revenue Available</span>
          </div>
          <span className="text-sm font-semibold text-corp-50">
            {selectedStrategy
              ? formatTokenAmount(selectedStrategy.totalPotentialRevenue, paymentDecimals)
              : "0"}{" "}
            {paymentSymbol}
          </span>
        </div>
      </Card>

      {/* Payment Token Balance */}
      <Card size="sm" className="shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet size={14} className="text-glaze-400" />
            <span className="text-sm text-corp-400">Your {paymentSymbol} Balance</span>
          </div>
          <span className="text-sm font-semibold text-corp-50">
            {selectedStrategy
              ? formatTokenAmount(selectedStrategy.accountPaymentTokenBalance, paymentDecimals)
              : "0"}{" "}
            {paymentSymbol}
          </span>
        </div>
      </Card>

      {/* Buy Form */}
      <Card size="sm" className="flex-1">
        <div className="flex flex-col h-full gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-corp-400">{paymentSymbol} to Spend</span>
            <button
              onClick={() => {
                if (selectedStrategy) {
                  setBuyAmount(
                    formatUnits(selectedStrategy.accountPaymentTokenBalance, paymentDecimals)
                  );
                }
              }}
              className="text-xs text-glaze-400 hover:text-glaze-300 font-medium"
            >
              MAX
            </button>
          </div>
          <div className="flex items-center gap-3 bg-corp-950/60 border border-corp-700 rounded-lg px-3 py-2.5 focus-within:border-glaze-500/50 transition-colors">
            <input
              type="text"
              value={buyAmount}
              onChange={(e) => {
                const val = e.target.value;
                if (/^\d*\.?\d*$/.test(val)) setBuyAmount(val);
              }}
              placeholder="0.00"
              className="flex-1 bg-transparent text-2xl font-bold text-corp-50 placeholder:text-corp-600 focus:outline-none"
            />
            <span className="text-sm text-corp-500">{paymentSymbol}</span>
          </div>

          {parsedBuyAmount > 0n && selectedStrategy && selectedStrategy.currentPrice > 0n && (
            <div className="p-2.5 bg-corp-800/50 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-corp-400">Votes at current price:</span>
                <span className="text-emerald-400 font-medium">
                  ~{formatTokenAmount(
                    (parsedBuyAmount * 10n ** BigInt(paymentDecimals)) / selectedStrategy.currentPrice,
                    paymentDecimals
                  )}{" "}
                  votes
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
