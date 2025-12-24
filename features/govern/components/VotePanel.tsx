"use client";

import React, { useMemo } from "react";
import { formatUnits, type Address } from "viem";
import { Vote as VoteIcon, Gift, RotateCcw, Check } from "lucide-react";

import { Card, Button } from "@/components/ui";
import { PAYMENT_TOKEN_SYMBOLS } from "@/lib/blockchain/contracts";
import { DONUT_DECIMALS } from "@/config/constants";
import { useVoting } from "../hooks/useVoting";
import {
  formatTimeUntilNextEpoch,
  type VoterData,
  type BribeData,
  type StrategyData,
} from "../hooks/useGovernData";

interface VotePanelProps {
  userAddress?: Address;
  voterData: VoterData | null;
  bribesData: BribeData[];
  strategyDataMap: Map<string, StrategyData>;
  hasVotingPower: boolean;
  canVote: boolean;
  hasActiveVotes: boolean;
  totalPendingRewards: { token: Address; decimals: number; amount: bigint }[];
  allBribeAddresses: Address[];
  onSuccess: () => void;
}

const formatTokenAmount = (value: bigint, decimals: number, maxFractionDigits = 2) => {
  if (value === 0n) return "0";
  const asNumber = Number(formatUnits(value, decimals));
  if (!Number.isFinite(asNumber)) return formatUnits(value, decimals);
  return asNumber.toLocaleString(undefined, { maximumFractionDigits: maxFractionDigits });
};

const getPaymentTokenSymbol = (address: Address): string => {
  return PAYMENT_TOKEN_SYMBOLS[address.toLowerCase()] || "TOKEN";
};

const getStrategyInfo = (paymentToken: Address): { action: string; destination: string } => {
  const symbol = getPaymentTokenSymbol(paymentToken);
  return {
    action: `Buy ${symbol}`,
    destination: "DAO",
  };
};

// Pie chart colors
const CHART_COLORS = [
  "#ec4899", // pink (brand)
  "#8b5cf6", // purple
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
];

function PieChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-zinc-600 text-xs font-mono">No votes yet</div>
      </div>
    );
  }

  let currentAngle = -90; // Start from top

  const slices = data.map((d, i) => {
    const percentage = (d.value / total) * 100;
    const angle = (d.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    // Calculate SVG arc path
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const x1 = 50 + 40 * Math.cos(startRad);
    const y1 = 50 + 40 * Math.sin(startRad);
    const x2 = 50 + 40 * Math.cos(endRad);
    const y2 = 50 + 40 * Math.sin(endRad);
    const largeArc = angle > 180 ? 1 : 0;

    // For very small slices, don't show
    if (percentage < 0.5) return null;

    // If only one slice at 100%, draw a circle
    if (percentage > 99.5) {
      return (
        <circle key={i} cx="50" cy="50" r="40" fill={d.color} className="transition-all duration-300" />
      );
    }

    return (
      <path
        key={i}
        d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
        fill={d.color}
        className="transition-all duration-300 hover:opacity-80"
      />
    );
  });

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full max-w-full max-h-full" preserveAspectRatio="xMidYMid meet">
      {slices}
      {/* Center hole for donut effect */}
      <circle cx="50" cy="50" r="25" fill="#0a0a0a" />
    </svg>
  );
}

