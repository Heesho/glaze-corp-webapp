"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Circle, Video, Volume2, VolumeX } from "lucide-react";
import { DonutLogo } from "@/components/ui";
import { CHANNELS, CHANNEL_SWITCH_DELAY_MS, OVERRIDE_DISPLAY_DURATION_MS } from "@/config/constants";

interface TVProps {
  uri: string;
  glazing?: boolean;
  overrideAvatar?: string;
}

export function TV({ uri, glazing, overrideAvatar }: TVProps) {
  const [currentChannel, setCurrentChannel] = useState(0);
  const [isStatic, setIsStatic] = useState(false);
  const [timestamp, setTimestamp] = useState("--:--:--");
  const [showOverrideScreen, setShowOverrideScreen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  // Initialize clock on client
  useEffect(() => {
    setTimestamp(new Date().toLocaleTimeString());
    const timer = setInterval(() => setTimestamp(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Show override screen when glazing starts
  useEffect(() => {
    if (glazing) {
      setShowOverrideScreen(true);
      const timer = setTimeout(() => setShowOverrideScreen(false), OVERRIDE_DISPLAY_DURATION_MS);
      return () => clearTimeout(timer);
    }
  }, [glazing]);

  const handleVideoEnded = () => {
    if (!showOverrideScreen) {
      switchChannel("next");
    }
  };

  const switchChannel = (direction: "next" | "prev") => {
    setIsStatic(true);
    setTimeout(() => {
      setCurrentChannel((prev) => {
        if (direction === "next") return (prev + 1) % CHANNELS.length;
        return (prev - 1 + CHANNELS.length) % CHANNELS.length;
      });
      setIsStatic(false);
    }, CHANNEL_SWITCH_DELAY_MS);
  };

  const activeCam = CHANNELS[currentChannel];
  const isImageUri = uri?.match(/\.(jpeg|jpg|gif|png|webp)$/i);

  return (
    <div className="relative w-full h-full bg-[#111] rounded-md border-[4px] border-[#222] shadow-2xl flex flex-col group">
      {/* Screen Container */}
      <div className="relative w-full flex-1 min-h-0 overflow-hidden bg-black">
        {/* Main Feed Layer */}
        {!isStatic && (
          <div className="absolute inset-0 w-full h-full">
            {showOverrideScreen ? (
              <OverrideScreen uri={uri} overrideAvatar={overrideAvatar} isImageUri={!!isImageUri} />
            ) : (
              <VideoFeed
                channel={activeCam}
                currentChannel={currentChannel}
                isMuted={isMuted}
                onVideoEnded={handleVideoEnded}
              />
            )}
          </div>
        )}

        {/* Static Noise Layer */}
        {(isStatic || !activeCam) && <StaticNoise />}

        {/* HUD Overlay */}
        <HUDOverlay
          activeCam={activeCam}
          timestamp={timestamp}
          glazing={glazing}
          showOverride={showOverrideScreen}
        />
      </div>

      {/* Control Panel */}
      <ControlPanel
        currentChannel={currentChannel}
        isStatic={isStatic}
        isMuted={isMuted}
        onSwitchChannel={switchChannel}
        onToggleMute={() => setIsMuted(!isMuted)}
      />
    </div>
  );
}

// Sub-components

function OverrideScreen({
  uri,
  overrideAvatar,
  isImageUri,
}: {
  uri: string;
  overrideAvatar?: string;
  isImageUri: boolean;
}) {
  if (isImageUri) {
    return <img src={uri} className="w-full h-full object-cover" alt="Override" />;
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950 animate-pulse">
      {overrideAvatar ? (
        <img
          src={overrideAvatar}
          className="w-16 h-16 rounded-full border-2 border-brand-pink shadow-[0_0_20px_rgba(236,72,153,0.5)] mb-3"
          alt="Avatar"
        />
      ) : (
        <DonutLogo className="w-16 h-16 mb-3" />
      )}
      <h2 className="text-lg font-bold text-brand-pink uppercase tracking-widest">
        System Override
      </h2>
      <p className="text-zinc-500 font-mono text-[10px]">{uri}</p>
    </div>
  );
}

function VideoFeed({
  channel,
  currentChannel,
  isMuted,
  onVideoEnded,
}: {
  channel: (typeof CHANNELS)[number];
  currentChannel: number;
  isMuted: boolean;
  onVideoEnded: () => void;
}) {
  if (channel.isVideo) {
    return (
      <video
        key={currentChannel}
        src={channel.url}
        className="w-full h-full object-cover"
        autoPlay
        muted={isMuted}
        playsInline
        onEnded={onVideoEnded}
      />
    );
  }

  return (
    <img
      src={channel.url}
      className="w-full h-full object-cover filter contrast-125 brightness-75 sepia-[0.3] grayscale-[0.5]"
      alt="CCTV Feed"
    />
  );
}

function StaticNoise() {
  return (
    <div
      className="absolute inset-0 bg-black flex items-center justify-center z-10"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`,
      }}
    >
      <span className="text-zinc-500 font-mono text-xs bg-black px-2">NO SIGNAL</span>
    </div>
  );
}

function HUDOverlay({
  activeCam,
  timestamp,
  glazing,
  showOverride,
}: {
  activeCam: (typeof CHANNELS)[number];
  timestamp: string;
  glazing?: boolean;
  showOverride: boolean;
}) {
  return (
    <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between z-20">
      {/* Top Bar */}
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${glazing ? "bg-brand-pink animate-ping" : "bg-red-600 animate-pulse"}`}
            />
            <span className="font-mono text-red-500 font-bold tracking-widest text-sm shadow-black drop-shadow-md">
              REC
            </span>
          </div>
          <span className="font-mono text-zinc-400 text-xs shadow-black drop-shadow-md">
            {activeCam.id} // {activeCam.name}
          </span>
        </div>
        <div className="text-right">
          <div className="font-mono text-zinc-300 text-xl font-bold tracking-widest shadow-black drop-shadow-md">
            {timestamp}
          </div>
          <div className="font-mono text-zinc-500 text-[10px] uppercase">Frame: 30fps // 1080i</div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="flex justify-between items-end">
        <div className="font-mono text-[10px] text-zinc-600 uppercase bg-black/50 px-2 py-1 rounded backdrop-blur-sm">
          GlazeCorp Security Systems v9.0
        </div>
        {showOverride && (
          <div className="bg-brand-pink/20 border border-brand-pink/50 px-3 py-1 rounded text-brand-pink font-mono text-xs animate-pulse">
            EXTERNAL_INPUT_DETECTED
          </div>
        )}
      </div>
    </div>
  );
}

function ControlPanel({
  currentChannel,
  isStatic,
  isMuted,
  onSwitchChannel,
  onToggleMute,
}: {
  currentChannel: number;
  isStatic: boolean;
  isMuted: boolean;
  onSwitchChannel: (direction: "next" | "prev") => void;
  onToggleMute: () => void;
}) {
  return (
    <div className="h-12 bg-[#1a1a1a] border-t border-[#333] flex items-center justify-between px-4 z-40">
      <div className="flex items-center gap-2">
        <Video size={14} className="text-zinc-600" />
        <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">
          Source: INT_NET
        </span>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onSwitchChannel("prev")}
          className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <div className="flex gap-1 px-2">
          {CHANNELS.map((_, idx) => (
            <div
              key={idx}
              className={`w-1.5 h-1.5 rounded-full ${idx === currentChannel ? "bg-green-500 shadow-[0_0_5px_lime]" : "bg-zinc-700"}`}
            />
          ))}
        </div>
        <button
          onClick={() => onSwitchChannel("next")}
          className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded transition-colors"
        >
          <ChevronRight size={16} />
        </button>
        <button
          onClick={onToggleMute}
          className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded transition-colors ml-2"
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      </div>

      <div className="flex items-center gap-2">
        <Circle
          size={8}
          className={isStatic ? "fill-yellow-500 text-yellow-500" : "fill-green-900 text-green-900"}
        />
        <span className="text-[10px] text-zinc-600 font-mono uppercase">SIGNAL</span>
      </div>
    </div>
  );
}
