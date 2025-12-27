# Frequently Asked Questions

Common questions about GlazeCorp products.

---

## General

### What is GlazeCorp?

GlazeCorp is a contributor to DonutDAO that builds decentralized infrastructure on Base chain, including the DONUT Miner, Liquid Signal Governance (LSG), and Franchise Launchpad.

### What chain is this on?

All GlazeCorp contracts are deployed on **Base** (Chain ID: 8453), an Ethereum L2.

### Is there a token?

Yes, **DONUT** is the core token. It's minted through mining and can be staked for governance participation.

---

## Mining

### How do I mine DONUT?

1. Go to [glazecorp.com/mine](https://glazecorp.com/mine)
2. Connect your wallet
3. Wait for price to decay to your target
4. Click "GLAZE" and confirm transaction
5. You're now mining!

### Why is mining called "glazing"?

It's a fun reference to glazing donuts - the visual of coating/taking over.

### What happens when someone else mines?

You receive:
- All DONUT tokens minted while you were mining
- 80% of what the new miner paid

### Why did my mining transaction fail?

Common reasons:
- **Epoch mismatch**: Someone mined before you (frontrun protection)
- **Deadline passed**: Transaction took too long
- **Price exceeded**: Price went above your max

### How is the emission rate determined?

DONUT starts at 4 tokens/second and halves every 30 days until it reaches the tail emission of 0.01 tokens/second.

### Is there a maximum DONUT supply?

No hard cap, but emission decreases dramatically over time. At tail emission (0.01/sec), only ~315,360 DONUT are minted per year.

---

## Governance (LSG)

### What is gDONUT?

gDONUT (Governance DONUT) is what you receive when you stake DONUT. It represents your voting power and is non-transferable.

### Why is gDONUT non-transferable?

To prevent flash loan attacks and ensure only committed stakeholders can vote.

### How often can I vote?

Once per epoch (7 days). You can change your votes at the start of each new epoch.

### How are bribe rewards calculated?

Rewards = (your votes on strategy / total votes on strategy) × strategy's bribe pool

### Why is my APR showing 0%?

This can happen if:
- No recent auction activity on that strategy
- Token price feeds not loading
- Very small `rewardsPerToken` value (check if it's actually 0 or just small)

### Do I have to vote to earn rewards?

Yes, you must actively vote for strategies to receive bribe rewards from them.

### Can I unstake anytime?

You must first reset your votes (clearing all allocations), then you can unstake.

---

## Franchise

### What is Franchise?

A launchpad for creating new tokens with permanent liquidity and fair distribution through mining.

### How is liquidity "permanent"?

Initial LP tokens are burned to the 0xdead address, making it impossible for anyone to remove liquidity.

### Can the token creator rug pull?

No. The LP tokens are burned at launch, and the creator cannot mint additional tokens or change emission rates.

### How much DONUT do I need to launch?

Check the `minDonutForLaunch` value on the Core contract. Typically 100,000+ DONUT for meaningful liquidity.

### Can I change parameters after launch?

No. Emission rates, epoch periods, and fee splits are immutable after launch. You can only update metadata URI and ownership.

### What tokens can I launch?

Any token! You configure the name, symbol, and all parameters. The token is paired with DONUT on Uniswap V2.

---

## Technical

### What are the gas costs?

Approximate costs at 0.001 gwei (Base is very cheap):
- Mining: ~150-200k gas (~$0.02)
- Staking: ~100k gas (~$0.01)
- Voting: ~200-400k gas (~$0.02-0.04)
- Claiming: ~100-200k gas (~$0.01-0.02)
- Launching: ~3M gas (~$0.30)

### Are the contracts audited?

Yes, the contracts have been audited. See the audit reports in the GitHub repository.

### Can I fork these contracts?

Yes, the contracts are open source. However, ensure you understand the code before deploying.

### What wallets are supported?

Any Web3 wallet that supports Base chain: MetaMask, Coinbase Wallet, Rainbow, etc.

---

## Troubleshooting

### Transaction stuck pending

- Check if gas price is sufficient
- Try speeding up or canceling in your wallet
- Base is usually fast - if stuck, likely gas issue

### Can't connect wallet

- Ensure you're on Base network
- Try refreshing the page
- Clear browser cache
- Try a different browser

### Balance not showing

- Wait a few seconds for RPC to sync
- Check you're on the correct network
- Try refreshing

### Rewards not appearing

- Rewards stream over 7 days, might be tiny initially
- Check you voted for that strategy
- Ensure strategy has had auction activity

### "Already voted this epoch" error

You can only vote or reset once per 7-day epoch. Wait for the next epoch.

---

## Economics

### Where does the revenue come from?

- Mining fees (20% of mining payments)
- Franchise fees (15% of franchise mining)
- Strategy auction spreads

### Who controls the treasury?

The DAO treasury is controlled by governance (Governor contract or multisig, depending on setup).

### How is value created?

1. Mining creates DONUT (scarce, decreasing emission)
2. Trading activity generates fees
3. Fees flow to governance
4. Voters direct revenue allocation
5. DAO treasury grows
6. Ecosystem value increases

### Is DONUT inflationary?

Yes, but decreasingly so. Emission rate halves every 30 days until reaching tail emission. At tail, inflation is minimal compared to typical circulating supply.

---

## Getting Help

### Where can I get support?

- Discord: [Join DonutDAO Discord]
- Twitter: [@GlazeCorp]
- GitHub: [Report issues]

### Found a bug?

Please report security issues privately to the team. For non-security bugs, open a GitHub issue.
