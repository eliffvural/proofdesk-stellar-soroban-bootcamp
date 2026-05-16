# ProofDesk Stellar

ProofDesk is a Stellar Soroban dApp for creating, revoking, and verifying on-chain document proofs with wallet-based ownership.

## Project Name

- ProofDesk Stellar

## Who Are You

- name: Elif Vural
- Building with Stellar Soroban
- Interested in proof, verification, and privacy-friendly blockchain use cases
- Creating bootcamp-ready smart contract projects with polished frontends

## Project Details

ProofDesk lets users create tamper-resistant document proofs on Stellar Testnet. The app does not upload or store files. Instead, it creates a SHA-256 fingerprint from document text and stores that fingerprint with a title, owner wallet, timestamp, and active/revoked status in a Soroban smart contract. Anyone can verify whether a proof is valid for a specific wallet and hash. The owner can also revoke a proof if it should no longer be trusted.

## Vision

ProofDesk shows how blockchain can prove that a document existed at a specific time without exposing private document content. This can support certificates, agreements, invoices, workshop completion records, and audit trails. By storing only cryptographic fingerprints, ProofDesk keeps documents private while making verification public, transparent, and wallet-owned.

## Smart Contract Functions

- `create_proof(owner, proof_hash, title)` creates a proof for the owner wallet.
- `verify_proof(owner, proof_hash)` checks if a proof exists and is active.
- `get_proof(owner, proof_hash)` returns proof metadata.
- `revoke_proof(owner, proof_hash)` marks a proof as inactive.
- `get_proof_count(owner)` returns the owner's proof count.
- `get_total_proofs()` returns total unique proofs.

## Deployed Contract

- Network: Stellar Testnet
- Contract ID: `CAWMSCBHY4KJYSPOWPEPF2WNBHN6A2DNS5OS55ACV66CKWQP4GIDZEKI`
- Explorer: https://stellar.expert/explorer/testnet/contract/CAWMSCBHY4KJYSPOWPEPF2WNBHN6A2DNS5OS55ACV66CKWQP4GIDZEKI

## Tech Stack

- Stellar Soroban smart contract
- Rust
- React
- TypeScript
- Vite
- Freighter wallet

## Installation

Install the Soroban target:

```bash
rustup target add wasm32v1-none
```

Run contract tests:

```bash
cargo test
```

Build the contract:

```bash
stellar contract build
```

Install and build the generated TypeScript binding:

```bash
cd frontend/packages/proofdesk
npm install
npm run build
cd ../..
```

Install and run the frontend:

```bash
cd frontend
npm install
npm run dev
```

Open:

```bash
http://localhost:4325
```

## ChatGPT Prompt 1

Write me a project description, in less than 150 simple, straightforward words, for a blockchain project on Stellar. The project lets users create, verify, and revoke document proofs by storing SHA-256 hashes on-chain.

## ChatGPT Prompt 2

Now, also write a vision statement, in 100 simple, straightforward words, for this project. Talk about privacy-friendly document verification and public proof ownership.

## ChatGPT Prompt 3

Now, write me a software development plan for this project. Mainly focus on smart contract functions, variables, and features. Then mention the frontend. Keep it under 6 steps. Final step can be deployment.

## ChatGPT Prompt 4

Now, write a personal story summary in less than 100 words about building a Stellar document proof dApp as a practical smart contract project.

## ChatGPT Prompt 5

Can you also write a draft GitHub README on how to install the project?

## ImgCreator Prompt

Futuristic premium digital painting with a calm robot archivist mascot inside a bright verification office, holographic documents, glowing Stellar blockchain seals, precise proof validation.
