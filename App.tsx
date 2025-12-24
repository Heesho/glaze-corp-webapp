"use client";

import React, { useState } from "react";
import { ethers } from "ethers";
import {
  Hammer,
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
  ArrowDown,
  Gavel,
  ChevronDown,
  Settings,
} from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useWalletClient } from "wagmi";

// UI Components
import { Card, Button, DonutLogo, Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, SearchInput, Separator } from "@/components/ui";
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
  const [activeTab, setActiveTab] = useState<TabView>("MINE");

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
    <div className="h-screen w-screen flex flex-col font-sans overflow-hidden bg-[#131313]">
      {/* Header */}
      <header className="h-14 fixed top-0 left-0 right-0 bg-[#131313]/40 backdrop-blur-sm flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-10">
          <span className="font-bold text-2xl text-white tracking-tight">
            Glaze<span className="text-glaze-400">Corp</span>
          </span>

          <nav className="hidden md:flex items-center gap-1">
            {[
              { id: "MINE" as TabView, icon: Hammer, label: "Mine" },
              { id: "SWAP" as TabView, icon: ArrowLeftRight, label: "Swap" },
              { id: "GOVERN" as TabView, icon: Landmark, label: "Govern" },
              { id: "FRANCHISE" as TabView, icon: Store, label: "Franchise" },
              { id: "AUCTIONS" as TabView, icon: Gavel, label: "Auction" },
            ].map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${
                  activeTab === id
                    ? "bg-glaze-500 text-white shadow-lg shadow-glaze-500/20"
                    : "text-corp-400 hover:text-corp-100 hover:bg-corp-800"
                }`}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-3 text-corp-500">
            <a
              href={EXTERNAL_LINKS.dune}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg hover:bg-corp-800 hover:text-glaze-400 transition-all"
            >
              <BarChart3 size={18} />
            </a>
            <a
              href={EXTERNAL_LINKS.farcaster}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg hover:bg-corp-800 hover:text-glaze-400 transition-all"
            >
              <Users size={18} />
            </a>
          </div>
          <ConnectButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-3 lg:px-4 overflow-y-auto relative z-10 pb-20 md:pb-3">
        {activeTab === "SWAP" ? (
          <SwapDashboard userAddress={userAddress} />
        ) : activeTab === "GOVERN" ? (
          <GovernDashboard
            userAddress={userAddress}
            governData={governData}
          />
        ) : activeTab === "FRANCHISE" ? (
          <FranchiseDashboard userAddress={userAddress} />
        ) : activeTab === "MINE" ? (
          <div className="pt-16">
            <div className="max-w-7xl mx-auto">
              {/* Two Column Layout */}
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Left Sidebar */}
                <div className="lg:w-72 shrink-0 flex flex-col gap-5 order-2 lg:order-1">
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

                  <Separator />

                  <GlobalMetricsCard
                    stats={stats}
                    donutPriceUsd={donutPriceUsd}
                    halvingDisplay={halvingDisplay}
                  />

                  <Separator />

                  <UserStatsCard
                    minerState={minerState}
                    userGraphStats={userGraphStats}
                    ethPrice={ethPrice}
                    donutPriceUsd={donutPriceUsd}
                  />
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col gap-4 order-1 lg:order-2 min-w-0">
                  {/* Video */}
                  <TVFrame
                    minerState={minerState}
                    isGlazing={isGlazing}
                    kingProfile={kingProfile}
                  />

                  {/* Message Input */}
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter a message to glaze..."
                    className="w-full bg-corp-900 border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-corp-100 placeholder:text-corp-500 focus:outline-none focus:border-white/10 transition-colors"
                    maxLength={200}
                    spellCheck={false}
                  />

                  {/* Stats + Glaze Button */}
                  <div className="flex items-stretch gap-4">
                    <div className="flex items-center gap-8">
                      <div>
                        <div className="text-[11px] uppercase tracking-wider text-corp-500 mb-0.5">Rate</div>
                        <div className="text-lg text-corp-50 font-semibold flex items-center gap-1.5">
                          <DonutLogo className="w-4 h-4" />
                          <span>{formatDonut(safeDps)}/s</span>
                        </div>
                        <div className="text-xs text-corp-500">${dpsUsd.toFixed(4)}/s</div>
                      </div>
                      <div>
                        <div className="text-[11px] uppercase tracking-wider text-corp-500 mb-0.5">Price</div>
                        <div className="text-lg text-glaze-400 font-semibold tabular-nums">Ξ{rebatePriceEth.toFixed(5)}</div>
                        <div className="text-xs text-corp-500">${rebatePriceUsd.toFixed(2)}</div>
                      </div>
                    </div>
                    <Button
                      variant="primary"
                      onClick={handleGlaze}
                      disabled={isGlazing || !isConnected}
                      className="flex-1 !py-2.5 !text-sm !rounded-xl !font-semibold"
                    >
                      {isGlazing ? "..." : "Glaze"}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Recent Activity - Full Width */}
              <Separator className="mt-4 mb-4" />
              <SurveillanceLog feed={feed} feedProfiles={feedProfiles} accruedDonutsStr={accruedDonutsStr} currentPriceEth={currentPriceEth} />
            </div>
          </div>
        ) : (
          <AuctionsDashboard userAddress={userAddress} />
        )}
      </main>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#131313] flex items-center justify-around px-2 z-50">
        {[
          { id: "MINE" as TabView, icon: Hammer, label: "Mine" },
          { id: "SWAP" as TabView, icon: ArrowLeftRight, label: "Swap" },
          { id: "GOVERN" as TabView, icon: Landmark, label: "Govern" },
          { id: "FRANCHISE" as TabView, icon: Store, label: "Franchise" },
          { id: "AUCTIONS" as TabView, icon: Gavel, label: "Auction" },
        ].map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all ${
              activeTab === id
                ? "text-glaze-400"
                : "text-corp-500"
            }`}
          >
            <Icon size={18} />
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        ))}
      </nav>

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
    <div className="space-y-4">
      {/* Section Title */}
      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-corp-500">
        Current Operator
      </h3>

      {/* Operator Info */}
      <div className="flex items-center gap-3">
        <div className="shrink-0 relative">
          {kingProfile?.pfp ? (
            <img
              src={kingProfile.pfp}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-corp-800"
              alt=""
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-corp-800 flex items-center justify-center text-glaze-400">
              <Zap size={16} />
            </div>
          )}
          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-[#131313]" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-corp-100 truncate">
            {kingProfile?.displayName || truncateAddress(minerState.miner)}
          </div>
          <div className="text-xs text-corp-500 truncate">
            @{kingProfile?.username || "unknown"}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-2.5">
        <div className="flex justify-between items-center">
          <span className="text-xs text-corp-500">Time</span>
          <span className="text-sm text-corp-100 tabular-nums font-medium">{glazeTimeStr}</span>
        </div>
        <div className="flex justify-between items-start">
          <span className="text-xs text-corp-500">Glazed</span>
          <div className="text-right">
            <div className="text-sm text-corp-100 font-medium flex items-center justify-end gap-1">
              <DonutLogo className="w-3.5 h-3.5" />
              {accruedDonutsStr}
            </div>
            <div className="text-[11px] text-corp-500">${accruedValueUsdStr}</div>
          </div>
        </div>
        <div className="flex justify-between items-start">
          <span className="text-xs text-corp-500">PNL</span>
          <div className="text-right">
            <div className="text-sm text-corp-100 font-medium tabular-nums">
              {pnlEthStr}
            </div>
            <div className="text-[11px] text-corp-500">
              {pnlUsdStr}
            </div>
          </div>
        </div>

        <Separator className="my-2" />

        <div className="flex justify-between items-center">
          <span className="text-xs text-corp-400 font-medium">Total</span>
          <span className={`text-sm font-semibold tabular-nums ${totalIsPositive ? "text-emerald-400" : "text-red-400"}`}>
            {totalUsdStr}
          </span>
        </div>
      </div>
    </div>
  );
}

