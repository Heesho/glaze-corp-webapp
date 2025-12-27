import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http, fallback } from "wagmi";
import { base } from "wagmi/chains";

// WalletConnect project ID - get one at https://cloud.walletconnect.com
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "placeholder";

// RPC URLs with fallbacks
const rpcUrls = [
  process.env.NEXT_PUBLIC_RPC_URL, // Primary (Alchemy)
  "https://mainnet.base.org",      // Public Base RPC
  "https://base.llamarpc.com",     // Llama RPC
].filter(Boolean) as string[];

export const config = getDefaultConfig({
  appName: "GlazeCorp",
  projectId,
  chains: [base],
  ssr: true,
  transports: {
    [base.id]: fallback(rpcUrls.map(url => http(url))),
  },
});
