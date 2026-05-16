import { Buffer } from "buffer";
import { Address } from "@stellar/stellar-sdk";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Timepoint,
  Duration,
} from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

if (typeof window !== "undefined") {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}


export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CAWMSCBHY4KJYSPOWPEPF2WNBHN6A2DNS5OS55ACV66CKWQP4GIDZEKI",
  }
} as const


export interface Proof {
  active: boolean;
  created_at: u64;
  owner: string;
  proof_hash: string;
  title: string;
}

export type DataKey = {tag: "Proof", values: readonly [string, string]} | {tag: "ProofCount", values: readonly [string]} | {tag: "TotalProofs", values: void};

export interface Client {
  /**
   * Construct and simulate a get_proof transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_proof: ({owner, proof_hash}: {owner: string, proof_hash: string}, options?: MethodOptions) => Promise<AssembledTransaction<Proof>>

  /**
   * Construct and simulate a create_proof transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  create_proof: ({owner, proof_hash, title}: {owner: string, proof_hash: string, title: string}, options?: MethodOptions) => Promise<AssembledTransaction<u32>>

  /**
   * Construct and simulate a revoke_proof transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  revoke_proof: ({owner, proof_hash}: {owner: string, proof_hash: string}, options?: MethodOptions) => Promise<AssembledTransaction<boolean>>

  /**
   * Construct and simulate a verify_proof transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  verify_proof: ({owner, proof_hash}: {owner: string, proof_hash: string}, options?: MethodOptions) => Promise<AssembledTransaction<boolean>>

  /**
   * Construct and simulate a get_proof_count transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_proof_count: ({owner}: {owner: string}, options?: MethodOptions) => Promise<AssembledTransaction<u32>>

  /**
   * Construct and simulate a get_total_proofs transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_total_proofs: (options?: MethodOptions) => Promise<AssembledTransaction<u32>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAQAAAAAAAAAAAAAABVByb29mAAAAAAAABQAAAAAAAAAGYWN0aXZlAAAAAAABAAAAAAAAAApjcmVhdGVkX2F0AAAAAAAGAAAAAAAAAAVvd25lcgAAAAAAABMAAAAAAAAACnByb29mX2hhc2gAAAAAABAAAAAAAAAABXRpdGxlAAAAAAAAEA==",
        "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAAAwAAAAEAAAAAAAAABVByb29mAAAAAAAAAgAAABMAAAAQAAAAAQAAAAAAAAAKUHJvb2ZDb3VudAAAAAAAAQAAABMAAAAAAAAAAAAAAAtUb3RhbFByb29mcwA=",
        "AAAAAAAAAAAAAAAJZ2V0X3Byb29mAAAAAAAAAgAAAAAAAAAFb3duZXIAAAAAAAATAAAAAAAAAApwcm9vZl9oYXNoAAAAAAAQAAAAAQAAB9AAAAAFUHJvb2YAAAA=",
        "AAAAAAAAAAAAAAAMY3JlYXRlX3Byb29mAAAAAwAAAAAAAAAFb3duZXIAAAAAAAATAAAAAAAAAApwcm9vZl9oYXNoAAAAAAAQAAAAAAAAAAV0aXRsZQAAAAAAABAAAAABAAAABA==",
        "AAAAAAAAAAAAAAAMcmV2b2tlX3Byb29mAAAAAgAAAAAAAAAFb3duZXIAAAAAAAATAAAAAAAAAApwcm9vZl9oYXNoAAAAAAAQAAAAAQAAAAE=",
        "AAAAAAAAAAAAAAAMdmVyaWZ5X3Byb29mAAAAAgAAAAAAAAAFb3duZXIAAAAAAAATAAAAAAAAAApwcm9vZl9oYXNoAAAAAAAQAAAAAQAAAAE=",
        "AAAAAAAAAAAAAAAPZ2V0X3Byb29mX2NvdW50AAAAAAEAAAAAAAAABW93bmVyAAAAAAAAEwAAAAEAAAAE",
        "AAAAAAAAAAAAAAAQZ2V0X3RvdGFsX3Byb29mcwAAAAAAAAABAAAABA==" ]),
      options
    )
  }
  public readonly fromJSON = {
    get_proof: this.txFromJSON<Proof>,
        create_proof: this.txFromJSON<u32>,
        revoke_proof: this.txFromJSON<boolean>,
        verify_proof: this.txFromJSON<boolean>,
        get_proof_count: this.txFromJSON<u32>,
        get_total_proofs: this.txFromJSON<u32>
  }
}