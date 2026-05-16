import {
  BadgeCheck,
  CheckCircle2,
  Copy,
  ExternalLink,
  FileLock2,
  Fingerprint,
  Loader2,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Wallet,
  XCircle,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import {
  getAddress,
  getNetworkDetails,
  isConnected,
  requestAccess,
} from "@stellar/freighter-api";
import {
  CONTRACT_ID,
  createProofDeskClient,
  NETWORK_PASSPHRASE,
} from "./lib/proofdesk";
import type { Proof } from "./lib/proofdesk";

const explorerUrl = `https://stellar.expert/explorer/testnet/contract/${CONTRACT_ID}`;
const labUrl = `https://lab.stellar.org/r/testnet/contract/${CONTRACT_ID}`;
const sampleText =
  "ProofDesk sample document\nOwner: Stellar Bootcamp\nPurpose: On-chain proof demo";

function shortAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-6)}`;
}

function readError(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Unexpected error.";
}

function isAccountMissing(error: unknown) {
  return readError(error).toLowerCase().includes("account not found");
}

async function fundTestnetAccount(publicKey: string) {
  const response = await fetch(`https://friendbot.stellar.org?addr=${publicKey}`);
  if (!response.ok) {
    throw new Error("Testnet funding failed. Please try Friendbot manually.");
  }
}

async function sha256(value: string) {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function formatDate(timestamp: number | bigint) {
  const seconds = Number(timestamp);
  if (!seconds) return "-";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(seconds * 1000));
}

