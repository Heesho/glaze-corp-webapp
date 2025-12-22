"use client";

import React, { useState } from "react";
import { ethers } from "ethers";
import {
  Terminal,
  ShieldAlert,
  Zap,
  LayoutGrid,
  BarChart3,
  Users,
  Activity,
  Radio,
  DollarSign,
  Landmark,
  Store,
  ArrowLeftRight,
} from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useWalletClient } from "wagmi";

// UI Components
import { Card, Button, DonutLogo } from "@/components/ui";
import { TV } from "@/features/tv";

// Hooks
import { useMinerData, usePriceTicker, useGlaze } from "@/features/terminal";
import { useGovernData, StakePanel, VotePanel } from "@/features/govern";
import { ExplorePanel, RigDetailPanel } from "@/features/franchise";
import { AuctionsPanel } from "@/features/auctions";
import { useSwap, type SwapToken } from "@/features/swap";
import type { SubgraphRig } from "@/lib/api/launchpad";
import { NATIVE_ETH_ADDRESS } from "@/lib/api/kyber";

// Utils
import { formatEth, formatDonut, truncateAddress } from "@/lib/utils/format";

// Config
import { EXTERNAL_LINKS, REBATE_PERCENTAGE, type TabView } from "@/config/constants";

export default function App() {
  const { address: userAddress, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  // Tab state
  const [activeTab, setActiveTab] = useState<TabView>("TERMINAL");

  // Data hooks
  const {
    minerState,
    setMinerState,
    kingProfile,
    feed,
    feedProfiles,
    stats,
    userGraphStats,
    ethPrice,
    nextHalvingTime,
  } = useMinerData(userAddress);

  const { currentPrice, now, halvingDisplay } = usePriceTicker(
    minerState.initPrice,
    minerState.startTime,
    nextHalvingTime
  );

  const { isGlazing, connectionError, message, setMessage, handleGlaze } = useGlaze(
    userAddress,
    walletClient,
    minerState,
    currentPrice,
    setMinerState
  );

  // Governance data
  const governData = useGovernData(userAddress);

  // Derived values
  const safeDps = minerState?.dps ? BigInt(minerState.dps) : 0n;
  const safeDonutPrice = minerState?.donutPrice ? BigInt(minerState.donutPrice) : 0n;
  const safeInitPrice = minerState?.initPrice ? BigInt(minerState.initPrice) : 0n;

  const elapsedSeconds = BigInt(
    Math.max(0, Math.floor(now / 1000) - Number(minerState.startTime))
  );

  // Format glaze time
  const formatGlazeTime = (seconds: number): string => {
    if (seconds < 0) return "0s";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  const glazeTimeStr = formatGlazeTime(Number(elapsedSeconds));
  const accruedDonutsWei = elapsedSeconds * safeDps;
  const accruedDonutsStr = formatDonut(accruedDonutsWei);

  const WEI = 1000000000000000000n;
  const accruedValueWei = (accruedDonutsWei * safeDonutPrice) / WEI;
  const accruedValueEthNum = parseFloat(ethers.formatEther(accruedValueWei));
  const accruedValueUsdStr = (accruedValueEthNum * ethPrice).toFixed(2);

  // PNL Calculation
  const halfInitPrice = safeInitPrice / 2n;
  const pnlWei = (currentPrice * 80n) / 100n - halfInitPrice;
  const pnlIsPositive = pnlWei >= 0n;
  const pnlAbsWei = pnlIsPositive ? pnlWei : -pnlWei;
  const pnlEthNum = parseFloat(ethers.formatEther(pnlAbsWei));
  const pnlSign = pnlIsPositive ? "+" : "-";
  const pnlEthStr = `${pnlSign}Ξ${pnlEthNum.toFixed(5)}`;
  const pnlUsdNum = pnlEthNum * ethPrice;
  const pnlUsdSigned = pnlIsPositive ? pnlUsdNum : -pnlUsdNum;
  const pnlUsdStr = `${pnlSign}$${pnlUsdNum.toFixed(2)}`;

  // Total
  const accruedUsdNum = parseFloat(accruedValueUsdStr);
  const totalUsdNum = accruedUsdNum + pnlUsdSigned;
  const totalIsPositive = totalUsdNum >= 0;
  const totalUsdStr = `${totalIsPositive ? "+" : "-"}$${Math.abs(totalUsdNum).toFixed(2)}`;

  // Price displays
  const dpsEthWei = (safeDps * safeDonutPrice) / WEI;
  const dpsUsd = parseFloat(ethers.formatEther(dpsEthWei)) * ethPrice;
  const currentPriceEth = parseFloat(ethers.formatEther(currentPrice));
  const rebatePriceEth = currentPriceEth * REBATE_PERCENTAGE;
  const rebatePriceUsd = rebatePriceEth * ethPrice;
  const donutPriceUsd = parseFloat(ethers.formatEther(safeDonutPrice)) * ethPrice;

  return (
    <div className="h-screen w-screen flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <header className="h-14 shrink-0 border-b border-white/5 bg-black/60 backdrop-blur-md flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-3">
            <DonutLogo className="w-8 h-8 animate-spin-slow" />
            <div>
              <h1 className="font-bold text-xl tracking-tight text-white leading-none">
                GLAZE<span className="text-brand-pink">CORP</span>
              </h1>
              <div className="text-[9px] font-mono text-zinc-500 tracking-[0.3em] uppercase">
                Donut Miner Protocol
              </div>
            </div>
          </div>

          <nav className="hidden md:flex items-center bg-white/5 rounded-lg p-1 border border-white/5">
            <button
              onClick={() => setActiveTab("TERMINAL")}
              className={`px-4 py-1.5 text-xs font-bold font-mono rounded transition-all flex items-center gap-2 ${
                activeTab === "TERMINAL"
                  ? "bg-zinc-800 text-white shadow-sm ring-1 ring-white/10"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Terminal size={12} />
              TERMINAL
            </button>
            <button
              onClick={() => setActiveTab("SWAP")}
              className={`px-4 py-1.5 text-xs font-bold font-mono rounded transition-all flex items-center gap-2 ${
                activeTab === "SWAP"
                  ? "bg-zinc-800 text-white shadow-sm ring-1 ring-white/10"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <ArrowLeftRight size={12} />
              SWAP
            </button>
            <button
              onClick={() => setActiveTab("FRANCHISE")}
              className={`px-4 py-1.5 text-xs font-bold font-mono rounded transition-all flex items-center gap-2 ${
                activeTab === "FRANCHISE"
                  ? "bg-zinc-800 text-white shadow-sm ring-1 ring-white/10"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Store size={12} />
              FRANCHISE
            </button>
            <button
              onClick={() => setActiveTab("GOVERN")}
              className={`px-4 py-1.5 text-xs font-bold font-mono rounded transition-all flex items-center gap-2 ${
                activeTab === "GOVERN"
                  ? "bg-zinc-800 text-white shadow-sm ring-1 ring-white/10"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Landmark size={12} />
              GOVERN
            </button>
            <button
              onClick={() => setActiveTab("AUCTIONS")}
              className={`px-4 py-1.5 text-xs font-bold font-mono rounded transition-all flex items-center gap-2 ${
                activeTab === "AUCTIONS"
                  ? "bg-zinc-800 text-white shadow-sm ring-1 ring-white/10"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <LayoutGrid size={12} />
              AUCTIONS
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-4 text-zinc-500">
            <a
              href={EXTERNAL_LINKS.dune}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-brand-pink transition-colors"
            >
              <BarChart3 size={18} />
            </a>
            <a
              href={EXTERNAL_LINKS.farcaster}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-brand-pink transition-colors"
            >
              <Users size={18} />
            </a>
          </div>
          <ConnectButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-3 lg:p-4 overflow-hidden relative z-10">
        {activeTab === "SWAP" ? (
          <SwapDashboard userAddress={userAddress} />
        ) : activeTab === "GOVERN" ? (
          <GovernDashboard
            userAddress={userAddress}
            governData={governData}
          />
        ) : activeTab === "FRANCHISE" ? (
          <FranchiseDashboard userAddress={userAddress} />
        ) : activeTab === "TERMINAL" ? (
          <div className="grid grid-cols-12 gap-4 lg:gap-6 h-full overflow-hidden">
            {/* Column 1: Intel */}
            <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 h-full max-h-full overflow-hidden">
              <CurrentOperatorCard
                kingProfile={kingProfile}
                minerState={minerState}
                glazeTimeStr={glazeTimeStr}
                accruedDonutsStr={accruedDonutsStr}
                accruedValueUsdStr={accruedValueUsdStr}
                pnlEthStr={pnlEthStr}
                pnlUsdStr={pnlUsdStr}
                totalUsdStr={totalUsdStr}
                totalIsPositive={totalIsPositive}
              />

              <SurveillanceLog feed={feed} feedProfiles={feedProfiles} />
            </div>

            {/* Column 2: Main Viewport */}
            <div className="col-span-12 lg:col-span-6 flex flex-col gap-3 h-full max-h-full overflow-hidden">
              <TVFrame
                minerState={minerState}
                isGlazing={isGlazing}
                kingProfile={kingProfile}
              />

              <GlazeControls
                safeDps={safeDps}
                dpsUsd={dpsUsd}
                rebatePriceEth={rebatePriceEth}
                currentPriceEth={currentPriceEth}
                rebatePriceUsd={rebatePriceUsd}
                message={message}
                setMessage={setMessage}
                handleGlaze={handleGlaze}
                isGlazing={isGlazing}
                isConnected={isConnected}
                connectionError={connectionError}
              />
            </div>

            {/* Column 3: Stats */}
            <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 h-full max-h-full overflow-hidden">
              <GlobalMetricsCard
                stats={stats}
                donutPriceUsd={donutPriceUsd}
                halvingDisplay={halvingDisplay}
              />

              <UserMetricsCard
                minerState={minerState}
                userGraphStats={userGraphStats}
              />
            </div>
          </div>
        ) : (
          <AuctionsDashboard userAddress={userAddress} />
        )}
      </main>

      {/* Footer */}
      <footer className="h-8 shrink-0 border-t border-white/5 bg-zinc-900/80 flex items-center justify-between px-6">
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-zinc-800 rounded border border-zinc-700">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-zinc-400">Online</span>
          </div>
        </div>
        <nav className="flex items-center gap-6 text-xs font-mono text-zinc-500">
          <a href="#" className="hover:text-white transition-colors">Docs</a>
          <a href="#" className="hover:text-white transition-colors">Support</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
        </nav>
      </footer>
    </div>
  );
}

// Sub-components (kept in same file for now, can be extracted later)

function CurrentOperatorCard({
  kingProfile,
  minerState,
  glazeTimeStr,
  accruedDonutsStr,
  accruedValueUsdStr,
  pnlEthStr,
  pnlUsdStr,
  totalUsdStr,
  totalIsPositive,
}: any) {
  return (
    <Card variant="cyber" title="CURRENT_OPERATOR" icon={<ShieldAlert size={14} />} className="shrink-0">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <div className="shrink-0 relative">
            {kingProfile?.pfp ? (
              <img
                src={kingProfile.pfp}
                className="w-14 h-14 rounded-lg border border-brand-pink/30 shadow-[0_0_15px_rgba(236,72,153,0.2)] object-cover"
                alt=""
              />
            ) : (
              <div className="w-14 h-14 rounded-lg bg-brand-pink/10 flex items-center justify-center border border-brand-pink/30 text-brand-pink shadow-[0_0_15px_rgba(236,72,153,0.1)]">
                <Zap size={24} />
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-black rounded-full animate-pulse" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-base font-bold text-white truncate font-mono tracking-tight">
              {kingProfile?.displayName || truncateAddress(minerState.miner)}
            </div>
            <div className="text-xs text-zinc-500 font-mono truncate">
              @{kingProfile?.username || "unknown"}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center px-3 py-2 bg-black/20 rounded border border-white/5">
            <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">Time</span>
            <div className="text-sm font-bold text-white font-mono">{glazeTimeStr}</div>
          </div>
          <div className="p-3 bg-black/20 rounded border border-white/5 space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">Glazed</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white font-mono flex items-center gap-0.5">
                  +<DonutLogo className="w-3 h-3" />{accruedDonutsStr}
                </span>
                <span className="text-[10px] text-zinc-600 font-mono">+${accruedValueUsdStr}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">PNL</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold font-mono text-white">{pnlEthStr}</span>
                <span className="text-[10px] text-zinc-600 font-mono">{pnlUsdStr}</span>
              </div>
            </div>
            <div className="border-t border-white/10 pt-1 flex justify-between items-center">
              <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">Total</span>
              <div className={`text-sm font-bold font-mono ${totalIsPositive ? "text-emerald-400" : "text-red-400"}`}>
                {totalUsdStr}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function SurveillanceLog({ feed, feedProfiles }: any) {
  return (
    <Card className="hidden lg:flex flex-1 min-h-0 overflow-hidden" title="SURVEILLANCE_LOG" variant="cyber" noPadding>
      <div className="flex-1 flex flex-col-reverse overflow-y-auto custom-scrollbar p-2 space-y-1.5 space-y-reverse">
        {feed.map((item: any, index: number) => {
          const minerAddr = item.miner?.toLowerCase() || "";
          const profile = minerAddr ? feedProfiles[minerAddr] : null;
          const messageContent = !item.uri || item.uri.trim().length === 0 ? "System Override" : item.uri;
          let displayPrice = "0.000";
          try {
            displayPrice = parseFloat(item.price).toFixed(3);
          } catch {}
          const isLatest = index === 0;

          return (
            <div
              key={item.id}
              className={`p-2.5 rounded border transition-all duration-300 shrink-0 ${
                isLatest
                  ? "bg-brand-pink/10 border-brand-pink/30 shadow-[0_0_15px_rgba(236,72,153,0.15)]"
                  : "bg-black/20 border-white/5 hover:bg-white/5 hover:border-white/10"
              }`}
            >
              <div className="flex items-start gap-2">
                <div className="shrink-0">
                  {profile?.pfp ? (
                    <img src={profile.pfp} className="w-6 h-6 rounded-full border border-white/10 object-cover" alt="" />
                  ) : (
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold ${
                        isLatest
                          ? "bg-brand-pink/20 text-brand-pink border border-brand-pink/30"
                          : "bg-zinc-800 text-zinc-500 border border-white/10"
                      }`}
                    >
                      {truncateAddress(item.miner).slice(0, 2)}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <span
                      className={`font-mono text-[10px] font-bold uppercase tracking-wider truncate ${
                        isLatest ? "text-brand-pink" : "text-zinc-500"
                      }`}
                    >
                      {profile?.username || truncateAddress(item.miner)}
                    </span>
                    <span className="font-mono text-[9px] text-zinc-600 shrink-0 ml-2">Ξ{displayPrice}</span>
                  </div>
                  <div className={`text-xs font-mono leading-relaxed break-words ${isLatest ? "text-white" : "text-zinc-400"}`}>
                    <span className="opacity-50 mr-1">&gt;</span>
                    {messageContent}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function TVFrame({ minerState, isGlazing, kingProfile }: any) {
  return (
    <div className="relative w-full group flex-1 min-h-0 flex flex-col">
      <div className="absolute -top-3 left-0 w-full flex justify-between px-1">
        <div className="w-1/3 h-2 border-t border-l border-zinc-800 rounded-tl" />
        <div className="w-1/3 h-2 border-t border-r border-zinc-800 rounded-tr" />
      </div>

      <div className="bg-black rounded border border-zinc-800 p-1 shadow-2xl relative z-10 flex-1 min-h-0">
        <TV uri={minerState.uri} glazing={isGlazing} overrideAvatar={kingProfile?.pfp} />
      </div>

      <div className="absolute -bottom-3 left-0 w-full flex justify-between px-1">
        <div className="w-1/3 h-2 border-b border-l border-zinc-800 rounded-bl" />
        <div className="w-1/3 h-2 border-b border-r border-zinc-800 rounded-br" />
      </div>
    </div>
  );
}

function GlazeControls({
  safeDps,
  dpsUsd,
  rebatePriceEth,
  currentPriceEth,
  rebatePriceUsd,
  message,
  setMessage,
  handleGlaze,
  isGlazing,
  isConnected,
  connectionError,
}: any) {
  return (
    <div className="shrink-0 flex flex-col gap-3 min-h-0">
      <div className="grid grid-cols-2 gap-3 shrink-0">
        <Card variant="cyber" className="justify-center" noPadding>
          <div className="p-3 flex flex-col items-center text-center">
            <div className="text-[10px] font-mono uppercase text-zinc-500 tracking-widest mb-1">
              Current Glaze Rate
            </div>
            <div className="text-2xl font-bold font-mono text-white tracking-tighter flex items-center gap-2">
              <DonutLogo className="w-5 h-5" />
              {formatDonut(safeDps)} <span className="text-sm text-zinc-600">/s</span>
            </div>
            <div className="text-[10px] font-mono text-zinc-600 mt-1">${dpsUsd.toFixed(4)}/s</div>
          </div>
        </Card>

        <Card variant="cyber" className="justify-center" noPadding>
          <div className="p-3 flex flex-col items-center text-center">
            <div className="text-[10px] font-mono uppercase text-zinc-500 tracking-widest mb-1">
              Glaze Price <span className="text-green-400">(5% Rebate)</span>
            </div>
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-bold font-mono text-brand-pink tracking-tighter">
                Ξ{rebatePriceEth.toFixed(5)}
              </div>
              <div className="text-base font-mono text-zinc-500 line-through">Ξ{currentPriceEth.toFixed(5)}</div>
            </div>
            <div className="text-[10px] font-mono text-zinc-600 mt-1">${rebatePriceUsd.toFixed(2)}</div>
          </div>
        </Card>
      </div>

      <Card variant="cyber" className="shrink-0" noPadding>
        <div className="flex flex-col p-3 gap-2">
          <div className="flex items-center gap-3 bg-black/40 border border-white/10 rounded px-3 py-2 focus-within:border-brand-pink/50 transition-colors">
            <span className="text-brand-pink font-mono text-lg animate-pulse">_</span>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="ENTER PROTOCOL MESSAGE..."
              className="w-full bg-transparent border-none text-sm font-mono text-white placeholder:text-zinc-700 focus:outline-none uppercase tracking-wider"
              maxLength={200}
              spellCheck={false}
            />
          </div>

          <Button
            variant="primary"
            fullWidth
            onClick={handleGlaze}
            disabled={isGlazing || !isConnected || connectionError !== null}
            className="h-10 !text-base !rounded-sm !font-black tracking-widest shadow-[0_0_20px_rgba(236,72,153,0.4)] hover:shadow-[0_0_40px_rgba(236,72,153,0.6)] shrink-0"
          >
            {isGlazing ? "PROCESSING..." : !isConnected ? "CONNECT WALLET" : "INITIATE GLAZE SEQUENCE"}
          </Button>

          {connectionError && <div className="text-xs text-red-500 font-mono text-center">{connectionError}</div>}
        </div>
      </Card>
    </div>
  );
}

function GlobalMetricsCard({ stats, donutPriceUsd, halvingDisplay }: any) {
  return (
    <Card title="GLOBAL_METRICS" variant="cyber">
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Activity size={12} className="text-brand-pink" />
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Total Mined</span>
          </div>
          <div className="text-2xl font-bold font-mono text-white tracking-tight flex items-center gap-2">
            <DonutLogo className="w-5 h-5" />
            {parseFloat(stats.minted).toLocaleString()}
          </div>
        </div>
        <div className="h-px bg-white/5 w-full" />
        <div>
          <div className="flex items-center gap-2 mb-1">
            <DollarSign size={12} className="text-brand-pink" />
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Donut Price</span>
          </div>
          <div className="text-xl font-bold font-mono text-zinc-300 tracking-tight">${donutPriceUsd.toFixed(6)}</div>
        </div>
        <div className="h-px bg-white/5 w-full" />
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Radio size={12} className="text-brand-pink" />
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Next Halving</span>
          </div>
          <div className="text-base font-bold font-mono text-zinc-400 tracking-tight">{halvingDisplay}</div>
        </div>
      </div>
    </Card>
  );
}

function UserMetricsCard({ minerState, userGraphStats }: any) {
  return (
    <Card title="USER_METRICS" variant="cyber" className="hidden lg:flex flex-1 min-h-0 overflow-hidden">
      <div className="grid grid-cols-2 gap-x-4 gap-y-4 content-start overflow-y-auto">
        <div className="space-y-6">
          <div className="space-y-1">
            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Donut Balance</span>
            <div className="text-lg font-bold font-mono text-white tracking-tight truncate flex items-center gap-2">
              <DonutLogo className="w-4 h-4" />
              {formatDonut(minerState.donutBalance)}
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">ETH Balance</span>
            <div className="text-lg font-bold font-mono text-zinc-300 tracking-tight truncate">
              Ξ {formatEth(minerState.ethBalance, 4)}
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">WETH Balance</span>
            <div className="text-lg font-bold font-mono text-zinc-300 tracking-tight truncate">
              Ξ {formatEth(minerState.wethBalance, 4)}
            </div>
          </div>
        </div>

        <div className="space-y-6 text-right">
          <div className="space-y-1">
            <span className="text-[9px] font-mono text-brand-pink/80 uppercase tracking-widest">Donut Mined</span>
            <div className="text-lg font-bold font-mono text-white tracking-tight truncate flex items-center justify-end gap-2">
              <DonutLogo className="w-4 h-4" />
              {userGraphStats?.mined
                ? parseFloat(userGraphStats.mined).toLocaleString("en-US", { maximumFractionDigits: 0 })
                : "0"}
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[9px] font-mono text-brand-pink/80 uppercase tracking-widest">ETH Spent</span>
            <div className="text-lg font-bold font-mono text-zinc-300 tracking-tight truncate">
              Ξ {userGraphStats?.spent ? formatEth(ethers.parseEther(userGraphStats.spent), 3) : "0.000"}
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[9px] font-mono text-brand-pink/80 uppercase tracking-widest">WETH Earned</span>
            <div className="text-lg font-bold font-mono text-zinc-300 tracking-tight truncate">
              Ξ {userGraphStats?.earned ? formatEth(ethers.parseEther(userGraphStats.earned), 3) : "0.000"}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function SwapDashboard({ userAddress }: { userAddress?: `0x${string}` }) {
  return (
    <div className="grid grid-cols-12 gap-4 lg:gap-6 h-full overflow-hidden">
      {/* Left Column: Info */}
      <div className="hidden lg:flex col-span-3 flex-col gap-4 h-full max-h-full overflow-hidden">
        <Card variant="cyber" title="ABOUT_SWAP" icon={<ArrowLeftRight size={14} />}>
          <div className="space-y-4 text-sm">
            <p className="text-zinc-400 font-mono text-xs leading-relaxed">
              Swap between ETH, DONUT, USDC, and all franchise tokens using KyberSwap aggregator for the best rates.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-zinc-500">Best rates across DEXs</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-zinc-500">1% slippage protection</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-zinc-500">Gas optimized routing</span>
              </div>
            </div>
          </div>
        </Card>
        <Card variant="cyber" title="POPULAR_PAIRS" icon={<Activity size={14} />} className="flex-1">
          <div className="space-y-2">
            {[
              { from: "ETH", to: "DONUT" },
              { from: "USDC", to: "DONUT" },
              { from: "ETH", to: "USDC" },
            ].map((pair) => (
              <div
                key={`${pair.from}-${pair.to}`}
                className="flex items-center justify-between p-2 bg-black/20 rounded border border-white/5 hover:border-brand-pink/30 transition-colors cursor-pointer"
              >
                <span className="text-xs font-mono text-white">{pair.from} → {pair.to}</span>
                <span className="text-[10px] font-mono text-zinc-600">Popular</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Center Column: Swap Panel */}
      <div className="col-span-12 lg:col-span-6 flex flex-col h-full max-h-full overflow-hidden">
        <Card
          variant="cyber"
          title="SWAP"
          icon={<ArrowLeftRight size={14} />}
          className="flex-1 min-h-0 overflow-hidden"
        >
          <SwapPanel userAddress={userAddress} />
        </Card>
      </div>

      {/* Right Column: Recent Activity */}
      <div className="hidden lg:flex col-span-3 flex-col gap-4 h-full max-h-full overflow-hidden">
        <Card variant="cyber" title="QUICK_LINKS" icon={<Zap size={14} />}>
          <div className="space-y-2">
            <a
              href="https://dexscreener.com/base/0xd1dbb2e56533c55c3a637d13c53aeef65c5d5703"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2 bg-black/20 rounded border border-white/5 hover:border-brand-pink/30 transition-colors"
            >
              <span className="text-xs font-mono text-white">DONUT Chart</span>
              <span className="text-[10px] font-mono text-brand-pink">↗</span>
            </a>
            <a
              href="https://kyberswap.com/swap/base"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2 bg-black/20 rounded border border-white/5 hover:border-brand-pink/30 transition-colors"
            >
              <span className="text-xs font-mono text-white">KyberSwap</span>
              <span className="text-[10px] font-mono text-brand-pink">↗</span>
            </a>
            <a
              href="https://basescan.org/token/0xAE4a37d554C6D6F3E398546d8566B25052e0169C"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2 bg-black/20 rounded border border-white/5 hover:border-brand-pink/30 transition-colors"
            >
              <span className="text-xs font-mono text-white">DONUT on BaseScan</span>
              <span className="text-[10px] font-mono text-brand-pink">↗</span>
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}

function SwapPanel({ userAddress }: { userAddress?: `0x${string}` }) {
  const {
    tokenIn,
    tokenOut,
    setTokenIn,
    setTokenOut,
    allTokens,
    handleFlip,
    inputAmount,
    setInputAmount,
    outputAmount,
    formattedBalance,
    handleSetMax,
    quote,
    isQuoting,
    quoteError,
    swapStep,
    swapError,
    isBusy,
    needsApproval,
    handleApprove,
    handleSwap,
  } = useSwap();

  const [showTokenSelectIn, setShowTokenSelectIn] = useState(false);
  const [showTokenSelectOut, setShowTokenSelectOut] = useState(false);

  const formatBalance = (bal: string) => {
    const num = parseFloat(bal);
    if (num < 0.0001) return "0.00";
    if (num < 1) return num.toFixed(4);
    if (num < 1000) return num.toFixed(2);
    return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  const formatOutput = (amt: string) => {
    if (!amt) return "0.0";
    const num = parseFloat(amt);
    if (num < 0.0001) return num.toExponential(2);
    if (num < 1) return num.toFixed(6);
    if (num < 1000) return num.toFixed(4);
    return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  const TokenIcon = ({ token, size = "md" }: { token: SwapToken; size?: "sm" | "md" | "lg" }) => {
    const sizeClasses = {
      sm: "w-4 h-4",
      md: "w-6 h-6",
      lg: "w-8 h-8",
    };

    // Use DONUT logo component for DONUT token
    if (token.symbol === "DONUT") {
      return <DonutLogo className={sizeClasses[size]} />;
    }

    // Use logo URL if available
    if (token.logoUrl) {
      return (
        <img
          src={token.logoUrl}
          alt={token.symbol}
          className={`${sizeClasses[size]} rounded-full object-cover`}
          onError={(e) => {
            // Fallback to letter on error
            (e.target as HTMLImageElement).style.display = "none";
            (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
          }}
        />
      );
    }

    // Fallback to first letter
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-brand-pink/20 flex items-center justify-center text-[10px] font-bold text-brand-pink`}>
        {token.symbol.slice(0, 1)}
      </div>
    );
  };

  const TokenSelector = ({
    selected,
    onSelect,
    show,
    onClose,
    exclude,
  }: {
    selected: SwapToken;
    onSelect: (token: SwapToken) => void;
    show: boolean;
    onClose: () => void;
    exclude: string;
  }) => {
    if (!show) return null;

    const baseTokens = allTokens.filter((t) => ["ETH", "DONUT", "USDC"].includes(t.symbol));
    const franchiseTokensList = allTokens.filter((t) => !["ETH", "DONUT", "USDC"].includes(t.symbol));

    const handleSelect = (token: SwapToken) => {
      onSelect(token);
      onClose();
    };

    const handleClose = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onClose();
    };

    return (
      <div className="absolute inset-0 bg-zinc-950 z-50 rounded-lg flex flex-col border border-zinc-800">
        <div className="flex justify-between items-center p-4 border-b border-zinc-800 shrink-0">
          <span className="text-sm font-mono font-bold text-white">SELECT TOKEN</span>
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
          >
            <span className="text-lg leading-none">×</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
          {baseTokens.map((token) => (
            <button
              key={token.address}
              type="button"
              onClick={() => handleSelect(token)}
              disabled={token.address === exclude}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                token.address === exclude
                  ? "opacity-30 cursor-not-allowed"
                  : "hover:bg-zinc-800/80 hover:border-brand-pink/30"
              } border border-transparent`}
            >
              <TokenIcon token={token} size="lg" />
              <div className="text-left flex-1">
                <div className="font-mono font-bold text-white text-sm">{token.symbol}</div>
                <div className="text-[10px] text-zinc-500">{token.name}</div>
              </div>
              {token.address === selected.address && (
                <div className="w-2 h-2 rounded-full bg-brand-pink" />
              )}
            </button>
          ))}
          {franchiseTokensList.length > 0 && (
            <>
              <div className="text-[10px] font-mono text-zinc-600 px-3 pt-3 pb-1 uppercase tracking-wider border-t border-zinc-800/50 mt-2">
                Franchise Tokens ({franchiseTokensList.length})
              </div>
              {franchiseTokensList.map((token) => (
                <button
                  key={token.address}
                  type="button"
                  onClick={() => handleSelect(token)}
                  disabled={token.address === exclude}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    token.address === exclude
                      ? "opacity-30 cursor-not-allowed"
                      : "hover:bg-zinc-800/80 hover:border-brand-pink/30"
                  } border border-transparent`}
                >
                  <TokenIcon token={token} size="lg" />
                  <div className="text-left flex-1">
                    <div className="font-mono font-bold text-white text-sm">{token.symbol}</div>
                    <div className="text-[10px] text-zinc-500 truncate max-w-[150px]">{token.name}</div>
                  </div>
                  {token.address === selected.address && (
                    <div className="w-2 h-2 rounded-full bg-brand-pink" />
                  )}
                </button>
              ))}
            </>
          )}
        </div>
      </div>
    );
  };

  const getButtonText = () => {
    if (!userAddress) return "CONNECT WALLET";
    if (swapStep === "approving") return "APPROVING...";
    if (swapStep === "swapping" || swapStep === "confirming") return "SWAPPING...";
    if (isQuoting) return "GETTING QUOTE...";
    if (quoteError) return quoteError.toUpperCase();
    if (needsApproval) return `APPROVE ${tokenIn.symbol}`;
    if (!inputAmount || parseFloat(inputAmount) <= 0) return "ENTER AMOUNT";
    if (!quote) return "NO ROUTE FOUND";
    return "SWAP";
  };

  const handleButtonClick = () => {
    if (needsApproval) {
      handleApprove();
    } else {
      handleSwap();
    }
  };

  return (
    <div className="flex flex-col gap-4 h-full relative">
      {/* Token Select Modals */}
      <TokenSelector
        selected={tokenIn}
        onSelect={setTokenIn}
        show={showTokenSelectIn}
        onClose={() => setShowTokenSelectIn(false)}
        exclude={tokenOut.address}
      />
      <TokenSelector
        selected={tokenOut}
        onSelect={setTokenOut}
        show={showTokenSelectOut}
        onClose={() => setShowTokenSelectOut(false)}
        exclude={tokenIn.address}
      />

      {/* From Token */}
      <div className="bg-black/40 border border-white/10 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">From</span>
          <button
            onClick={handleSetMax}
            className="text-[10px] font-mono text-zinc-600 hover:text-brand-pink transition-colors"
          >
            Balance: {formatBalance(formattedBalance)} <span className="text-brand-pink">MAX</span>
          </button>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={inputAmount}
            onChange={(e) => setInputAmount(e.target.value)}
            placeholder="0.0"
            className="flex-1 bg-transparent text-2xl font-mono text-white placeholder:text-zinc-700 focus:outline-none"
          />
          <button
            onClick={() => setShowTokenSelectIn(true)}
            className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 px-4 py-2.5 rounded-lg transition-colors border border-zinc-700 hover:border-zinc-600"
          >
            <TokenIcon token={tokenIn} size="md" />
            <span className="font-mono font-bold text-white">{tokenIn.symbol}</span>
            <span className="text-zinc-500 text-xs">▼</span>
          </button>
        </div>
      </div>

      {/* Flip Button */}
      <div className="flex justify-center -my-2 relative z-10">
        <button
          onClick={handleFlip}
          className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 p-2 rounded-lg transition-colors"
        >
          <ArrowLeftRight size={16} className="text-zinc-400" />
        </button>
      </div>

      {/* To Token */}
      <div className="bg-black/40 border border-white/10 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">To</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 text-2xl font-mono text-white">
            {isQuoting ? (
              <span className="text-zinc-600 animate-pulse">...</span>
            ) : (
              formatOutput(outputAmount)
            )}
          </div>
          <button
            onClick={() => setShowTokenSelectOut(true)}
            className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 px-4 py-2.5 rounded-lg transition-colors border border-zinc-700 hover:border-zinc-600"
          >
            <TokenIcon token={tokenOut} size="md" />
            <span className="font-mono font-bold text-white">{tokenOut.symbol}</span>
            <span className="text-zinc-500 text-xs">▼</span>
          </button>
        </div>
      </div>

      {/* Swap Info */}
      {quote && (
        <div className="bg-black/20 border border-white/5 rounded-lg p-3 space-y-2">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-zinc-500">Rate</span>
            <span className="text-zinc-400">
              1 {tokenIn.symbol} ≈ {(parseFloat(outputAmount) / parseFloat(inputAmount || "1")).toFixed(4)} {tokenOut.symbol}
            </span>
          </div>
          <div className="flex justify-between text-xs font-mono">
            <span className="text-zinc-500">Slippage</span>
            <span className="text-zinc-400">1%</span>
          </div>
          <div className="flex justify-between text-xs font-mono">
            <span className="text-zinc-500">Est. Gas</span>
            <span className="text-zinc-400">${parseFloat(quote.routeSummary.gasUsd || "0").toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Error */}
      {swapError && (
        <div className="text-xs font-mono text-red-500 text-center">{swapError}</div>
      )}

      {/* Swap Button */}
      <Button
        variant="primary"
        fullWidth
        onClick={handleButtonClick}
        disabled={!userAddress || isBusy || (!needsApproval && !quote)}
        className="h-12 !text-base !font-black tracking-widest shadow-[0_0_20px_rgba(236,72,153,0.4)] hover:shadow-[0_0_40px_rgba(236,72,153,0.6)]"
      >
        {getButtonText()}
      </Button>

      {/* Quick Links */}
      <div className="flex justify-center gap-4 text-[10px] font-mono text-zinc-600">
        <a href="https://kyberswap.com" target="_blank" rel="noopener noreferrer" className="hover:text-brand-pink transition-colors">
          KyberSwap ↗
        </a>
        <a href="https://dexscreener.com/base/0xd1dbb2e56533c55c3a637d13c53aeef65c5d5703" target="_blank" rel="noopener noreferrer" className="hover:text-brand-pink transition-colors">
          Chart ↗
        </a>
      </div>
    </div>
  );
}

function AuctionsDashboard({ userAddress }: { userAddress?: `0x${string}` }) {
  return (
    <div className="grid grid-cols-12 gap-4 lg:gap-6 h-full overflow-hidden">
      {/* Center Column: Auctions Panel */}
      <div className="col-span-12 lg:col-span-6 lg:col-start-4 flex flex-col h-full max-h-full overflow-hidden">
        <Card
          variant="cyber"
          title="RIG_AUCTIONS"
          icon={<LayoutGrid size={14} />}
          className="flex-1 min-h-0 overflow-hidden"
        >
          <AuctionsPanel userAddress={userAddress} />
        </Card>
      </div>
    </div>
  );
}

function FranchiseDashboard({ userAddress }: { userAddress?: `0x${string}` }) {
  const [selectedRig, setSelectedRig] = useState<SubgraphRig | null>(null);

  return (
    <div className="grid grid-cols-12 gap-3 lg:gap-4 h-full overflow-hidden">
      {/* Left Column: Explore Rigs */}
      <div className="col-span-12 lg:col-span-7 flex flex-col h-full max-h-full overflow-hidden">
        <Card
          variant="cyber"
          title="EXPLORE_RIGS"
          icon={<Store size={14} />}
          className="flex-1 min-h-0 overflow-hidden"
          noPadding
        >
          <ExplorePanel onSelectRig={setSelectedRig} selectedRigId={selectedRig?.id} />
        </Card>
      </div>

      {/* Right Column: Rig Detail */}
      <div className="col-span-12 lg:col-span-5 flex flex-col h-full max-h-full overflow-hidden">
        <Card
          variant="cyber"
          title={selectedRig ? `RIG_${selectedRig.symbol}` : "RIG_DETAILS"}
          icon={<Zap size={14} />}
          className="flex-1 min-h-0 overflow-hidden"
        >
          <RigDetailPanel rig={selectedRig} userAddress={userAddress} />
        </Card>
      </div>
    </div>
  );
}

function GovernDashboard({
  userAddress,
  governData,
}: {
  userAddress?: `0x${string}`;
  governData: ReturnType<typeof useGovernData>;
}) {
  const {
    voterData,
    bribesData,
    strategyDataMap,
    donutAllowance,
    hasVotingPower,
    hasActiveVotes,
    canVote,
    canUnstake,
    totalPendingRewards,
    allBribeAddresses,
    refetchAll,
  } = governData;

  return (
    <div className="grid grid-cols-12 gap-4 lg:gap-6 h-full overflow-hidden">
      {/* Left Column: Stake Panel */}
      <div className="col-span-12 lg:col-span-5 flex flex-col h-full max-h-full overflow-hidden">
        <Card
          variant="cyber"
          title="STAKE_DONUT"
          icon={<Landmark size={14} />}
          className="flex-1 min-h-0 overflow-hidden"
        >
          <StakePanel
            userAddress={userAddress}
            voterData={voterData}
            donutAllowance={donutAllowance}
            hasActiveVotes={hasActiveVotes ?? false}
            canUnstake={canUnstake ?? true}
            onSuccess={refetchAll}
          />
        </Card>
      </div>

      {/* Right Column: Vote Panel */}
      <div className="col-span-12 lg:col-span-7 flex flex-col h-full max-h-full overflow-hidden">
        <Card
          variant="cyber"
          title="VOTE_STRATEGIES"
          icon={<Activity size={14} />}
          className="flex-1 min-h-0 overflow-hidden"
        >
          <VotePanel
            userAddress={userAddress}
            voterData={voterData}
            bribesData={bribesData}
            strategyDataMap={strategyDataMap}
            hasVotingPower={hasVotingPower ?? false}
            canVote={canVote ?? false}
            hasActiveVotes={hasActiveVotes ?? false}
            totalPendingRewards={totalPendingRewards}
            allBribeAddresses={allBribeAddresses}
            onSuccess={refetchAll}
          />
        </Card>
      </div>
    </div>
  );
}