export function VotePanel({
  userAddress,
  voterData,
  bribesData,
  strategyDataMap,
  hasVotingPower,
  canVote,
  hasActiveVotes,
  totalPendingRewards,
  allBribeAddresses,
  onSuccess,
}: VotePanelProps) {
  const {
    txStep,
    txResult,
    isBusy,
    voteWeights,
    setVoteWeights,
    totalVoteWeight,
    handleVote,
    handleReset,
    handleClaimBribes,
  } = useVoting(userAddress, onSuccess);

  const hasPendingRewards = totalPendingRewards.length > 0;

  // Prepare pie chart data from current vote distribution
  const pieChartData = useMemo(() => {
    return bribesData.map((bribe, i) => {
      const strategyData = strategyDataMap.get(bribe.strategy.toLowerCase());
      const info = strategyData ? getStrategyInfo(strategyData.paymentToken) : { action: "Unknown" };
      const votePercent = Number(bribe.votePercent) / 1e18;

      return {
        label: info.action,
        value: votePercent,
        color: CHART_COLORS[i % CHART_COLORS.length],
      };
    });
  }, [bribesData, strategyDataMap]);

  const getButtonText = () => {
    if (txResult === "success") return "SUCCESS!";
    if (txResult === "failure") return "FAILED";
    if (txStep === "voting") return "VOTING...";
    if (totalVoteWeight === 0) return "SET WEIGHTS";
    return "VOTE";
  };

  return (
    <div className="flex flex-col h-full gap-3 overflow-hidden">
      {/* Voting Power & Status */}
      <Card noPadding className="shrink-0">
        <div className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-1">
                Voting Power
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-glaze-500/20 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-glaze-400">g</span>
                </div>
                <span className="text-xl font-bold font-mono text-glaze-400">
                  {voterData
                    ? formatTokenAmount(voterData.accountGovernanceTokenBalance, DONUT_DECIMALS)
                    : "-"}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-1">
                Status
              </div>
              <div
                className={`text-sm font-bold font-mono ${
                  canVote ? "text-emerald-400" : "text-yellow-400"
                }`}
              >
                {voterData ? (canVote ? "Ready" : "Voted") : "-"}
              </div>
              <div className="text-[9px] font-mono text-zinc-600">
                {voterData ? formatTimeUntilNextEpoch(voterData.accountLastVoted) : "-"}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Pie Chart & Pending Rewards Row */}
      <div className="grid grid-cols-2 gap-2 shrink-0">
        {/* Pie Chart */}
        <Card noPadding>
          <div className="p-2">
            <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-1 text-center">
              Vote Distribution
            </div>
            <div className="w-24 h-24 mx-auto overflow-hidden">
              <PieChart data={pieChartData} />
            </div>
          </div>
        </Card>

        {/* Pending Rewards */}
        <Card
          noPadding
          className={hasPendingRewards ? "border-emerald-500/30 bg-emerald-500/5" : ""}
        >
          <div className="p-2 flex flex-col h-full">
            <div className="flex items-center gap-1 mb-1">
              <Gift size={10} className={hasPendingRewards ? "text-emerald-400" : "text-zinc-600"} />
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">
                Rewards
              </span>
            </div>
            <div className="flex-1 flex flex-col justify-center">
              {hasPendingRewards ? (
                <div className="space-y-1">
                  {totalPendingRewards.slice(0, 3).map((r) => (
                    <div key={r.token} className="text-[10px] font-mono text-zinc-300">
                      {formatTokenAmount(r.amount, r.decimals, 4)} {getPaymentTokenSymbol(r.token)}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-[10px] font-mono text-zinc-600">No pending rewards</div>
              )}
            </div>
            {hasPendingRewards && (
              <Button
                variant="primary"
                onClick={() => handleClaimBribes(allBribeAddresses)}
                disabled={isBusy}
                className="!py-1 !text-[10px] mt-2 !bg-emerald-500 hover:!bg-emerald-400"
              >
                {txStep === "claiming" ? "..." : "CLAIM"}
              </Button>
            )}
          </div>
        </Card>
      </div>

      {/* Strategies List */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-2">
          Strategies
        </div>
        <div className="h-[calc(100%-20px)] overflow-y-auto custom-scrollbar space-y-2 pr-1">
          {bribesData.length === 0 ? (
            <div className="flex items-center justify-center h-20">
              <div className="text-zinc-600 text-xs font-mono">Loading...</div>
            </div>
          ) : (
            bribesData.map((bribe, i) => {
              const strategyData = strategyDataMap.get(bribe.strategy.toLowerCase());
              const strategyInfo = strategyData
                ? getStrategyInfo(strategyData.paymentToken)
                : { action: `Strategy ${bribe.strategy.slice(0, 8)}...`, destination: "?" };
              const votePercent = Number(bribe.votePercent) / 1e18;
              const currentWeight = voteWeights[bribe.strategy] ?? 0;

              // Get user's earned rewards
              const paymentTokenIndex = strategyData
                ? bribe.rewardTokens.findIndex(
                    (t) => t.toLowerCase() === strategyData.paymentToken.toLowerCase()
                  )
                : -1;
              const userEarned = paymentTokenIndex >= 0 ? bribe.accountRewardsEarned[paymentTokenIndex] : 0n;
              const earnedDecimals = paymentTokenIndex >= 0 ? bribe.rewardTokenDecimals[paymentTokenIndex] : 18;

              // Calculate APR
              const totalRewardsLeft = paymentTokenIndex >= 0 ? bribe.rewardsLeft[paymentTokenIndex] : 0n;
              const apr =
                bribe.totalSupply > 0n && totalRewardsLeft > 0n
                  ? (Number(totalRewardsLeft) / Number(bribe.totalSupply)) * 52 * 100
                  : 0;

              // User's vote as percentage
              const userVotePercent =
                voterData && voterData.accountGovernanceTokenBalance > 0n
                  ? (Number(bribe.accountVote) / Number(voterData.accountGovernanceTokenBalance)) * 100
                  : 0;

              return (
                <Card key={bribe.strategy} noPadding>
                  <div className="p-2">
                    <div className="flex items-center gap-3">
                      {/* Color indicator */}
                      <div
                        className="w-2 h-10 rounded-sm shrink-0"
                        style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                      />

                      {/* Strategy Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold font-mono text-white truncate">
                            {strategyInfo.action}
                          </span>
                          <span className="text-sm font-bold font-mono text-glaze-400">
                            {votePercent.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[9px] font-mono text-zinc-500">
                          <span>
                            APR:{" "}
                            <span className="text-emerald-400">{apr > 0 ? `${apr.toFixed(0)}%` : "-"}</span>
                          </span>
                          <span>
                            Earned:{" "}
                            <span className="text-white">
                              {userEarned > 0n ? formatTokenAmount(userEarned, earnedDecimals, 2) : "0"}
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* Vote Input */}
                      <div className="shrink-0 text-right w-16">
                        {bribe.accountVote > 0n && (
                          <div className="flex items-center justify-end gap-1 mb-1">
                            <Check size={10} className="text-glaze-400" />
                            <span className="text-[9px] font-mono text-glaze-400">
                              {userVotePercent.toFixed(0)}%
                            </span>
                          </div>
                        )}
                        {canVote && (
                          <input
                            type="number"
                            min="0"
                            value={currentWeight}
                            onChange={(e) => {
                              const newWeight = Math.max(0, parseInt(e.target.value) || 0);
                              setVoteWeights((prev) => ({
                                ...prev,
                                [bribe.strategy]: newWeight,
                              }));
                            }}
                            className="w-12 bg-corp-800 border border-corp-700 rounded px-2 py-1 text-[10px] font-mono text-white text-center focus:outline-none focus:border-glaze-500"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 shrink-0">
        {canVote && hasVotingPower && (
          <Button
            variant="primary"
            fullWidth
            onClick={handleVote}
            disabled={isBusy || totalVoteWeight === 0}
            className={`!py-3 ${
              txResult === "success"
                ? "!bg-emerald-500"
                : txResult === "failure"
                ? "!bg-red-500"
                : ""
            }`}
          >
            <VoteIcon size={14} className="mr-2" />
            {getButtonText()}
          </Button>
        )}

        {hasActiveVotes && canVote && (
          <Button
            variant="secondary"
            fullWidth
            onClick={handleReset}
            disabled={isBusy}
            className="!py-2"
          >
            <RotateCcw size={12} className="mr-2" />
            {txStep === "resetting" ? "RESETTING..." : "RESET VOTES"}
          </Button>
        )}

        {!hasVotingPower && (
          <div className="bg-zinc-900 rounded p-3 text-center">
            <div className="text-[10px] font-mono text-zinc-500">
              Stake DONUT to get gDONUT voting power
            </div>
          </div>
        )}

        {hasVotingPower && !canVote && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-2 text-center">
            <div className="text-[10px] font-mono text-yellow-400">Already voted this epoch</div>
            <div className="text-[9px] font-mono text-zinc-500 mt-1">
              {voterData ? formatTimeUntilNextEpoch(voterData.accountLastVoted) : ""}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
