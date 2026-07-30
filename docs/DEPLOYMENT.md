# ProofDesk Deployment Guide

## GitHub Pages

Expected production URL:

https://eliffvural.github.io/proofdesk-stellar-soroban-bootcamp/

The repository includes `.github/workflows/pages.yml`. On every push to `main`, the workflow:

1. Installs frontend dependencies with `npm ci`.
2. Runs `npm audit --omit=dev`.
3. Builds the Vite app with `GITHUB_PAGES=true`.
4. Uploads `frontend/dist` as a GitHub Pages artifact.
5. Deploys the artifact to GitHub Pages.

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
