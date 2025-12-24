"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, TrendingUp, Clock, Flame, ChevronLeft, ChevronRight } from "lucide-react";

import { useExploreRigs, type SortMode } from "../hooks/useExploreRigs";
import { type SubgraphRig, ipfsToHttp, fetchRigMetadata, calculateCurrentPrice } from "@/lib/api/launchpad";

interface ExplorePanelProps {
  onSelectRig?: (rig: SubgraphRig) => void;
  selectedRigId?: string;
}

// Subgraph returns values as formatted decimals, not wei
const formatNumber = (value: string) => {
  const num = parseFloat(value || "0");
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toFixed(0);
};

const formatEth = (value: string) => {
  const num = parseFloat(value || "0");
  return num.toFixed(3);
};

function RigCard({ rig, onClick, isSelected, isBumped }: { rig: SubgraphRig; onClick?: () => void; isSelected?: boolean; isBumped?: boolean }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [currentPrice, setCurrentPrice] = useState(0);

  useEffect(() => {
    if (rig.uri) {
      fetchRigMetadata(rig.uri).then((metadata) => {
        if (metadata?.image) {
          setImageUrl(ipfsToHttp(metadata.image));
        }
      });
    }
  }, [rig.uri]);

  // Update price every second (Dutch auction decays)
  useEffect(() => {
    const updatePrice = () => setCurrentPrice(calculateCurrentPrice(rig));
    updatePrice();
    const interval = setInterval(updatePrice, 1000);
    return () => clearInterval(interval);
  }, [rig]);

  // Estimate market cap from revenue (rough proxy)
  const marketCap = parseFloat(rig.revenue || "0") * 100;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left bg-zinc-900/50 hover:bg-zinc-800/50 border rounded-lg transition-all flex flex-col overflow-hidden ${
        isSelected
          ? "border-glaze-500 border-2 shadow-[0_0_15px_rgba(236,72,153,0.4)]"
          : isBumped
          ? "border-emerald-400 border-2 animate-bump-glow"
          : "border-zinc-800 hover:border-glaze-500/30"
      }`}
    >
      {/* Image - 4:3 aspect ratio for more compact view */}
      <div className="aspect-[4/3] w-full bg-zinc-800 relative overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={rig.name}
            className="w-full h-full object-cover object-center"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-glaze-500/20 to-zinc-900">
            <span className="text-glaze-400 font-bold text-xl">{rig.symbol?.slice(0, 2) || "?"}</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-1.5 space-y-0.5">
        {/* Name & Ticker */}
        <div className="flex items-center justify-between gap-1">
          <span className="text-[10px] font-bold text-white truncate">{rig.name || "Unknown"}</span>
          <span className="text-[8px] font-mono text-glaze-400 shrink-0">${rig.symbol}</span>
        </div>

        {/* Mine Price & Market Cap */}
        <div className="flex items-center justify-between text-[8px] font-mono">
          <span className="text-emerald-400">Ξ{currentPrice.toFixed(4)}</span>
          <span className="text-zinc-400">${marketCap >= 1000 ? `${(marketCap / 1000).toFixed(0)}K` : marketCap.toFixed(0)}</span>
        </div>
      </div>
    </button>
  );
}

export function ExplorePanel({ onSelectRig, selectedRigId }: ExplorePanelProps) {
  const {
    rigs,
    isLoading,
    sortMode,
    setSortMode,
    searchQuery,
    setSearchQuery,
    page,
    setPage,
    totalPages,
  } = useExploreRigs();

  // Track bumped rigs for animation
  const prevRigOrderRef = useRef<string[]>([]);
  const [bumpedIds, setBumpedIds] = useState<Set<string>>(new Set());

  // Detect when rigs move up in position (bump animation)
  useEffect(() => {
    const currentOrder = rigs.map((r) => r.id);

    if (rigs.length === 0 || sortMode !== "bump" || page !== 1) {
      prevRigOrderRef.current = currentOrder;
      return;
    }

    const prevOrder = prevRigOrderRef.current;

    // Skip on initial load (no previous order)
    if (prevOrder.length === 0) {
      prevRigOrderRef.current = currentOrder;
      return;
    }

    // Find rigs that moved up to higher positions
    const newBumped = new Set<string>();
    currentOrder.forEach((id, newIndex) => {
      const oldIndex = prevOrder.indexOf(id);
      // If rig moved up significantly (was lower, now in top positions)
      // or is new to the list and in top positions
      if (oldIndex === -1 && newIndex < 4) {
        // New rig appeared in top 4
        newBumped.add(id);
      } else if (oldIndex > newIndex && newIndex < 4 && oldIndex - newIndex >= 2) {
        // Moved up by at least 2 positions into top 4
        newBumped.add(id);
      }
    });

    // Always update ref after comparison
    prevRigOrderRef.current = currentOrder;

    if (newBumped.size > 0) {
      setBumpedIds(newBumped);
      // Clear bump animation after 2 seconds
      const timeout = setTimeout(() => setBumpedIds(new Set()), 2000);
      return () => clearTimeout(timeout);
    }
  }, [rigs, sortMode, page]);

  const sortOptions: { mode: SortMode; label: string; icon: React.ReactNode }[] = [
    { mode: "new", label: "New", icon: <Clock size={12} /> },
    { mode: "top", label: "Top", icon: <TrendingUp size={12} /> },
    { mode: "bump", label: "Bump", icon: <Flame size={12} /> },
  ];

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", page - 1, page, page + 1, "...", totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="flex flex-col h-full gap-2 overflow-hidden px-3 pb-3">
      {/* Search & Sort */}
      <div className="flex gap-2 shrink-0">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search rigs..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded pl-9 pr-3 py-2 text-xs font-mono text-white placeholder:text-zinc-600 focus:outline-none focus:border-glaze-500/50"
          />
        </div>
        <div className="flex gap-1">
          {sortOptions.map((opt) => (
            <button
              key={opt.mode}
              onClick={() => setSortMode(opt.mode)}
              className={`px-2 py-1 text-[10px] font-mono rounded flex items-center gap-1 transition-colors ${
                sortMode === opt.mode
                  ? "bg-glaze-500 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:text-white"
              }`}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Rigs Grid */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-20">
            <div className="text-zinc-600 text-xs font-mono">Loading...</div>
          </div>
        ) : rigs.length === 0 ? (
          <div className="flex items-center justify-center h-20">
            <div className="text-zinc-600 text-xs font-mono">No rigs found</div>
          </div>
        ) : (
          <div className="grid grid-cols-3 lg:grid-cols-4 gap-1.5">
            {rigs.map((rig) => (
              <RigCard
                key={rig.id}
                rig={rig}
                onClick={() => onSelectRig?.(rig)}
                isSelected={rig.id === selectedRigId}
                isBumped={bumpedIds.has(rig.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-0.5 shrink-0 pt-1">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="p-1 rounded bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={12} />
          </button>

          {getPageNumbers().map((p, i) => (
            p === "..." ? (
              <span key={`ellipsis-${i}`} className="px-1 text-zinc-600 text-[10px] font-mono">...</span>
            ) : (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`min-w-[22px] h-5 text-[10px] font-mono rounded transition-colors ${
                  page === p
                    ? "bg-glaze-500 text-white"
                    : "bg-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                {p}
              </button>
            )
          ))}

          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="p-1 rounded bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={12} />
          </button>
        </div>
      )}
    </div>
  );
}
