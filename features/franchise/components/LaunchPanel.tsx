"use client";

import React, { useState } from "react";
import { formatUnits } from "viem";
import { Rocket, Upload, Check, AlertCircle } from "lucide-react";
import type { Address } from "viem";

import { Card, Button, DonutLogo } from "@/components/ui";
import { useLaunchRig, type LaunchParams } from "../hooks/useLaunchRig";
import { LAUNCH_DEFAULTS } from "@/lib/blockchain/contracts";
import { DONUT_DECIMALS } from "@/config/constants";

interface LaunchPanelProps {
  userAddress?: Address;
  onSuccess?: () => void;
}

const formatDonut = (value: bigint) => {
  const num = Number(formatUnits(value, DONUT_DECIMALS));
  return num.toLocaleString(undefined, { maximumFractionDigits: 0 });
};

export function LaunchPanel({ userAddress, onSuccess }: LaunchPanelProps) {
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [description, setDescription] = useState("");

  const {
    step,
    result,
    isBusy,
    donutBalance,
    needsApproval,
    hasSufficientBalance,
    handleApprove,
    handleLaunch,
  } = useLaunchRig(userAddress, onSuccess);

  const isFormValid = name.trim().length >= 2 && symbol.trim().length >= 2;
  const canLaunch = isFormValid && hasSufficientBalance() && userAddress;

  const handleSubmit = async () => {
    if (!canLaunch) return;

    // For now, create a simple metadata JSON and use it directly
    // In production, you'd upload to IPFS first
    const metadata: LaunchParams = {
      name: name.trim(),
      symbol: symbol.trim().toUpperCase(),
      uri: `data:application/json,${encodeURIComponent(JSON.stringify({
        name: name.trim(),
        symbol: symbol.trim().toUpperCase(),
        description: description.trim(),
      }))}`,
    };

    if (needsApproval()) {
      await handleApprove();
    } else {
      await handleLaunch(metadata);
    }
  };

  const getButtonText = () => {
    if (result === "success") return "SUCCESS!";
    if (result === "failure") return "FAILED";
    if (step === "approving") return "APPROVING...";
    if (step === "launching") return "LAUNCHING...";
    if (!userAddress) return "CONNECT WALLET";
    if (!hasSufficientBalance()) return "INSUFFICIENT DONUT";
    if (needsApproval()) return "APPROVE DONUT";
    return "LAUNCH RIG";
  };

  const launchCost = LAUNCH_DEFAULTS.launchDonut;

  return (
    <div className="flex flex-col h-full gap-3 overflow-hidden">
      {/* Cost Info */}
      <Card variant="cyber" noPadding className="shrink-0">
        <div className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-1">
                Launch Cost
              </div>
              <div className="flex items-center gap-2">
                <DonutLogo className="w-5 h-5" />
                <span className="text-xl font-bold font-mono text-brand-pink">
                  {formatDonut(launchCost)}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-1">
                Your Balance
              </div>
              <div className="flex items-center gap-2 justify-end">
                <DonutLogo className="w-4 h-4" />
                <span className={`text-lg font-bold font-mono ${
                  hasSufficientBalance() ? "text-emerald-400" : "text-red-400"
                }`}>
                  {donutBalance ? formatDonut(donutBalance) : "0"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Form */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-3">
        {/* Token Name */}
        <Card variant="cyber" noPadding>
          <div className="p-3">
            <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-2 block">
              Token Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Super Rig"
              maxLength={32}
              className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm font-mono text-white placeholder:text-zinc-700 focus:outline-none focus:border-brand-pink/50"
            />
          </div>
        </Card>

        {/* Token Symbol */}
        <Card variant="cyber" noPadding>
          <div className="p-3">
            <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-2 block">
              Token Symbol
            </label>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="e.g. SRIG"
              maxLength={8}
              className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm font-mono text-white placeholder:text-zinc-700 focus:outline-none focus:border-brand-pink/50 uppercase"
            />
          </div>
        </Card>

        {/* Description */}
        <Card variant="cyber" noPadding>
          <div className="p-3">
            <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-2 block">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your rig..."
              maxLength={200}
              rows={3}
              className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm font-mono text-white placeholder:text-zinc-700 focus:outline-none focus:border-brand-pink/50 resize-none"
            />
          </div>
        </Card>

        {/* Launch Parameters Info */}
        <Card variant="cyber" noPadding className="bg-zinc-900/30">
          <div className="p-3 space-y-2">
            <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">
              Launch Parameters
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
              <div className="flex justify-between">
                <span className="text-zinc-600">Rig Epoch:</span>
                <span className="text-white">1 hour</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">Rig Multiplier:</span>
                <span className="text-white">2x</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">Auction Epoch:</span>
                <span className="text-white">24 hours</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600">Auction Mult:</span>
                <span className="text-white">1.2x</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Launch Button */}
      <Button
        variant="primary"
        fullWidth
        onClick={handleSubmit}
        disabled={isBusy || !canLaunch}
        className={`shrink-0 !py-3 ${
          result === "success"
            ? "!bg-emerald-500"
            : result === "failure"
            ? "!bg-red-500"
            : ""
        }`}
      >
        <Rocket size={16} className="mr-2" />
        {getButtonText()}
      </Button>

      {!hasSufficientBalance() && userAddress && (
        <div className="flex items-center gap-2 p-2 bg-red-500/10 border border-red-500/30 rounded text-center shrink-0">
          <AlertCircle size={14} className="text-red-400 shrink-0" />
          <span className="text-[10px] font-mono text-red-400">
            You need {formatDonut(launchCost)} DONUT to launch a rig
          </span>
        </div>
      )}
    </div>
  );
}
