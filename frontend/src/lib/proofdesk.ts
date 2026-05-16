import { signTransaction } from "@stellar/freighter-api";
import * as ProofDesk from "proofdesk";

export type Proof = ProofDesk.Proof;

export const RPC_URL =
  import.meta.env.VITE_SOROBAN_RPC_URL ?? "https://soroban-testnet.stellar.org";

export const CONTRACT_ID = ProofDesk.networks.testnet.contractId;
export const NETWORK_PASSPHRASE = ProofDesk.networks.testnet.networkPassphrase;

export function createProofDeskClient(publicKey?: string) {
  return new ProofDesk.Client({
    ...ProofDesk.networks.testnet,
    rpcUrl: RPC_URL,
    publicKey,
    signTransaction: (
      xdr: string,
      options?: { networkPassphrase?: string; address?: string },
    ) =>
      signTransaction(xdr, {
        ...options,
        address: publicKey,
        networkPassphrase: NETWORK_PASSPHRASE,
      }),
  });
}
