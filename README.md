# ProofDesk Stellar

ProofDesk is a Stellar Soroban dApp for creating, revoking, and verifying on-chain document proofs with wallet-based ownership.

## Project Name

- ProofDesk Stellar

## About Me

- name: Elif Vural
- Building with Stellar Soroban
- Interested in proof, verification, and privacy-friendly blockchain use cases
- Creating bootcamp-ready smart contract projects with polished frontends
- Learning how to connect smart contract logic with useful product flows

## Project Details

ProofDesk lets users create tamper-resistant document proofs on Stellar Testnet. The app does not upload or store files. Instead, it creates a SHA-256 fingerprint from document text and stores that fingerprint with a title, owner wallet, timestamp, and active or revoked status in a Soroban smart contract. Anyone can verify whether a proof is valid for a specific wallet and hash. The owner can also revoke a proof if it should no longer be trusted.

## Vision

ProofDesk shows how blockchain can prove that a document existed at a specific time without exposing private document content. This can support certificates, agreements, invoices, workshop completion records, and audit trails. By storing only cryptographic fingerprints, ProofDesk keeps documents private while making verification public, transparent, and wallet-owned.

## Development Plan

1. Create Soroban storage keys for proof records, owner proof counts, total proof count, and proof status.
2. Add `create_proof(owner, proof_hash, title)` with wallet authorization and duplicate-proof protection.
3. Add verification and read functions: `verify_proof(owner, proof_hash)`, `get_proof(owner, proof_hash)`, `get_proof_count(owner)`, and `get_total_proofs()`.
4. Add `revoke_proof(owner, proof_hash)` so the owner can mark a proof as inactive without deleting the record.
5. Build the React frontend with Freighter wallet connection, local SHA-256 hashing, create proof, verify proof, revoke proof, and proof stats screens.
6. Test, build, generate TypeScript bindings, deploy the contract to Stellar Testnet, and connect the deployed contract ID to the frontend.

## Personal Story

I built ProofDesk to create a more practical smart contract project than a simple counter. It helped me understand how blockchain can verify real-world information while keeping private data off-chain. The project connects wallet authorization, hash generation, Soroban storage, and a clear frontend workflow.

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
- Explorer: <https://stellar.expert/explorer/testnet/contract/CAWMSCBHY4KJYSPOWPEPF2WNBHN6A2DNS5OS55ACV66CKWQP4GIDZEKI>

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

## Visual Concept

- Mascot: calm robot archivist
- Setting: bright verification office
- Physical keywords: validating proofs, organizing holographic documents, sealing trusted records
- Art direction: futuristic premium digital painting with glowing Stellar blockchain seals, precise proof validation, and a clean professional mood