function SurveillanceLog({ feed, feedProfiles, accruedDonutsStr, currentPriceEth }: any) {
  return (
    <div className="space-y-4">
      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-corp-500">
        Recent Activity
      </h3>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider text-corp-500 border-b border-white/[0.06]">
              <th className="pb-3 font-medium w-8 pl-4">#</th>
              <th className="pb-3 font-medium">User</th>
              <th className="pb-3 font-medium">Message</th>
              <th className="pb-3 font-medium text-right">Spent</th>
              <th className="pb-3 font-medium text-right">Earned</th>
              <th className="pb-3 font-medium text-right pr-4">Mined</th>
            </tr>
          </thead>
          <tbody>
            {feed.slice(0, 10).map((item: any, index: number) => {
              const minerAddr = item.miner?.toLowerCase() || "";
              const profile = minerAddr ? feedProfiles[minerAddr] : null;
              const messageContent = !item.uri || item.uri.trim().length === 0 ? "System Override" : item.uri;
              const isLive = index === 0;
              let displayPrice = "0.000";
              try {
                displayPrice = parseFloat(item.price).toFixed(3);
              } catch {}

              return (
                <tr
                  key={item.id}
                  className={`border-b border-white/[0.04] transition-colors ${
                    isLive
                      ? "bg-glaze-500/5 hover:bg-glaze-500/10"
                      : "hover:bg-white/[0.02]"
                  }`}
                >
                  <td className="py-3 text-xs tabular-nums pl-4">
                    {isLive ? (
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-glaze-500 animate-pulse" />
                      </span>
                    ) : (
                      <span className="text-corp-600">{index + 1}</span>
                    )}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2.5">
                      {profile?.pfp ? (
                        <img src={profile.pfp} className="w-6 h-6 rounded-full object-cover" alt="" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-corp-800 flex items-center justify-center text-[10px] text-corp-400">
                          {truncateAddress(item.miner).slice(0, 2)}
                        </div>
                      )}
                      <span className={`text-sm font-medium ${isLive ? "text-corp-100" : "text-corp-200"}`}>
                        {profile?.username || truncateAddress(item.miner)}
                      </span>
                      {isLive && (
                        <span className="text-[9px] font-semibold uppercase tracking-wider text-glaze-400 bg-glaze-500/20 px-1.5 py-0.5 rounded">
                          Live
                        </span>
                      )}
                    </div>
                  </td>
                  <td className={`py-3 text-sm max-w-[200px] truncate ${isLive ? "text-corp-300" : "text-corp-400"}`}>
                    {messageContent}
                  </td>
                  <td className={`py-3 text-sm text-right tabular-nums ${isLive ? "text-corp-100" : "text-corp-200"}`}>
                    Ξ{displayPrice}
                  </td>
                  <td className={`py-3 text-sm text-right tabular-nums ${isLive ? "text-glaze-400" : "text-corp-200"}`}>
                    {isLive ? (
                      <span>Ξ{(currentPriceEth * 0.8).toFixed(3)}</span>
                    ) : (
                      `Ξ${item.earned ? parseFloat(item.earned).toFixed(3) : "0.000"}`
                    )}
                  </td>
                  <td className={`py-3 text-sm text-right tabular-nums pr-4 ${isLive ? "text-glaze-400" : "text-corp-200"}`}>
                    <div className="flex items-center justify-end gap-1">
                      <DonutLogo className="w-3.5 h-3.5" />
                      {isLive ? (
                        <span>{accruedDonutsStr}</span>
                      ) : (
                        item.mined ? parseFloat(item.mined).toLocaleString() : "0"
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TVFrame({ minerState, isGlazing, kingProfile }: any) {
  return (
    <div className="relative w-full">
      <div className="aspect-video bg-[#0a0a0a] rounded-2xl overflow-hidden">
        <TV uri={minerState.uri} glazing={isGlazing} overrideAvatar={kingProfile?.pfp} />
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
    <Card title="Glaze" icon={<Zap size={14} />}>
      <div className="flex flex-col gap-4">
        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-xs text-corp-400 mb-1">Rate</div>
            <div className="text-lg font-bold text-corp-50 flex items-center justify-center gap-1.5">
              <DonutLogo className="w-4 h-4" />
              {formatDonut(safeDps)}
              <span className="text-sm text-corp-500 font-normal">/s</span>
            </div>
            <div className="text-xs text-corp-500">${dpsUsd.toFixed(4)}/s</div>
          </div>

          <div className="text-center">
            <div className="text-xs text-corp-400 mb-1">
              Price <span className="text-emerald-400">(5% off)</span>
            </div>
            <div className="flex items-baseline justify-center gap-1.5">
              <div className="text-lg font-bold text-glaze-400">
                Ξ{rebatePriceEth.toFixed(5)}
              </div>
            </div>
            <div className="text-xs text-corp-500">${rebatePriceUsd.toFixed(2)}</div>
          </div>
        </div>

        {/* Input and Button */}
        <div className="flex flex-col gap-3">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter a message..."
            className="w-full bg-corp-950/60 border border-corp-700 rounded-lg px-3 py-2.5 text-sm text-corp-100 placeholder:text-corp-600 focus:outline-none focus:border-glaze-500/50 transition-colors"
            maxLength={200}
            spellCheck={false}
          />

          <Button
            variant="primary"
            fullWidth
            onClick={handleGlaze}
            disabled={isGlazing || !isConnected || connectionError !== null}
            className="h-11 !text-sm !rounded-lg !font-semibold shadow-lg shadow-glaze-500/20 hover:shadow-glaze-500/30"
          >
            {isGlazing ? "Processing..." : !isConnected ? "Connect Wallet" : "Glaze"}
          </Button>

          {connectionError && <div className="text-xs text-red-400 text-center">{connectionError}</div>}
        </div>
      </div>
    </Card>
  );
}

function GlobalMetricsCard({ stats, donutPriceUsd, halvingDisplay }: any) {
  return (
    <div className="space-y-4">
      {/* Section Title */}
      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-corp-500">
        Global Stats
      </h3>

      <div className="space-y-2.5">
        <div className="flex justify-between items-center">
          <span className="text-xs text-corp-500">Total Mined</span>
          <span className="text-sm text-corp-100 font-medium flex items-center gap-1">
            <DonutLogo className="w-3.5 h-3.5" />
            {parseFloat(stats.minted).toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-corp-500">Price</span>
          <span className="text-sm text-corp-100 font-medium tabular-nums">${donutPriceUsd.toFixed(6)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-corp-500">Next Halving</span>
          <span className="text-sm text-corp-300 tabular-nums">{halvingDisplay}</span>
        </div>
      </div>
    </div>
  );
}

function UserStatsCard({
  minerState,
  userGraphStats,
  ethPrice,
  donutPriceUsd,
}: {
  minerState: any;
  userGraphStats: any;
  ethPrice: number;
  donutPriceUsd: number;
}) {
  const ethSpent = parseFloat(userGraphStats?.spent || "0");
  const ethEarned = parseFloat(userGraphStats?.earned || "0");
  const donutMined = parseFloat(userGraphStats?.mined || "0");

  const ethSpentUsd = ethSpent * ethPrice;
  const ethEarnedUsd = ethEarned * ethPrice;

  const donutBalance = parseFloat(formatDonut(minerState.donutBalance));
  const donutBalanceUsd = donutBalance * donutPriceUsd;
  const ethBalance = parseFloat(formatEth(minerState.ethBalance, 6));
  const ethBalanceUsd = ethBalance * ethPrice;

  return (
    <div className="space-y-4">
      {/* Section Title */}
      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-corp-500">
        Your Wallet
      </h3>

      <div className="space-y-2.5">
        <div className="flex justify-between items-center">
          <span className="text-xs text-corp-500">DONUT</span>
          <span className="text-sm text-corp-100 font-medium flex items-center gap-1">
            <DonutLogo className="w-3.5 h-3.5" />
            {formatDonut(minerState.donutBalance)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-corp-500">ETH</span>
          <span className="text-sm text-corp-100 font-medium tabular-nums">Ξ{formatEth(minerState.ethBalance, 4)}</span>
        </div>

        <Separator className="my-2" />

        <div className="flex justify-between items-center">
          <span className="text-xs text-corp-500">ETH Spent</span>
          <span className="text-sm text-corp-100 font-medium tabular-nums">Ξ{ethSpent.toFixed(4)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-corp-500">ETH Earned</span>
          <span className="text-sm text-corp-100 font-medium tabular-nums">Ξ{ethEarned.toFixed(4)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-corp-500">DONUT Mined</span>
          <span className="text-sm text-corp-100 font-medium flex items-center gap-1">
            <DonutLogo className="w-3.5 h-3.5" />
            {donutMined.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}


function SwapDashboard({ userAddress }: { userAddress?: `0x${string}` }) {
  return (
    <div className="flex items-start justify-center h-full pt-32">
      <div className="w-full max-w-[480px] px-4">
        <SwapPanel userAddress={userAddress} />
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
    uniV2Quote,
    hasQuote,
    isQuoting,
    quoteError,
    priceImpact,
    swapStep,
    swapError,
    isBusy,
    needsApproval,
    handleApprove,
    handleSwap,
  } = useSwap();

  const [tokenSelectMode, setTokenSelectMode] = useState<"in" | "out" | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const formatBalance = (bal: string) => {
    const num = parseFloat(bal);
    if (num < 0.0001) return "0.00";
    if (num < 1) return num.toFixed(4);
    if (num < 1000) return num.toFixed(2);
    return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  const formatOutput = (amt: string) => {
    if (!amt) return "0";
    const num = parseFloat(amt);
    if (num < 0.0001) return num.toExponential(2);
    if (num < 1) return num.toFixed(6);
    if (num < 1000) return num.toFixed(4);
    return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  const TokenIcon = ({ token, size = "md" }: { token: SwapToken; size?: "sm" | "md" | "lg" | "xl" }) => {
    const sizeClasses = {
      sm: "w-5 h-5",
      md: "w-7 h-7",
      lg: "w-9 h-9",
      xl: "w-10 h-10",
    };

    if (token.symbol === "DONUT") {
      return <DonutLogo className={sizeClasses[size]} />;
    }

    if (token.logoUrl) {
      return (
        <img
          src={token.logoUrl}
          alt={token.symbol}
          className={`${sizeClasses[size]} rounded-full object-cover bg-corp-800`}
        />
      );
    }

    return (
      <div className={`${sizeClasses[size]} rounded-full bg-corp-700 flex items-center justify-center text-xs font-bold text-corp-300`}>
        {token.symbol.slice(0, 2)}
      </div>
    );
  };

  // Quick select tokens
  const quickTokens = allTokens.filter((t) => ["ETH", "DONUT", "USDC", "WETH"].includes(t.symbol));

  // Filter tokens by search
  const filteredTokens = allTokens.filter((t) =>
    t.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTokenSelect = (token: SwapToken) => {
    if (tokenSelectMode === "in") setTokenIn(token);
    else setTokenOut(token);
    setTokenSelectMode(null);
    setSearchQuery("");
  };

  const excludeAddress = tokenSelectMode === "in" ? tokenOut.address : tokenIn.address;

  const getButtonText = () => {
    if (swapStep === "approving") return "Approving...";
    if (swapStep === "swapping" || swapStep === "confirming") return "Swapping...";
    if (isQuoting) return "Finding route...";
    if (hasQuote && needsApproval) return `Approve ${tokenIn.symbol}`;
    return "Swap";
  };

  const handleButtonClick = () => {
    if (needsApproval) handleApprove();
    else handleSwap();
  };

  const isButtonDisabled = !userAddress || isBusy || !inputAmount || parseFloat(inputAmount) <= 0 || (!needsApproval && !hasQuote);

  return (
    <>
      {/* Token Select Dialog */}
      <Dialog open={tokenSelectMode !== null} onOpenChange={() => { setTokenSelectMode(null); setSearchQuery(""); }}>
        <DialogContent className="max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Select a token</DialogTitle>
            <DialogClose onClose={() => { setTokenSelectMode(null); setSearchQuery(""); }} />
          </DialogHeader>

          {/* Search */}
          <div className="px-4 pb-3">
            <SearchInput
              placeholder="Search by name or symbol"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Quick Select */}
          {!searchQuery && (
            <div className="px-4 pb-3">
              <div className="flex flex-wrap gap-2">
                {quickTokens.map((token) => (
                  <button
                    key={token.address}
                    onClick={() => handleTokenSelect(token)}
                    disabled={token.address === excludeAddress}
                    className={`flex items-center gap-2 px-3 py-2 rounded-full border transition-colors ${
                      token.address === excludeAddress
                        ? "opacity-30 cursor-not-allowed border-white/5 bg-white/5"
                        : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
                    }`}
                  >
                    <TokenIcon token={token} size="sm" />
                    <span className="text-sm font-medium text-corp-100">{token.symbol}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Token List */}
          <div className="flex-1 overflow-y-auto px-2 pb-4">
            <div className="px-2 py-2 text-xs text-corp-500 flex items-center gap-2">
              <span>Popular tokens</span>
            </div>
            {filteredTokens.map((token) => {
              const isExcluded = token.address === excludeAddress;
              return (
                <button
                  key={token.address}
                  onClick={() => handleTokenSelect(token)}
                  disabled={isExcluded}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${
                    isExcluded ? "opacity-30 cursor-not-allowed" : "hover:bg-white/5"
                  }`}
                >
                  <TokenIcon token={token} size="lg" />
                  <div className="flex-1 text-left">
                    <div className="font-medium text-corp-50">{token.name}</div>
                    <div className="text-sm text-corp-500">{token.symbol}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Swap Card */}
      <div>
        {/* Sell Section */}
        <div className="border border-corp-800 rounded-2xl p-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-corp-400">Sell</span>
            <button
              onClick={handleSetMax}
              className="text-sm text-corp-500 hover:text-corp-300 transition-colors"
            >
              {formatBalance(formattedBalance)} {tokenIn.symbol}
            </button>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <input
                type="text"
                value={inputAmount}
                onChange={(e) => setInputAmount(e.target.value)}
                placeholder="0"
                className="w-full bg-transparent text-[36px] font-medium text-corp-50 placeholder:text-corp-600 focus:outline-none"
              />
              <div className="text-sm text-corp-500 mt-1">
                {inputAmount && parseFloat(inputAmount) > 0 ? `$${(parseFloat(inputAmount) * (tokenIn.symbol === "ETH" || tokenIn.symbol === "WETH" ? 3500 : 0.06)).toFixed(2)}` : "$0"}
              </div>
            </div>
            <button
              onClick={() => setTokenSelectMode("in")}
              className="flex items-center gap-2 bg-corp-800 hover:bg-corp-700 pl-2 pr-3 py-2 rounded-full transition-colors shrink-0"
            >
              <TokenIcon token={tokenIn} size="md" />
              <span className="font-semibold text-corp-50">{tokenIn.symbol}</span>
              <ChevronDown size={16} className="text-corp-400" />
            </button>
          </div>
        </div>

        {/* Swap Arrow */}
        <div className="flex justify-center -my-5 relative z-10">
          <button
            onClick={handleFlip}
            className="bg-[#131313] p-1 rounded-xl border-4 border-[#131313]"
          >
            <div className="bg-corp-800 hover:bg-corp-700 p-2 rounded-lg transition-colors">
              <ArrowDown size={16} className="text-corp-300" />
            </div>
          </button>
        </div>

        {/* Buy Section */}
        <div className="bg-corp-800 rounded-2xl p-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-corp-400">Buy</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="text-[36px] font-medium">
                {isQuoting ? (
                  <span className="text-corp-600 animate-pulse">...</span>
                ) : outputAmount && parseFloat(outputAmount) > 0 ? (
                  <span className="text-corp-50">{formatOutput(outputAmount)}</span>
                ) : (
                  <span className="text-corp-600">0</span>
                )}
              </div>
              <div className="text-sm text-corp-500 mt-1">
                {outputAmount && parseFloat(outputAmount) > 0 ? `$${(parseFloat(outputAmount) * (tokenOut.symbol === "ETH" || tokenOut.symbol === "WETH" ? 3500 : 0.06)).toFixed(2)}` : "$0"}
              </div>
            </div>
            <button
              onClick={() => setTokenSelectMode("out")}
              className="flex items-center gap-2 bg-corp-700 hover:bg-corp-600 pl-2 pr-3 py-2 rounded-full transition-colors shrink-0"
            >
              <TokenIcon token={tokenOut} size="md" />
              <span className="font-semibold text-corp-50">{tokenOut.symbol}</span>
              <ChevronDown size={16} className="text-corp-400" />
            </button>
          </div>
        </div>

        {/* Rate Info */}
        {hasQuote && outputAmount && (
          <div className="flex justify-between items-center px-4 py-3 text-sm text-corp-500">
            <span>
              1 {tokenIn.symbol} = {(parseFloat(outputAmount) / parseFloat(inputAmount || "1")).toFixed(4)} {tokenOut.symbol}
            </span>
            {quote?.routeSummary && (
              <span>~${parseFloat(quote.routeSummary.gasUsd || "0").toFixed(2)} gas</span>
            )}
          </div>
        )}

        {/* Error */}
        {(swapError || quoteError) && (
          <div className="text-sm text-red-400 text-center px-4 py-2">{swapError || quoteError}</div>
        )}

        {/* Action Button */}
        <div className="mt-1">
          <button
            onClick={handleButtonClick}
            disabled={isButtonDisabled}
            className={`w-full py-4 rounded-2xl font-semibold text-lg transition-all ${
              isButtonDisabled
                ? "bg-glaze-500/30 text-glaze-400/50 cursor-not-allowed"
                : "bg-glaze-500 text-white hover:bg-glaze-600 shadow-lg shadow-glaze-500/25"
            }`}
          >
            {getButtonText()}
          </button>
        </div>

        {/* Swap Details */}
        {hasQuote && outputAmount && (
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-corp-500">Minimum received</span>
              <span className="text-corp-300">
                {(parseFloat(outputAmount) * 0.99).toFixed(6)} {tokenOut.symbol}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-corp-500">Price impact</span>
              <span className={priceImpact > 5 ? "text-red-400" : priceImpact > 2 ? "text-yellow-400" : "text-corp-300"}>
                {priceImpact.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-corp-500">Slippage tolerance</span>
              <span className="text-corp-300">1%</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function AuctionsDashboard({ userAddress }: { userAddress?: `0x${string}` }) {
  return (
    <div className="grid grid-cols-12 gap-4 lg:gap-6 h-full overflow-hidden">
      {/* Center Column: Auctions Panel */}
      <div className="col-span-12 lg:col-span-6 lg:col-start-4 flex flex-col h-full max-h-full overflow-hidden">
        <Card
          title="Rig Auctions"
          icon={<Gavel size={14} />}
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
          title="Explore Rigs"
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
          title={selectedRig ? selectedRig.name : "Rig Details"}
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
          title="Stake DONUT"
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
          title="Vote on Strategies"
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
