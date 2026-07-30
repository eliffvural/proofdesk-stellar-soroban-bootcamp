# ProofDesk Level 4 Submission

## Project

- Project: ProofDesk Stellar
- Public repository: https://github.com/eliffvural/proofdesk-stellar-soroban-bootcamp
- Network: Stellar Testnet
- Contract ID: `CAWMSCBHY4KJYSPOWPEPF2WNBHN6A2DNS5OS55ACV66CKWQP4GIDZEKI`
- Contract explorer: https://stellar.expert/explorer/testnet/contract/CAWMSCBHY4KJYSPOWPEPF2WNBHN6A2DNS5OS55ACV66CKWQP4GIDZEKI
- Live demo: https://eliffvural.github.io/proofdesk-stellar-soroban-bootcamp/
- Demo video: `TODO: add video URL`

## Production MVP Checklist

- [x] Freighter wallet connection with Testnet network validation
- [x] Testnet funding fallback through Friendbot for unfunded demo wallets
- [x] Local SHA-256 document fingerprinting without uploading document content
- [x] On-chain proof creation, verification, and revocation
- [x] Contract statistics for wallet proof count and total proof count
- [x] Mobile responsive product UI
- [x] Loading, disabled, and error states for wallet and contract actions
- [x] Runtime error capture through the monitoring event store
- [x] Privacy-friendly analytics event tracking
- [x] User feedback collection
- [x] Exportable Level 4 evidence snapshot
- [x] Production frontend deployment workflow
- [x] Production frontend deployment URL verified after GitHub Pages publish
- [ ] Demo video link
- [ ] 10+ real user wallet interactions
- [ ] Final user feedback summary from real testers
- [ ] 15+ meaningful commits in the public GitHub repository

## Screenshots To Capture

Capture these after production deployment:

- Product UI on desktop: create proof, verification certificate, and contract metrics
- Mobile responsive view: wallet flow and proof panels
- Analytics or monitoring setup: Level 4 Launch / Analytics and evidence panel
- Wallet interaction proof: exported evidence file or Stellar explorer transaction list

Suggested file names:

- `docs/screenshots/product-ui-desktop.png`
- `docs/screenshots/product-ui-mobile.png`
- `docs/screenshots/analytics-monitoring.png`
- `docs/screenshots/wallet-interactions.png`

Current local QA screenshots are available at:

- `docs/screenshots/product-ui-desktop.png`
- `docs/screenshots/product-ui-mobile.png`

## Real User Wallet Interaction Evidence

Use the in-app **Export Level 4 evidence** button after each testing session. Submit only real wallet data from actual testers.

| # | Tester | Wallet | Action | Proof hash | Tx hash / Explorer | Date | Notes |
|---|---|---|---|---|---|---|---|
| 1 | TODO | TODO | create_proof | TODO | TODO | TODO | TODO |
| 2 | TODO | TODO | create_proof | TODO | TODO | TODO | TODO |
| 3 | TODO | TODO | create_proof | TODO | TODO | TODO | TODO |
| 4 | TODO | TODO | create_proof | TODO | TODO | TODO | TODO |
| 5 | TODO | TODO | create_proof | TODO | TODO | TODO | TODO |
| 6 | TODO | TODO | create_proof | TODO | TODO | TODO | TODO |
| 7 | TODO | TODO | create_proof | TODO | TODO | TODO | TODO |
| 8 | TODO | TODO | create_proof | TODO | TODO | TODO | TODO |
| 9 | TODO | TODO | create_proof | TODO | TODO | TODO | TODO |
| 10 | TODO | TODO | create_proof | TODO | TODO | TODO | TODO |

## Feedback Summary Template

Fill this after collecting at least 10 real user sessions.

- Testers onboarded: `TODO`
- Average rating: `TODO`
- Most common use case: `TODO`
- What users understood quickly: `TODO`
- What users found confusing: `TODO`
- Product changes made from feedback: `TODO`
- Next validation step: `TODO`

## Demo Video Script

1. Show the live ProofDesk URL on desktop.
2. Connect Freighter on Stellar Testnet.
3. Generate a document fingerprint from sample text.
4. Create a proof and show the signature flow.
5. Verify the proof and show the verification certificate.
6. Open the contract explorer link.
7. Revoke the proof, then verify that it becomes inactive.
8. Show the Level 4 Launch panel with analytics, monitoring, user count, and feedback.
9. Export the Level 4 evidence JSON.
10. Show the same UI in a mobile viewport.

## Deployment Notes

Recommended static deployment settings:

- Build command: `cd frontend && npm install && npm run build`
- Publish directory: `frontend/dist`
- Required environment variable: `VITE_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org`
- Optional environment variables: `VITE_ANALYTICS_ENDPOINT`, `VITE_FEEDBACK_ENDPOINT`, `VITE_MONITORING_ENDPOINT`

## Verification Commands

```bash
cargo test
cd frontend
npm audit --omit=dev
npm run build
```
