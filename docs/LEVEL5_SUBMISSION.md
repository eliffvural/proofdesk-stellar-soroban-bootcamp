# ProofDesk Level 5 Blue Belt Submission

## Project

- Project: ProofDesk Stellar
- Public repository: https://github.com/eliffvural/proofdesk-stellar-soroban-bootcamp
- Live demo: https://eliffvural.github.io/proofdesk-stellar-soroban-bootcamp/
- Network: Stellar Testnet
- Contract ID: `CAWMSCBHY4KJYSPOWPEPF2WNBHN6A2DNS5OS55ACV66CKWQP4GIDZEKI`
- Contract explorer: https://stellar.expert/explorer/testnet/contract/CAWMSCBHY4KJYSPOWPEPF2WNBHN6A2DNS5OS55ACV66CKWQP4GIDZEKI
- Pitch deck/PPT: [`docs/pitch/ProofDesk_Level5_Pitch_Deck.pptx`](pitch/ProofDesk_Level5_Pitch_Deck.pptx)
- Feedback Excel workbook: [`docs/evidence/proofdesk-level5-user-feedback.xlsx`](evidence/proofdesk-level5-user-feedback.xlsx)
- Google Form: `TODO: paste live Google Form URL`
- Demo video: `TODO: paste final walkthrough URL`

## Level 5 Checklist

| Requirement | Status | Evidence |
|---|---|---|
| Public GitHub repository | Ready | Repository link above |
| Minimum 20+ meaningful commits | Ready | Repository meets the Level 5 minimum 20+ meaningful commits requirement |
| Live deployed application | Ready | GitHub Pages link above |
| Minimum 50+ testnet users onboarded | Pending real testers | Use the feedback workbook and transaction proof table |
| Real transaction activity | Pending real testers | Count only wallets with signed `create_proof` or `revoke_proof` transactions |
| Active usage proof | Pending real testers | Add Stellar explorer transaction links and final screenshots |
| New feature based on feedback | Ready structure / pending real feedback | Level 5 growth dashboard, email capture, signed-wallet target, JSON/CSV export |
| UX/UI and onboarding improvements | Ready | In-app Level 5 dashboard and updated testing script |
| Product stability | Ready for collection | Monitoring issue export remains available in the app |
| Professional pitch deck/PPT | Ready | Pitch deck link above |
| Full product walkthrough/demo | Needs recording | Use [`docs/LEVEL5_DEMO_SCRIPT.md`](LEVEL5_DEMO_SCRIPT.md) |
| Updated README and documentation | Ready | README plus this tracker |
| User feedback iteration summary | Ready structure / pending real data | See improvement section below |

The pending items require real user participation and should not be fabricated.

## User Onboarding Evidence Rules

A tester counts toward the Level 5 target only when all items below are recorded:

1. Tester name or alias.
2. Tester email.
3. Public Stellar Testnet wallet address.
4. Signed transaction activity from that wallet, preferably `create_proof`.
5. Transaction hash or Stellar explorer URL.
6. Product rating from 1 to 5.
7. Written feedback.

Use the workbook at [`docs/evidence/proofdesk-level5-user-feedback.xlsx`](evidence/proofdesk-level5-user-feedback.xlsx) as the source of truth for the exported Google Form responses and analysis.

## Google Form Requirements

Create a Google Form with the exact field structure in [`docs/LEVEL5_GOOGLE_FORM.md`](LEVEL5_GOOGLE_FORM.md). Required fields:

- Name
- Email
- Stellar Testnet wallet address
- Testnet transaction hash or explorer URL
- Use case tested
- Product rating from 1 to 5
- Product feedback

After collecting responses, export them to Excel and replace or update [`docs/evidence/proofdesk-level5-user-feedback.xlsx`](evidence/proofdesk-level5-user-feedback.xlsx). Add the live Google Form URL to this tracker and the README before submission.

## Feedback-Driven Product Iteration

Initial Level 5 improvement commit:

- Commit: [`c53d1762b97e2b492f5d79be0dde23a81d612ef5`](https://github.com/eliffvural/proofdesk-stellar-soroban-bootcamp/commit/c53d1762b97e2b492f5d79be0dde23a81d612ef5)
- Change summary: added a Level 5 growth validation dashboard, switched onboarding progress to a 50 signed-wallet target, added tester email capture, and added Level 5 JSON/CSV exports for feedback/evidence.
- Requirement covered: product iteration, onboarding optimization, active usage proof collection, and user feedback analysis readiness.

Next improvements should be prioritized from real feedback themes in the Excel workbook:

| Feedback theme | Planned product evolution | Evidence to attach |
|---|---|---|
| Onboarding confusion | Shorter tester guide, clearer wallet/Testnet state, visible proof checklist | Screenshot + commit link |
| Trust clarity | Shareable verification certificate and copyable transaction links | Demo timestamp + commit link |
| Repeat usage | Proof history, saved hashes, and batch proof creation | Feedback count + commit link |
| Stability | Review monitoring issues after each cohort and fix top blockers | Issue export + commit link |
| Growth | Cohort-based outreach and use-case-specific demos | Form responses + analytics screenshot |

## Growth Strategy

1. Recruit testers from bootcamp peers, document-heavy student workflows, certificate communities, and founders who need lightweight proof-of-existence demos.
2. Give each tester a short sample text so no private document is pasted.
3. Ask each tester to create one proof, copy the transaction link, and submit the Google Form.
4. Review responses in batches of 10 users.
5. Convert the top feedback theme into a small product improvement commit.
6. Update README with the improvement summary, commit link, final user count, analytics screenshot, and demo video URL.

## Demo Video Flow

Use [`docs/LEVEL5_DEMO_SCRIPT.md`](LEVEL5_DEMO_SCRIPT.md). The recording should show:

1. Live app URL.
2. Freighter Testnet wallet connection.
3. Local document fingerprint generation.
4. Signed proof creation transaction.
5. Proof verification and contract explorer link.
6. Revocation flow.
7. Level 5 growth dashboard and evidence export.
8. Google Form and Excel feedback analysis workbook.
9. Pitch deck and roadmap summary.

## Final Submission Notes

Before submitting the GitHub repository link, replace every `TODO` with real links and final counts:

- Google Form URL
- Demo video URL
- 50+ tester rows in the Excel workbook
- Stellar explorer links for signed transactions
- Final analytics/transaction screenshots
- Final feedback summary and the commit links for improvements made after feedback
