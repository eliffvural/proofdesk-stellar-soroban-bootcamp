#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String};

#[contract]
pub struct ProofDeskContract;

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Proof {
    pub title: String,
    pub proof_hash: String,
    pub owner: Address,
    pub created_at: u64,
    pub active: bool,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Proof(Address, String),
    ProofCount(Address),
    TotalProofs,
}

#[contractimpl]
impl ProofDeskContract {
    pub fn create_proof(env: Env, owner: Address, proof_hash: String, title: String) -> u32 {
        owner.require_auth();

        let proof_key = DataKey::Proof(owner.clone(), proof_hash.clone());
        let count_key = DataKey::ProofCount(owner.clone());
        let mut owner_count: u32 = env.storage().persistent().get(&count_key).unwrap_or(0);

        let existing: Option<Proof> = env.storage().persistent().get(&proof_key);
        if existing.is_some() {
            return owner_count;
        }

        let mut total_proofs: u32 = env
            .storage()
            .instance()
            .get(&DataKey::TotalProofs)
            .unwrap_or(0);

        owner_count += 1;
        total_proofs += 1;

        let proof = Proof {
            title,
            proof_hash,
            owner,
            created_at: env.ledger().timestamp(),
            active: true,
        };

        env.storage().persistent().set(&proof_key, &proof);
        env.storage().persistent().set(&count_key, &owner_count);
        env.storage()
            .instance()
            .set(&DataKey::TotalProofs, &total_proofs);

        owner_count
    }

    pub fn verify_proof(env: Env, owner: Address, proof_hash: String) -> bool {
        let proof: Option<Proof> = env
            .storage()
            .persistent()
            .get(&DataKey::Proof(owner, proof_hash));

        proof.map(|item| item.active).unwrap_or(false)
    }

    pub fn get_proof(env: Env, owner: Address, proof_hash: String) -> Proof {
        env.storage()
            .persistent()
            .get(&DataKey::Proof(owner.clone(), proof_hash.clone()))
            .unwrap_or(Proof {
                title: String::from_str(&env, "Not found"),
                proof_hash,
                owner,
                created_at: 0,
                active: false,
            })
    }

    pub fn revoke_proof(env: Env, owner: Address, proof_hash: String) -> bool {
        owner.require_auth();

        let proof_key = DataKey::Proof(owner, proof_hash);
        let proof: Option<Proof> = env.storage().persistent().get(&proof_key);

        match proof {
            Some(mut existing) if existing.active => {
                existing.active = false;
                env.storage().persistent().set(&proof_key, &existing);
                true
            }
            _ => false,
        }
    }

    pub fn get_proof_count(env: Env, owner: Address) -> u32 {
        env.storage()
            .persistent()
            .get(&DataKey::ProofCount(owner))
            .unwrap_or(0)
    }

    pub fn get_total_proofs(env: Env) -> u32 {
        env.storage()
            .instance()
            .get(&DataKey::TotalProofs)
            .unwrap_or(0)
    }
}

mod test;
