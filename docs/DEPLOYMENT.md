# ProofDesk Deployment Guide

## GitHub Pages

Expected production URL:

https://eliffvural.github.io/proofdesk-stellar-soroban-bootcamp/

The repository includes `.github/workflows/pages.yml`. On every push to `main`, the workflow:

1. Sets up Rust and the Stellar CLI.
2. Runs `cargo build --workspace`, `cargo test --workspace`, and `stellar contract build`.
3. Installs frontend dependencies with `npm ci`.
4. Runs `npm audit --omit=dev`.
5. Builds the Vite app with `GITHUB_PAGES=true`.
6. Uploads `frontend/dist` as a GitHub Pages artifact.
7. Deploys the artifact to GitHub Pages after both the frontend build and contract validation pass.

## Stellar Testnet Contract Deployment

The workflow also includes a manual `deploy-contract-testnet` job for deploying the Soroban contract to Stellar Testnet.

To use it:

1. Add a repository secret named `STELLAR_TESTNET_SECRET_KEY` in GitHub. It must be a funded Stellar Testnet account secret key.
2. Open the repository's Actions tab.
3. Run the `Deploy ProofDesk Frontend` workflow manually.
4. Enable the `deploy_contract` input.

The job builds the contract WASM and runs:

```bash
stellar contract deploy \
  --wasm target/wasm32v1-none/release/proofdesk.wasm \
  --source-account "$STELLAR_TESTNET_SECRET_KEY" \
  --rpc-url https://soroban-testnet.stellar.org \
  --network-passphrase "Test SDF Network ; September 2015" \
  --alias proofdesk
```

Normal pushes do not run this Testnet deployment job, so frontend deployment is not blocked by missing deployment secrets.

## Repository Settings

If Pages is not already enabled, configure:

- Source: GitHub Actions
- Branch: workflow-managed
- Custom domain: none

## Local Production Check

```bash
cd frontend
npm install
npm run audit:prod
GITHUB_PAGES=true npm run build
```

## Static Host Fallback

Any static host can run the same app.

- Build command: `cd frontend && npm install && npm run build`
- Publish directory: `frontend/dist`
- Environment: `VITE_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org`

Only set `VITE_ANALYTICS_ENDPOINT`, `VITE_FEEDBACK_ENDPOINT`, and `VITE_MONITORING_ENDPOINT` when hosted collection endpoints are available.
