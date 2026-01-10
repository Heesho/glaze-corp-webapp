import { NextResponse } from "next/server";

// Cache prices for 2 minutes server-side to reduce external API calls
let cachedPrices: { eth: number; btc: number; qr: number } | null = null;
let cacheTime = 0;
const CACHE_DURATION = 120000; // 2 minutes

export async function GET() {
  const now = Date.now();

  // Return cached prices if still fresh
  if (cachedPrices && now - cacheTime < CACHE_DURATION) {
    return NextResponse.json(cachedPrices);
  }

  try {
    // Fetch all prices in parallel
    const [ethRes, btcRes, qrRes] = await Promise.all([
      fetch("https://api.coinbase.com/v2/prices/ETH-USD/spot"),
      fetch("https://api.coinbase.com/v2/prices/BTC-USD/spot"),
      fetch("https://api.coingecko.com/api/v3/simple/price?ids=qr-coin&vs_currencies=usd"),
    ]);

    const [ethData, btcData, qrData] = await Promise.all([
      ethRes.json(),
      btcRes.json(),
      qrRes.json(),
    ]);

    const prices = {
      eth: ethData?.data?.amount ? parseFloat(ethData.data.amount) : 0,
      btc: btcData?.data?.amount ? parseFloat(btcData.data.amount) : 0,
      qr: qrData?.["qr-coin"]?.usd ?? 0,
    };

    // Cache the result
    cachedPrices = prices;
    cacheTime = now;

    return NextResponse.json(prices);
  } catch (error) {
    console.error("Failed to fetch prices:", error);

    // Return cached prices if available, even if stale
    if (cachedPrices) {
      return NextResponse.json(cachedPrices);
    }

    return NextResponse.json({ eth: 0, btc: 0, qr: 0 }, { status: 500 });
  }
}
