# ProofDesk Level 5 Google Form Setup

Create one Google Form for Level 5 user onboarding and feedback. Paste the final form URL into the README and [`docs/LEVEL5_SUBMISSION.md`](LEVEL5_SUBMISSION.md).

## Form Title

ProofDesk Level 5 User Feedback

## Form Description

Thank you for testing ProofDesk on Stellar Testnet. Please use a public Testnet wallet only. Do not paste private documents into the app or this form. We only need your wallet address, transaction proof, rating, and feedback.

## Required Questions

| # | Question | Type | Required | Notes |
|---|---|---|---|---|
| 1 | What is your name? | Short answer | Yes | Name or alias is acceptable |
| 2 | What email can we use for follow-up? | Short answer | Yes | Enable email validation if available |
| 3 | Paste the Stellar Testnet wallet address you used. | Short answer | Yes | Should start with `G` |
| 4 | Paste your `create_proof` transaction hash or Stellar explorer URL. | Short answer | Yes | Required for real transaction proof |
| 5 | Which use case did you test? | Multiple choice | Yes | Certificate verification, agreement proof, invoice proof, audit trail, other |
| 6 | Rate ProofDesk from 1 to 5. | Linear scale | Yes | 1 = confusing, 5 = very clear |
| 7 | What worked, what was confusing, and what should improve? | Paragraph | Yes | Ask for at least one sentence |
| 8 | May we contact you for the next test round? | Multiple choice | No | Yes / No |
| 9 | Add a screenshot or proof link if you have one. | File upload or short answer | No | Optional extra evidence |

## Recommended Settings

- Keep the form public enough for testers to submit without friction.
- If file upload requires sign-in and creates friction, use a short-answer proof link instead.
- Turn on response timestamps.
- Do not collect private document content.
- Do not ask for secret keys or recovery phrases.

## Export to Excel

1. Open the Google Form.
2. Go to the Responses tab.
3. Link responses to a Google Sheet.
4. In Google Sheets, choose File → Download → Microsoft Excel (`.xlsx`).
5. Replace or update [`docs/evidence/proofdesk-level5-user-feedback.xlsx`](evidence/proofdesk-level5-user-feedback.xlsx) with the exported data.
6. Keep the `Analysis` and `Improvement Backlog` sheets in the workbook, or copy the exported response rows into the existing `Form Responses` sheet.

## README Update

After the form is live, update these fields in the README:

- Google Form URL
- Feedback Excel workbook link
- Current number of real testers
- Current number of signed Testnet wallets
- Improvement summary with commit links
