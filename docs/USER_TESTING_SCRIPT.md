# ProofDesk User Testing Script

Use this script for each real Level 4 tester. Keep the session short and collect one wallet interaction plus one feedback entry per tester.

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
8. Save feedback in the User Feedback panel.
9. Export the Level 4 evidence JSON after the session.

## Feedback Questions

- What document or record would you want to verify with ProofDesk?
- Was the wallet connection clear?
- Was the fingerprint concept clear?
- Did the verification certificate make the result trustworthy?
- What felt confusing or slow?
- Would you use this for a certificate, agreement, invoice, or audit trail?

## Evidence To Record

- Tester name or alias
- Public wallet address
- Action completed: `create_proof`, `verify_proof`, or `revoke_proof`
- Proof hash
- Transaction hash or explorer URL when available
- Rating from 1 to 5
- One-sentence feedback summary
