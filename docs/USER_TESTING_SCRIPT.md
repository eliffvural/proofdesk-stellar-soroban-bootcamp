# ProofDesk Level 5 User Testing Script

Use this script for each real Level 5 tester. Keep the session short and collect one signed Testnet transaction plus one feedback entry per tester. The Level 5 target is 50+ real testers with active usage proof.

## Tester Setup

- Tester has Freighter installed.
- Freighter is switched to Stellar Testnet.
- Tester is comfortable using a public Testnet wallet address for submission evidence.
- Do not ask testers to paste private documents. Use sample text or harmless metadata.

## Session Steps

1. Open the live ProofDesk URL.
2. Connect Freighter.
3. Confirm the wallet is on Stellar Testnet.
4. Generate a fingerprint from sample document text.
5. Create an on-chain proof and approve the wallet signature.
6. Verify the generated proof.
7. Open the explorer link if the tester wants to inspect the contract.
8. Copy the transaction hash or Stellar explorer URL.
9. Submit the Level 5 Google Form with name, email, wallet address, transaction hash, rating, and feedback.
10. Save the same feedback in the in-app User Feedback panel when possible.
11. Export the Level 5 evidence JSON/CSV after each testing batch.

## Feedback Questions

- What document or record would you want to verify with ProofDesk?
- Was the wallet connection clear?
- Was the fingerprint concept clear?
- Did the verification certificate make the result trustworthy?
- What felt confusing or slow?
- Would you use this for a certificate, agreement, invoice, or audit trail?

## Evidence To Record

- Tester name or alias
- Tester email
- Public wallet address
- Signed action completed: `create_proof` or `revoke_proof`
- Proof hash
- Transaction hash or explorer URL when available
- Rating from 1 to 5
- One-sentence feedback summary

Do not count read-only `verify_proof` checks as a Level 5 onboarded user unless the same wallet also signs a Testnet transaction.
