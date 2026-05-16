#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, Env, String};

#[test]
fn test_proof_lifecycle() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(ProofDeskContract, ());
    let client = ProofDeskContractClient::new(&env, &contract_id);

    let owner = Address::generate(&env);
    let other_owner = Address::generate(&env);
    let hash = String::from_str(&env, "doc:stellar-bootcamp:v1");
    let title = String::from_str(&env, "Bootcamp Certificate");
    let other_hash = String::from_str(&env, "doc:invoice:v1");

    assert_eq!(client.get_proof_count(&owner), 0);
    assert_eq!(client.get_total_proofs(), 0);
    assert!(!client.verify_proof(&owner, &hash));

    let missing = client.get_proof(&owner, &hash);
    assert_eq!(missing.title, String::from_str(&env, "Not found"));
    assert!(!missing.active);

    assert_eq!(client.create_proof(&owner, &hash, &title), 1);
    assert!(client.verify_proof(&owner, &hash));
    assert_eq!(client.get_proof_count(&owner), 1);
    assert_eq!(client.get_total_proofs(), 1);

    let proof = client.get_proof(&owner, &hash);
    assert_eq!(proof.title, title);
    assert_eq!(proof.proof_hash, hash);
    assert_eq!(proof.owner, owner);
    assert!(proof.active);

    assert_eq!(
        client.create_proof(
            &owner,
            &String::from_str(&env, "doc:stellar-bootcamp:v1"),
            &String::from_str(&env, "Duplicate")
        ),
        1
    );
    assert_eq!(client.get_total_proofs(), 1);

    assert_eq!(
        client.create_proof(
            &other_owner,
            &other_hash,
            &String::from_str(&env, "Invoice Proof")
        ),
        1
    );
    assert_eq!(client.get_total_proofs(), 2);

    assert!(client.revoke_proof(&owner, &String::from_str(&env, "doc:stellar-bootcamp:v1")));
    assert!(!client.verify_proof(&owner, &String::from_str(&env, "doc:stellar-bootcamp:v1")));
    assert!(!client.revoke_proof(&owner, &String::from_str(&env, "doc:stellar-bootcamp:v1")));
    assert_eq!(client.get_proof_count(&owner), 1);
    assert_eq!(client.get_total_proofs(), 2);
}
