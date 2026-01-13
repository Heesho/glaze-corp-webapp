// Cached prices from API
let cachedPrices: { eth: number; btc: number; qr: number; aero: number } | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 60000; // 1 minute client-side cache

/**
 * Fetch all prices from our API route (avoids CORS, reduces calls)
 */
async function fetchAllPrices(): Promise<{ eth: number; btc: number; qr: number; aero: number }> {
  const now = Date.now();

  // Return cached if fresh
  if (cachedPrices && now - lastFetchTime < CACHE_DURATION) {
    return cachedPrices;
  }

  try {
    const res = await fetch("/api/prices");
    if (!res.ok) throw new Error("Failed to fetch prices");

    const prices = await res.json();
    cachedPrices = prices;
    lastFetchTime = now;
    return prices;
  } catch (error) {
    console.error("Failed to fetch prices:", error);
    return cachedPrices || { eth: 0, btc: 0, qr: 0, aero: 0 };
  }
}

/**
 * Fetch current ETH price in USD
 */
export async function fetchEthPrice(): Promise<number> {
  const prices = await fetchAllPrices();
  return prices.eth;
}

/**
 * Fetch current BTC price in USD
 */
export async function fetchBtcPrice(): Promise<number> {
  const prices = await fetchAllPrices();
  return prices.btc;
}

/**
 * Fetch current QR Coin price in USD
 */
export async function fetchQrPrice(): Promise<number> {
  const prices = await fetchAllPrices();
  return prices.qr;
}

/**
 * Fetch current AERO (Aerodrome Finance) price in USD
 */
export async function fetchAeroPrice(): Promise<number> {
  const prices = await fetchAllPrices();
  return prices.aero;
}
