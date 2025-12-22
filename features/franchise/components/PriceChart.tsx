"use client";

import React, { useEffect, useRef, useState } from "react";
import { createChart, ColorType, AreaSeries, IChartApi, ISeriesApi } from "lightweight-charts";

interface PricePoint {
  time: number;
  value: number;
}

interface PriceChartProps {
  data: PricePoint[];
  isLoading?: boolean;
  color?: string;
  height?: number;
}

export function PriceChart({
  data,
  isLoading = false,
  color = "#ec4899",
  height = 200
}: PriceChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Area"> | null>(null);
  const [mounted, setMounted] = useState(false);

  // Wait for mount to avoid hydration issues
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!mounted || !containerRef.current) return;

    const container = containerRef.current;
    const containerWidth = container.clientWidth;

    if (containerWidth === 0) return;

    // Create chart
    const chart = createChart(container, {
      width: containerWidth,
      height,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#71717a",
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false },
      },
      rightPriceScale: {
        visible: false,
      },
      timeScale: {
        visible: false,
      },
      crosshair: {
        vertLine: { visible: false },
        horzLine: { visible: false },
      },
      handleScroll: false,
      handleScale: false,
    });

    chartRef.current = chart;

    // Add area series
    const areaSeries = chart.addSeries(AreaSeries, {
      lineColor: color,
      topColor: `${color}40`,
      bottomColor: `${color}00`,
      lineWidth: 2,
    });

    seriesRef.current = areaSeries;

    // Set data if available
    if (data && data.length > 0) {
      areaSeries.setData(data.map(p => ({ time: p.time as any, value: p.value })));
      chart.timeScale().fitContent();
    }

    // Handle resize
    const handleResize = () => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: containerRef.current.clientWidth });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [mounted, height, color]);

  // Update data when it changes
  useEffect(() => {
    if (seriesRef.current && data && data.length > 0) {
      seriesRef.current.setData(data.map(p => ({ time: p.time as any, value: p.value })));
      chartRef.current?.timeScale().fitContent();
    }
  }, [data]);

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center bg-zinc-900/50 rounded"
        style={{ height }}
      >
        <div className="text-zinc-600 text-xs font-mono">Loading chart...</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center bg-zinc-900/50 rounded"
        style={{ height }}
      >
        <div className="text-zinc-600 text-xs font-mono">Chart data unavailable</div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full" style={{ height }} />
  );
}
