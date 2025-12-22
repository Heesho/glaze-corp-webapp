import { ethers } from 'ethers';
import type { FarcasterProfile } from '@/types';

const NEYNAR_API_KEY = process.env.NEXT_PUBLIC_NEYNAR_API_KEY || '';

/**
 * Fetch a single Farcaster profile by Ethereum address
 */
export async function fetchFarcasterProfile(
  address: string
): Promise<FarcasterProfile | null> {
  if (address === ethers.ZeroAddress) return null;

  try {
    const res = await fetch(
      `https://api.neynar.com/v2/farcaster/user/bulk-by-address?addresses=${address}`,
      {
        headers: {
          accept: "application/json",
          api_key: NEYNAR_API_KEY,
        },
      }
    );
    const json = await res.json();
    const user = json[address.toLowerCase()]?.[0];

    if (!user) return null;

    return {
      username: user.username,
      displayName: user.display_name,
      pfp: user.pfp_url,
      fid: user.fid,
    };
  } catch (error) {
    console.error("Neynar Error:", error);
    return null;
  }
}

/**
 * Fetch multiple Farcaster profiles by Ethereum addresses (bulk)
 */
export async function fetchFarcasterProfiles(
  addresses: string[]
): Promise<Record<string, FarcasterProfile>> {
  if (addresses.length === 0) return {};

  // Filter unique and valid addresses
  const unique = [
    ...new Set(
      addresses.filter((a) => a && a.length > 0).map((a) => a.toLowerCase())
    ),
  ];
  if (unique.length === 0) return {};

  try {
    const url = `https://api.neynar.com/v2/farcaster/user/bulk-by-address?addresses=${unique.join(",")}`;
    const res = await fetch(url, {
      headers: {
        accept: "application/json",
        api_key: NEYNAR_API_KEY,
      },
    });
    const json = await res.json();

    const result: Record<string, FarcasterProfile> = {};
    for (const addr of unique) {
      const user = json[addr]?.[0];
      if (user) {
        result[addr] = {
          username: user.username,
          displayName: user.display_name,
          pfp: user.pfp_url,
          fid: user.fid,
        };
      }
    }
    return result;
  } catch (error) {
    console.error("Neynar Bulk Error:", error);
    return {};
  }
}
