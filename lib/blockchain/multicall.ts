import { createPublicClient, http, fallback, type Address } from 'viem';
import { base } from 'viem/chains';
import type { MinerState } from '@/types';
import {
  MULTICALL_ADDRESS,
  MULTICALL_ABI,
  MINER_ADDRESS,
  MINER_ABI,
  RPC_URLS,
} from './contracts';

// Singleton client - reused across all calls (no _detectNetwork spam)
const client = createPublicClient({
  chain: base,
  transport: fallback(RPC_URLS.map(url => http(url))),
});

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' as Address;

/**
 * Fetch the current miner state from the multicall contract
 */
export async function fetchMinerState(
  userAddress: string = ZERO_ADDRESS
): Promise<MinerState | null> {
  try {
    const data = await client.readContract({
      address: MULTICALL_ADDRESS as Address,
      abi: MULTICALL_ABI,
      functionName: 'getMiner',
      args: [userAddress as Address],
    });

    return {
      epochId: Number(data.epochId),
      initPrice: data.initPrice,
      startTime: Number(data.startTime),
      glazed: data.glazed,
      price: data.price,
      dps: data.dps,
      nextDps: data.nextDps,
      donutPrice: data.donutPrice,
      miner: data.miner,
      uri: data.uri,
      ethBalance: data.ethBalance,
      wethBalance: data.wethBalance,
      donutBalance: data.donutBalance,
    };
  } catch (error) {
    console.error("RPC Error:", error);
    return null;
  }
}

/**
 * Fetch the miner contract start time (for halving calculation)
 */
export async function fetchMinerStartTime(): Promise<number | null> {
  try {
    const startTime = await client.readContract({
      address: MINER_ADDRESS as Address,
      abi: MINER_ABI,
      functionName: 'startTime',
    });
    return Number(startTime);
  } catch (error) {
    console.error("Failed to fetch miner startTime:", error);
    return null;
  }
}
