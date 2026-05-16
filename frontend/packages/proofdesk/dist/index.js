import { Buffer } from "buffer";
import { Client as ContractClient, Spec as ContractSpec, } from "@stellar/stellar-sdk/contract";
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
};
export class Client extends ContractClient {
    options;
    static async deploy(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options) {
        return ContractClient.deploy(null, options);
    }
    constructor(options) {
        super(new ContractSpec(["AAAAAQAAAAAAAAAAAAAABVByb29mAAAAAAAABQAAAAAAAAAGYWN0aXZlAAAAAAABAAAAAAAAAApjcmVhdGVkX2F0AAAAAAAGAAAAAAAAAAVvd25lcgAAAAAAABMAAAAAAAAACnByb29mX2hhc2gAAAAAABAAAAAAAAAABXRpdGxlAAAAAAAAEA==",
            "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAAAwAAAAEAAAAAAAAABVByb29mAAAAAAAAAgAAABMAAAAQAAAAAQAAAAAAAAAKUHJvb2ZDb3VudAAAAAAAAQAAABMAAAAAAAAAAAAAAAtUb3RhbFByb29mcwA=",
            "AAAAAAAAAAAAAAAJZ2V0X3Byb29mAAAAAAAAAgAAAAAAAAAFb3duZXIAAAAAAAATAAAAAAAAAApwcm9vZl9oYXNoAAAAAAAQAAAAAQAAB9AAAAAFUHJvb2YAAAA=",
            "AAAAAAAAAAAAAAAMY3JlYXRlX3Byb29mAAAAAwAAAAAAAAAFb3duZXIAAAAAAAATAAAAAAAAAApwcm9vZl9oYXNoAAAAAAAQAAAAAAAAAAV0aXRsZQAAAAAAABAAAAABAAAABA==",
            "AAAAAAAAAAAAAAAMcmV2b2tlX3Byb29mAAAAAgAAAAAAAAAFb3duZXIAAAAAAAATAAAAAAAAAApwcm9vZl9oYXNoAAAAAAAQAAAAAQAAAAE=",
            "AAAAAAAAAAAAAAAMdmVyaWZ5X3Byb29mAAAAAgAAAAAAAAAFb3duZXIAAAAAAAATAAAAAAAAAApwcm9vZl9oYXNoAAAAAAAQAAAAAQAAAAE=",
            "AAAAAAAAAAAAAAAPZ2V0X3Byb29mX2NvdW50AAAAAAEAAAAAAAAABW93bmVyAAAAAAAAEwAAAAEAAAAE",
            "AAAAAAAAAAAAAAAQZ2V0X3RvdGFsX3Byb29mcwAAAAAAAAABAAAABA=="]), options);
        this.options = options;
    }
    fromJSON = {
        get_proof: (this.txFromJSON),
        create_proof: (this.txFromJSON),
        revoke_proof: (this.txFromJSON),
        verify_proof: (this.txFromJSON),
        get_proof_count: (this.txFromJSON),
        get_total_proofs: (this.txFromJSON)
    };
}