export default function App() {
  const [address, setAddress] = useState("");
  const [network, setNetwork] = useState("TESTNET");
  const [title, setTitle] = useState("Bootcamp Certificate");
  const [documentText, setDocumentText] = useState(sampleText);
  const [proofHash, setProofHash] = useState("");
  const [verifyOwner, setVerifyOwner] = useState("");
  const [verifyHash, setVerifyHash] = useState("");
  const [ownerProofCount, setOwnerProofCount] = useState(0);
  const [totalProofs, setTotalProofs] = useState(0);
  const [activeProof, setActiveProof] = useState<Proof | null>(null);
  const [verified, setVerified] = useState<boolean | null>(null);
  const [status, setStatus] = useState("Connect Freighter to create proofs");
  const [error, setError] = useState("");
  const [isBusy, setIsBusy] = useState(false);

  const connected = Boolean(address);
  const walletLabel = connected ? shortAddress(address) : "Not connected";
  const client = useMemo(() => createProofDeskClient(address), [address]);
  const selectedHash = verifyHash || proofHash;
  const proofState = verified === null ? "Ready" : verified ? "Valid" : "Invalid";

  const refreshStats = useCallback(
    async (walletAddress = address) => {
      const networkDetails = await getNetworkDetails();
      if ("error" in networkDetails && networkDetails.error) {
        throw new Error(String(networkDetails.error));
      }
      if (networkDetails.networkPassphrase !== NETWORK_PASSPHRASE) {
        throw new Error("Please switch Freighter to Testnet and connect again.");
      }

      setNetwork(networkDetails.network ?? "TESTNET");

      const readClient = createProofDeskClient(walletAddress);
      const totalTx = await readClient.get_total_proofs();
      setTotalProofs(Number(totalTx.result));

      if (walletAddress) {
        const countTx = await readClient.get_proof_count({ owner: walletAddress });
        setOwnerProofCount(Number(countTx.result));
      }
    },
    [address],
  );

  async function connectWallet() {
    setIsBusy(true);
    setError("");

    try {
      const freighter = await isConnected();
      if ("error" in freighter && freighter.error) {
        throw new Error(String(freighter.error));
      }
      if (!freighter.isConnected) {
        throw new Error("Freighter extension was not found.");
      }

      const access = await requestAccess();
      if ("error" in access && access.error) {
        throw new Error(String(access.error));
      }

      const walletAddress = access.address || (await getAddress()).address;
      if (!walletAddress) {
        throw new Error("Wallet access was not granted.");
      }

      setAddress(walletAddress);
      setVerifyOwner(walletAddress);

      try {
        await refreshStats(walletAddress);
      } catch (refreshError) {
        if (!isAccountMissing(refreshError)) throw refreshError;

        setStatus("Funding Testnet wallet");
        await fundTestnetAccount(walletAddress);
        await refreshStats(walletAddress);
      }

      setStatus("Wallet connected");
    } catch (nextError) {
      setError(readError(nextError));
    } finally {
      setIsBusy(false);
    }
  }

  async function generateHash() {
    if (!documentText.trim()) {
      setError("Add document text before generating a hash.");
      return "";
    }

    const hash = `sha256:${await sha256(documentText)}`;
    setProofHash(hash);
    setVerifyHash(hash);
    setStatus("Document fingerprint generated");
    return hash;
  }

  async function createProof() {
    if (!address) return;

    setIsBusy(true);
    setError("");
    setStatus("Preparing document fingerprint");

    try {
      const hash = proofHash || (await generateHash());
      if (!hash) return;

      const tx = await client.create_proof({
        owner: address,
        proof_hash: hash,
        title: title.trim() || "Untitled Proof",
      });
      const sent = await tx.signAndSend();

      setOwnerProofCount(Number(sent.result));
      setVerifyOwner(address);
      setVerifyHash(hash);
      await refreshStats(address);
      await verifyProof(address, hash);
      setStatus("Proof anchored on Stellar Testnet");
    } catch (nextError) {
      setError(readError(nextError));
      setStatus("Proof could not be created");
    } finally {
      setIsBusy(false);
    }
  }

  async function verifyProof(owner = verifyOwner, hash = verifyHash) {
    if (!owner || !hash) {
      setError("Enter owner address and proof hash to verify.");
      return;
    }

    setIsBusy(true);
    setError("");
    try {
      await refreshStats(address);
      const readClient = createProofDeskClient(address || owner);
      const [verifyTx, proofTx] = await Promise.all([
        readClient.verify_proof({ owner, proof_hash: hash }),
        readClient.get_proof({ owner, proof_hash: hash }),
      ]);

      setVerified(Boolean(verifyTx.result));
      setActiveProof(proofTx.result);
      setStatus(Boolean(verifyTx.result) ? "Proof verified" : "Proof not active");
    } catch (nextError) {
      setError(readError(nextError));
    } finally {
      setIsBusy(false);
    }
  }

  async function revokeProof() {
    if (!address || !selectedHash) return;

    setIsBusy(true);
    setError("");
    setStatus("Waiting for revoke signature");

    try {
      const tx = await client.revoke_proof({
        owner: address,
        proof_hash: selectedHash,
      });
      const sent = await tx.signAndSend();

      setVerified(false);
      await refreshStats(address);
      if (sent.result) {
        await verifyProof(address, selectedHash);
        setStatus("Proof revoked");
      } else {
        setStatus("Proof was already inactive or not found");
      }
    } catch (nextError) {
      setError(readError(nextError));
      setStatus("Proof could not be revoked");
    } finally {
      setIsBusy(false);
    }
  }

  async function copy(value: string, label: string) {
    await navigator.clipboard.writeText(value);
    setStatus(`${label} copied`);
  }

  return (
    <main className="shell">
      <section className="topbar">
        <div className="brand">
          <div className="brand-mark">
            <Fingerprint size={25} />
          </div>
          <div>
            <p className="eyebrow">Stellar Soroban Verification Suite</p>
            <h1>ProofDesk</h1>
          </div>
        </div>

        <div className="actions">
          {connected && (
            <button
              className="icon-button"
              onClick={() => refreshStats(address)}
              disabled={isBusy}
              title="Refresh"
              type="button"
            >
              <RefreshCw size={18} />
            </button>
          )}
          <button
            className="primary-button"
            onClick={connectWallet}
            disabled={isBusy}
            type="button"
          >
            {isBusy ? <Loader2 className="spin" size={18} /> : <Wallet size={18} />}
            {connected ? walletLabel : "Connect Freighter"}
          </button>
        </div>
      </section>

      {error && <div className="error">{error}</div>}

      <section className="overview">
        <article className="certificate">
          <div className="certificate-top">
            <span>{network}</span>
            <span>{proofState}</span>
          </div>
          <div className={verified ? "seal valid" : "seal"}>
            {verified ? <ShieldCheck size={42} /> : <FileLock2 size={42} />}
          </div>
          <p className="eyebrow">Verification Certificate</p>
          <h2>{activeProof?.title ?? title}</h2>
          <p>
            {activeProof?.proof_hash && activeProof.proof_hash !== "Not found"
              ? activeProof.proof_hash
              : proofHash || "Generate or enter a document fingerprint."}
          </p>
        </article>

        <aside className="metrics">
          <div>
            <span>Your Proofs</span>
            <strong>{ownerProofCount}</strong>
          </div>
          <div>
            <span>Total Proofs</span>
            <strong>{totalProofs}</strong>
          </div>
          <div>
            <span>Contract</span>
            <strong>{shortAddress(CONTRACT_ID)}</strong>
          </div>
        </aside>
      </section>

      <section className="workspace">
        <article className="panel create-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Create Proof</p>
              <h3>Anchor a private document fingerprint</h3>
            </div>
            <BadgeCheck size={20} />
          </div>

          <label>
            Proof title
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Board Resolution"
            />
          </label>

          <label>
            Document text
            <textarea
              value={documentText}
              onChange={(event) => setDocumentText(event.target.value)}
              placeholder="Paste document text or metadata. Only the hash is stored."
            />
          </label>

          <div className="button-row">
            <button
              className="secondary-button"
              onClick={generateHash}
              disabled={isBusy}
              type="button"
            >
              <Fingerprint size={18} />
              Generate hash
            </button>
            <button
              className="primary-button"
              onClick={createProof}
              disabled={!connected || isBusy}
              type="button"
            >
              {isBusy ? <Loader2 className="spin" size={18} /> : <ShieldCheck size={18} />}
              Create proof
            </button>
          </div>

          <button
            className="hash-box"
            onClick={() => proofHash && copy(proofHash, "Proof hash")}
            disabled={!proofHash}
            type="button"
          >
            <span>{proofHash || "No hash generated yet"}</span>
            {proofHash && <Copy size={15} />}
          </button>
        </article>

        <article className="panel verify-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Verify Proof</p>
              <h3>Check authenticity and revoke status</h3>
            </div>
            {verified ? <CheckCircle2 size={20} /> : <ShieldAlert size={20} />}
          </div>

          <label>
            Owner wallet
            <input
              value={verifyOwner}
              onChange={(event) => setVerifyOwner(event.target.value)}
              placeholder="G..."
            />
          </label>

          <label>
            Proof hash
            <input
              value={verifyHash}
              onChange={(event) => setVerifyHash(event.target.value)}
              placeholder="sha256:..."
            />
          </label>

          <div className="button-row">
            <button
              className="secondary-button"
              onClick={() => verifyProof()}
              disabled={!connected || isBusy}
              type="button"
            >
              {verified ? <CheckCircle2 size={18} /> : <Fingerprint size={18} />}
              Verify
            </button>
            <button
              className="danger-button"
              onClick={revokeProof}
              disabled={!connected || isBusy || !selectedHash}
              type="button"
            >
              <XCircle size={18} />
              Revoke
            </button>
          </div>

          <div className={verified ? "proof-result valid" : "proof-result"}>
            <strong>{proofState}</strong>
            <span>
              {activeProof
                ? `${activeProof.title} / ${formatDate(activeProof.created_at)}`
                : status}
            </span>
          </div>

          <dl>
            <div>
              <dt>Contract ID</dt>
              <dd>{CONTRACT_ID}</dd>
            </div>
            <div>
              <dt>Network Passphrase</dt>
              <dd>{NETWORK_PASSPHRASE}</dd>
            </div>
          </dl>

          <div className="links">
            <a href={explorerUrl} target="_blank" rel="noreferrer">
              Explorer <ExternalLink size={14} />
            </a>
            <a href={labUrl} target="_blank" rel="noreferrer">
              Stellar Lab <ExternalLink size={14} />
            </a>
          </div>
        </article>
      </section>
    </main>
  );
}
