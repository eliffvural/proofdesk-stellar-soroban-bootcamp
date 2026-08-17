# Level 5 Transaction Activity Proof

Real transaction activity is mandatory for Level 5. A wallet address alone is not enough.

## Accepted Proof

- `create_proof` transaction hash.
- `revoke_proof` transaction hash.
- Stellar expert Testnet explorer URL for a signed ProofDesk transaction.
- Screenshot showing signed activity linked to the Testnet wallet.

## Not Accepted

- A wallet address without transaction proof.
- A read-only `verify_proof` check without a signed transaction.
- A copied transaction that does not belong to the tester wallet.

## Reviewer-Friendly Format

For each tester, record:

- Tester name or alias.
- Wallet address.
- Signed action: `create_proof` or `revoke_proof`.
- Transaction hash.
- Explorer URL.
- Timestamp.
