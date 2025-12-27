# Staking DONUT

Stake your DONUT tokens to receive gDONUT and participate in governance.

---

## How Staking Works

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          STAKING FLOW                                       │
└─────────────────────────────────────────────────────────────────────────────┘

  YOUR WALLET                    GOVERNANCE TOKEN CONTRACT
  ─────────────                  ──────────────────────────

  DONUT tokens ──────────────────► stake(amount)
                                        │
                                        ▼
                                  ┌─────────────────┐
                                  │  DONUT locked   │
                                  │  in contract    │
                                  └────────┬────────┘
                                           │
                                           ▼
  gDONUT received ◄──────────────── gDONUT minted (1:1)
  (non-transferable)                      │
                                          ▼
                                  ┌─────────────────┐
                                  │ Auto-delegates  │
                                  │ to yourself     │
                                  └─────────────────┘
```

---

## Step-by-Step Staking

### 1. Navigate to Governance

Go to [glazecorp.com/govern](https://glazecorp.com/govern) and connect your wallet.

### 2. Enter Amount

```
┌─────────────────────────────────────────────────────────────────┐
│  STAKE                                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Amount: [_______________] DONUT                                │
│                                                                 │
│  Balance: 10,000 DONUT                    [MAX]                │
│                                                                 │
│  You will receive: 10,000 gDONUT                               │
│                                                                 │
│  [     APPROVE DONUT     ]  ← First time only                  │
│  [        STAKE          ]                                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3. Approve (First Time Only)

If this is your first time staking, you need to approve the GovernanceToken contract to spend your DONUT:

```
Transaction 1: Approve
├── Contract: DONUT token
├── Spender: GovernanceToken contract
├── Amount: Your stake amount (or unlimited)
└── Gas: ~50,000
```

### 4. Confirm Stake

```
Transaction 2: Stake
├── Contract: GovernanceToken
├── Function: stake(amount)
├── Result: gDONUT minted to you
└── Gas: ~100,000
```

### 5. Auto-Delegation

On your first stake, you're automatically delegated to yourself. This means:
- Your gDONUT balance = your voting power
- Compatible with ERC20Votes standard
- No additional transaction needed

---

## Unstaking

To get your DONUT back, you must first clear all votes.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         UNSTAKING FLOW                                      │
└─────────────────────────────────────────────────────────────────────────────┘

  STEP 1: RESET VOTES (if you have active votes)

  voter.reset() ────────► Clears all your strategy votes
                          Withdraws from all bribe contracts
                          account_UsedWeights → 0

  ─────────────────────────────────────────────────────────────────────────────

  STEP 2: UNSTAKE

  governanceToken.unstake(amount) ────────► Burns your gDONUT
                                            Returns DONUT to you

  ─────────────────────────────────────────────────────────────────────────────

  IMPORTANT:
  ├── Cannot unstake if account_UsedWeights > 0
  ├── Must wait until next epoch to reset (if you voted this epoch)
  └── Claim pending rewards before resetting (or they may be lost)
```

### Unstaking Checklist

```
☐ Claim all pending bribe rewards
☐ Wait for next epoch (if you voted this epoch)
☐ Reset your votes
☐ Unstake your gDONUT
☐ Receive DONUT back
```

---

## gDONUT Properties

### Non-Transferable

```solidity
// From GovernanceToken.sol
function _beforeTokenTransfer(address from, address to, uint256 amount) internal override {
    super._beforeTokenTransfer(from, to, amount);
    // Prevents all transfers except mint/burn
    if (from != address(0) && to != address(0)) revert GovernanceToken__TransferDisabled();
}
```

**Why?**
- Prevents flash loan attacks on governance
- Ensures voters have real capital commitment
- No vote buying on secondary markets

### 1:1 Ratio

```
stake(100 DONUT) → receive 100 gDONUT
unstake(100 gDONUT) → receive 100 DONUT

No fees, no slippage, no loss
```

### ERC20Votes Compatible

gDONUT implements OpenZeppelin's ERC20Votes:
- Compatible with Governor contracts
- Works with Tally, Snapshot, Aragon
- Checkpointed voting power

---

## Delegation

By default, you're delegated to yourself. You can delegate to another address:

```solidity
governanceToken.delegate(delegateeAddress);
```

**What Delegation Does:**
- Transfers your voting power to another address
- You keep your gDONUT balance
- Delegatee can vote with your power
- You can un-delegate anytime

**Common Use Cases:**
- Delegate to a trusted community member
- Delegate to a DAO representative
- Pool voting power for proposals

---

## Viewing Your Stake

On the webapp, you can see:

```
┌─────────────────────────────────────────────────────────────────┐
│  YOUR STAKE                                                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  gDONUT Balance:     10,000                                    │
│  Voting Power:       10,000 (100% self-delegated)              │
│  Used Weight:        10,000 (fully allocated)                  │
│                                                                 │
│  Pending Rewards:                                               │
│  ├── 0.00012 cbBTC ($12.00)                                    │
│  ├── 5.50 USDC                                                 │
│  └── 100 DONUT                                                 │
│                                                                 │
│  [    CLAIM REWARDS    ]                                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## FAQ

### Can I stake more after initial stake?

Yes! You can stake additional DONUT anytime. Each stake adds to your gDONUT balance.

### Do I lose rewards if I unstake?

You should claim pending rewards before resetting votes. After reset, unclaimed rewards may be forfeited depending on the bribe contract state.

### What if I want to change my vote allocation?

You can vote with different weights next epoch. No need to unstake.

### Is there a minimum stake?

No minimum. However, very small stakes may earn minimal rewards and gas costs should be considered.

### Can I partially unstake?

Yes, you can unstake any amount up to your total gDONUT balance (after clearing votes).

---

## Next Steps

- [Voting on Strategies](voting.md) - Allocate your voting power
- [Bribe Rewards & APR](rewards.md) - Understand what you'll earn
