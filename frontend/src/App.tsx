import {
  Activity,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  Download,
  ExternalLink,
  FileCheck2,
  FileLock2,
  Fingerprint,
  Gauge,
  Globe2,
  KeyRound,
  Layers3,
  Loader2,
  LockKeyhole,
  Mail,
  MessageSquare,
  Network,
  Radar,
  RefreshCw,
  Rocket,
  ScrollText,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Target,
  type LucideIcon,
  UsersRound,
  Wallet,
  XCircle,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import {
  buildFeedbackCsv,
  buildSubmissionSnapshot,
  captureError,
  getAnalyticsEvents,
  getFeedbackItems,
  getMonitoringIssues,
  getWalletInteractions,
  recordWalletInteraction,
  submitFeedback,
  trackEvent,
} from "./lib/productOps";
import type {
  AnalyticsEvent,
  FeedbackItem,
  MonitoringIssue,
  WalletInteraction,
} from "./lib/productOps";

const explorerUrl = `https://stellar.expert/explorer/testnet/contract/${CONTRACT_ID}`;
const labUrl = `https://lab.stellar.org/r/testnet/contract/${CONTRACT_ID}`;
const levelTargetUsers = 50;
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

function getReceiptField(receipt: unknown, key: string) {
  if (!receipt || typeof receipt !== "object" || !(key in receipt)) return "";
  const value = (receipt as Record<string, unknown>)[key];
  return typeof value === "string" ? value : "";
}

function getTransactionHash(receipt: unknown) {
  return (
    getReceiptField(receipt, "hash") ||
    getReceiptField(receipt, "transactionHash") ||
    getReceiptField(receipt, "txHash")
  );
}

function transactionExplorerUrl(hash: string) {
  return hash ? `https://stellar.expert/explorer/testnet/tx/${hash}` : explorerUrl;
}

function downloadJson(filename: string, payload: unknown) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function downloadText(filename: string, payload: string, type: string) {
  const blob = new Blob([payload], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
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
  const [feedbackName, setFeedbackName] = useState("");
  const [feedbackEmail, setFeedbackEmail] = useState("");
  const [feedbackUseCase, setFeedbackUseCase] = useState("Certificate verification");
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackNotes, setFeedbackNotes] = useState("");
  const [opsMessage, setOpsMessage] = useState("Validation dashboard is ready");
  const [analyticsEvents, setAnalyticsEvents] = useState<AnalyticsEvent[]>(() =>
    getAnalyticsEvents(),
  );
  const [walletInteractions, setWalletInteractions] = useState<WalletInteraction[]>(() =>
    getWalletInteractions(),
  );
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>(() =>
    getFeedbackItems(),
  );
  const [monitoringIssues, setMonitoringIssues] = useState<MonitoringIssue[]>(() =>
    getMonitoringIssues(),
  );
  const didTrackLoad = useRef(false);

  const connected = Boolean(address);
  const walletLabel = connected ? shortAddress(address) : "Not connected";
  const client = useMemo(() => createProofDeskClient(address), [address]);
  const selectedHash = verifyHash || proofHash;
  const proofState =
    verified === null ? "Not checked" : verified ? "Valid proof" : "Not valid";
  const canCreate = connected && Boolean(documentText.trim()) && !isBusy;
  const canVerify =
    connected && Boolean(verifyOwner.trim()) && Boolean(verifyHash.trim()) && !isBusy;
  const canRevoke = connected && Boolean(selectedHash) && !isBusy;
  const signedInteractionCount = walletInteractions.filter(
    (item) => item.action !== "verify_proof",
  ).length;
  const uniqueWalletCount = new Set(walletInteractions.map((item) => item.wallet)).size;
  const uniqueSignedWalletCount = new Set(
    walletInteractions
      .filter((item) => item.action !== "verify_proof")
      .map((item) => item.wallet),
  ).size;
  const validationProgress = Math.min(
    100,
    Math.round((uniqueSignedWalletCount / levelTargetUsers) * 100),
  );
  const remainingWallets = Math.max(0, levelTargetUsers - uniqueSignedWalletCount);
  const latestInteraction = walletInteractions[walletInteractions.length - 1];
  const latestFeedback = feedbackItems[feedbackItems.length - 1];
  const averageFeedback =
    feedbackItems.length === 0
      ? "0.0"
      : (
          feedbackItems.reduce((total, item) => total + item.rating, 0) /
          feedbackItems.length
        ).toFixed(1);
  const flowSteps = [
    {
      label: "Wallet",
      value: connected ? "Connected" : "Connect first",
      done: connected,
    },
    {
      label: "Fingerprint",
      value: proofHash ? "Generated" : "Waiting",
      done: Boolean(proofHash),
    },
    {
      label: "Verification",
      value: proofState,
      done: verified === true,
    },
  ];
  const productHighlights: Array<{
    label: string;
    value: string;
    icon: LucideIcon;
  }> = [
    {
      label: "Private",
      value: "Document stays local",
      icon: LockKeyhole,
    },
    {
      label: "On-chain",
      value: "Soroban proof record",
      icon: Network,
    },
    {
      label: "Revocable",
      value: "Owner can disable trust",
      icon: KeyRound,
    },
  ];
  const onboardingTasks = [
    {
      label: "Testnet wallet",
      value: connected ? walletLabel : "Waiting",
      done: connected,
    },
    {
      label: "Fingerprint",
      value: proofHash ? "Ready" : "Pending",
      done: Boolean(proofHash),
    },
    {
      label: "On-chain proof",
      value: signedInteractionCount ? `${signedInteractionCount} signed` : "No signed tx",
      done: signedInteractionCount > 0,
    },
    {
      label: "Feedback",
      value: feedbackItems.length ? `${feedbackItems.length} responses` : "Collect after demo",
      done: feedbackItems.length > 0,
    },
    {
      label: "Level 5 target",
      value: remainingWallets ? `${remainingWallets} wallets remaining` : "50+ users ready",
      done: uniqueSignedWalletCount >= levelTargetUsers,
    },
  ];
  const impactMetrics = [
    {
      label: "Signed wallet target",
      value: `${uniqueSignedWalletCount}/${levelTargetUsers}`,
      detail: `${validationProgress}% Level 5 progress`,
    },
    {
      label: "Evidence events",
      value: analyticsEvents.length,
      detail: "privacy-friendly local analytics",
    },
    {
      label: "Feedback score",
      value: `${averageFeedback}/5`,
      detail: `${feedbackItems.length} tester responses`,
    },
    {
      label: "Contract proofs",
      value: totalProofs,
      detail: "unique Testnet proof records",
    },
  ];
  const useCases: Array<{
    label: string;
    value: string;
    icon: LucideIcon;
  }> = [
    {
      label: "Certificates",
      value: "Verify bootcamp, course, and workshop completion without exposing the certificate file.",
      icon: FileCheck2,
    },
    {
      label: "Agreements",
      value: "Anchor a private agreement fingerprint before sharing the document with another party.",
      icon: ScrollText,
    },
    {
      label: "Invoices",
      value: "Prove a billing document existed at a point in time while keeping commercial details private.",
      icon: BadgeCheck,
    },
    {
      label: "Audit trails",
      value: "Give reviewers a wallet-owned proof record with an explorer link and revocation state.",
      icon: Gauge,
    },
  ];
  const architectureCards: Array<{
    label: string;
    value: string;
    icon: LucideIcon;
  }> = [
    {
      label: "Local document boundary",
      value: "The browser hashes text locally; original content is never uploaded by ProofDesk.",
      icon: LockKeyhole,
    },
    {
      label: "Wallet-owned action",
      value: "Freighter signs create and revoke transactions, so the owner controls trust state.",
      icon: Wallet,
    },
    {
      label: "Soroban state layer",
      value: "The contract stores hash, owner, title, timestamp, active status, and proof counts.",
      icon: Layers3,
    },
  ];
  const roadmapItems = [
    "Shareable verification certificates",
    "Proof history and saved hashes",
    "Batch proof creation for certificate cohorts",
    "Hosted analytics and feedback collection endpoint",
  ];

  const syncOpsState = useCallback(() => {
    setAnalyticsEvents(getAnalyticsEvents());
    setWalletInteractions(getWalletInteractions());
    setFeedbackItems(getFeedbackItems());
    setMonitoringIssues(getMonitoringIssues());
  }, []);

  useEffect(() => {
    if (didTrackLoad.current) return;
    didTrackLoad.current = true;
    trackEvent("app_loaded", { contractId: CONTRACT_ID, network: "testnet" });
    syncOpsState();
  }, [syncOpsState]);

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
      trackEvent("wallet_connected", {
        wallet: walletAddress,
        network,
      });
      syncOpsState();
    } catch (nextError) {
      setError(readError(nextError));
      captureError(nextError, { action: "connect_wallet" });
      syncOpsState();
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
    if (address) setVerifyOwner(address);
    setActiveProof(null);
    setVerified(null);
    setStatus("Document fingerprint generated");
    trackEvent("fingerprint_generated", {
      proofHash: hash,
      characterCount: documentText.length,
    });
    syncOpsState();
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
      const txHash = getTransactionHash(sent);

      setOwnerProofCount(Number(sent.result));
      setVerifyOwner(address);
      setVerifyHash(hash);
      recordWalletInteraction({
        action: "create_proof",
        wallet: address,
        proofHash: hash,
        contractId: CONTRACT_ID,
        network,
        title: title.trim() || "Untitled Proof",
        transactionHash: txHash,
        explorerUrl: transactionExplorerUrl(txHash),
        result: String(sent.result),
      });
      await refreshStats(address);
      await verifyProof(address, hash);
      setStatus("Proof anchored on Stellar Testnet");
      syncOpsState();
    } catch (nextError) {
      setError(readError(nextError));
      setStatus("Proof could not be created");
      captureError(nextError, { action: "create_proof", wallet: address });
      syncOpsState();
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
      recordWalletInteraction({
        action: "verify_proof",
        wallet: owner,
        proofHash: hash,
        contractId: CONTRACT_ID,
        network,
        title: proofTx.result.title,
        result: Boolean(verifyTx.result) ? "valid" : "inactive",
        explorerUrl,
      });
      syncOpsState();
    } catch (nextError) {
      setError(readError(nextError));
      captureError(nextError, { action: "verify_proof", wallet: owner });
      syncOpsState();
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
      const txHash = getTransactionHash(sent);

      setVerified(false);
      await refreshStats(address);
      recordWalletInteraction({
        action: "revoke_proof",
        wallet: address,
        proofHash: selectedHash,
        contractId: CONTRACT_ID,
        network,
        title: activeProof?.title ?? title,
        transactionHash: txHash,
        explorerUrl: transactionExplorerUrl(txHash),
        result: sent.result ? "revoked" : "inactive_or_missing",
      });
      if (sent.result) {
        await verifyProof(address, selectedHash);
        setStatus("Proof revoked");
      } else {
        setStatus("Proof was already inactive or not found");
      }
      syncOpsState();
    } catch (nextError) {
      setError(readError(nextError));
      setStatus("Proof could not be revoked");
      captureError(nextError, { action: "revoke_proof", wallet: address });
      syncOpsState();
    } finally {
      setIsBusy(false);
    }
  }

  async function copy(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setStatus(`${label} copied`);
    } catch {
      setStatus(`${label} is ready to copy`);
    }
  }

  function saveFeedback() {
    if (!feedbackNotes.trim()) {
      setOpsMessage("Add one sentence of user feedback before saving.");
      return;
    }

    submitFeedback({
      wallet: address || verifyOwner || "Wallet not connected",
      name: feedbackName.trim() || "Anonymous tester",
      email: feedbackEmail.trim(),
      useCase: feedbackUseCase.trim() || "Document proof",
      rating: feedbackRating,
      notes: feedbackNotes.trim(),
    });
    setFeedbackNotes("");
    setOpsMessage("Feedback saved for Level 5 validation");
    syncOpsState();
  }

  function exportEvidence() {
    downloadJson("proofdesk-level5-evidence.json", buildSubmissionSnapshot());
    trackEvent("evidence_exported", {
      uniqueWallets: uniqueWalletCount,
      interactionCount: walletInteractions.length,
      feedbackCount: feedbackItems.length,
      level: "level5",
    });
    syncOpsState();
    setOpsMessage("Submission evidence exported");
  }

  function exportFeedbackCsv() {
    downloadText("proofdesk-level5-feedback-export.csv", buildFeedbackCsv(), "text/csv");
    trackEvent("evidence_exported", {
      uniqueWallets: uniqueWalletCount,
      feedbackCount: feedbackItems.length,
      artifact: "feedback_csv",
      level: "level5",
    });
    syncOpsState();
    setOpsMessage("Feedback CSV exported");
  }

  return (
    <main className="shell">
      <section className="topbar">
        <div className="brand">
          <div className="brand-mark">
            <Fingerprint size={25} />
          </div>
          <div>
            <p className="eyebrow">Stellar Testnet</p>
            <strong className="brand-title">ProofDesk</strong>
          </div>
        </div>

        <nav className="top-nav" aria-label="Product sections">
          <a href="#proof-lab">Proof lab</a>
          <a href="#use-cases">Use cases</a>
          <a href="#growth">Level 5</a>
        </nav>

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
          <span className={connected ? "wallet-chip connected" : "wallet-chip"}>
            <Wallet size={16} />
            {connected ? walletLabel : "Testnet ready"}
          </span>
        </div>
      </section>

      {error && <div className="error">{error}</div>}

      <section className="hero-grid">
        <article className="hero-copy">
          <div className="hero-glow" aria-hidden="true" />
          <div className="hero-badge-row">
            <div className="live-pill">
              <span />
              {network}
            </div>
            <div className="launch-pill">
              <Rocket size={15} />
              Level 5 growth ready
            </div>
          </div>
          <h1>Private proof, public verification.</h1>
          <p className="hero-lede">
            A polished Soroban proof workspace for anchoring document fingerprints,
            verifying ownership, and collecting real growth evidence without exposing
            private content.
          </p>

          <div className="hero-actions">
            <button
              className="primary-button"
              onClick={connectWallet}
              disabled={isBusy}
              type="button"
            >
              {isBusy ? <Loader2 className="spin" size={18} /> : <Wallet size={18} />}
              {connected ? walletLabel : "Connect wallet"}
            </button>
            <a className="secondary-link" href={explorerUrl} target="_blank" rel="noreferrer">
              Contract explorer <ExternalLink size={15} />
            </a>
            <a className="ghost-link" href="#growth">
              View Level 5 evidence <ArrowRight size={15} />
            </a>
          </div>

          <div className="hero-proof-line">
            <ShieldCheck size={18} />
            <span>Local SHA-256 hashing · Freighter signatures · Stellar Testnet explorer proof</span>
          </div>

          <div className="feature-grid">
            {productHighlights.map(({ icon: Icon, label, value }) => (
              <div className="feature-tile" key={label}>
                <Icon size={18} />
                <strong>{label}</strong>
                <span>{value}</span>
              </div>
            ))}
          </div>
        </article>

        <article className={verified ? "proof-preview valid" : "proof-preview"}>
          <div className="preview-grid-bg" aria-hidden="true" />
          <div className="preview-top">
            <div>
              <p className="eyebrow">Live proof preview</p>
              <h2>{activeProof?.title ?? title}</h2>
            </div>
            <span className={verified ? "status-badge valid" : "status-badge"}>
              {proofState}
            </span>
          </div>

          <div className="preview-visual">
            <div className="seal-stack">
              <div className="seal-ring">
                {verified ? <ShieldCheck size={42} /> : <FileLock2 size={42} />}
              </div>
              <Sparkles size={18} />
            </div>
            <div className="hash-preview">
              <span>Fingerprint</span>
              <strong>
                {activeProof?.proof_hash && activeProof.proof_hash !== "Not found"
                  ? activeProof.proof_hash
                  : proofHash || "Generate a hash to preview proof evidence."}
              </strong>
            </div>
          </div>

          <div className="ledger-list">
            <div>
              <span>Owner</span>
              <strong>{connected ? walletLabel : "Connect wallet"}</strong>
            </div>
            <div>
              <span>Trust state</span>
              <strong>{proofState}</strong>
            </div>
            <div>
              <span>Last action</span>
              <strong>
                {latestInteraction
                  ? latestInteraction.action.replace("_", " ")
                  : "Waiting for tester"}
              </strong>
            </div>
          </div>

          <div className="metrics-grid">
            <div>
              <span>Your proofs</span>
              <strong>{ownerProofCount}</strong>
            </div>
            <div>
              <span>Total proofs</span>
              <strong>{totalProofs}</strong>
            </div>
            <div>
              <span>Contract</span>
              <strong>{shortAddress(CONTRACT_ID)}</strong>
            </div>
          </div>
        </article>
      </section>

      <section className="signal-strip" aria-label="ProofDesk Level 5 metrics">
        {impactMetrics.map((metric) => (
          <div className="signal-card" key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <small>{metric.detail}</small>
          </div>
        ))}
      </section>

      <section className="flow-panel">
        {flowSteps.map((step, index) => (
          <div className={step.done ? "flow-step done" : "flow-step"} key={step.label}>
            <span>{index + 1}</span>
            <div>
              <strong>{step.label}</strong>
              <small>{step.value}</small>
            </div>
          </div>
        ))}
      </section>

      <section className="section-intro" id="use-cases">
        <div>
          <p className="eyebrow">Built for real proof moments</p>
          <h2>ProofDesk turns private documents into public trust signals.</h2>
        </div>
        <p>
          The product is intentionally simple: create a fingerprint, sign it, verify it,
          and show evidence. That makes it easy for bootcamp reviewers and real testers
          to understand in one session.
        </p>
      </section>

      <section className="use-case-grid">
        {useCases.map(({ icon: Icon, label, value }) => (
          <article className="use-case-card" key={label}>
            <div className="use-case-icon">
              <Icon size={22} />
            </div>
            <h3>{label}</h3>
            <p>{value}</p>
          </article>
        ))}
      </section>

      <section className="section-intro proof-lab-heading" id="proof-lab">
        <div>
          <p className="eyebrow">Interactive proof lab</p>
          <h2>Create, verify, and revoke from one focused workspace.</h2>
        </div>
        <p>
          This is the core product flow testers use before submitting the Google Form:
          one wallet, one signed transaction, one feedback record.
        </p>
      </section>

      <section className="workspace">
        <article className="panel create-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Step 1</p>
              <h3>Create proof</h3>
            </div>
            <BadgeCheck size={20} />
          </div>

          <label>
            Document title
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
              onChange={(event) => {
                setDocumentText(event.target.value);
                setProofHash("");
                setVerified(null);
                setActiveProof(null);
              }}
              placeholder="Paste text or document metadata"
            />
          </label>

          <div className="field-hint">
            Your document stays in your browser. Only the hash goes on-chain.
          </div>

          <button
            className="hash-box"
            onClick={() => proofHash && copy(proofHash, "Proof hash")}
            disabled={!proofHash}
            type="button"
          >
            <span>{proofHash || "Generated fingerprint will appear here"}</span>
            {proofHash && <Copy size={15} />}
          </button>

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
              disabled={!canCreate}
              type="button"
            >
              {isBusy ? <Loader2 className="spin" size={18} /> : <ShieldCheck size={18} />}
              Save proof
            </button>
          </div>
        </article>

        <article className="panel verify-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Step 2</p>
              <h3>Verify proof</h3>
            </div>
            {verified ? <CheckCircle2 size={20} /> : <ShieldAlert size={20} />}
          </div>

          <label>
            <span className="label-row">
              Owner wallet
              <button
                className="tiny-button"
                onClick={() => address && setVerifyOwner(address)}
                disabled={!connected}
                type="button"
              >
                Use my wallet
              </button>
            </span>
            <input
              value={verifyOwner}
              onChange={(event) => setVerifyOwner(event.target.value)}
              placeholder="G..."
            />
          </label>

          <label>
            <span className="label-row">
              Proof fingerprint
              <button
                className="tiny-button"
                onClick={() => proofHash && setVerifyHash(proofHash)}
                disabled={!proofHash}
                type="button"
              >
                Use generated hash
              </button>
            </span>
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
              disabled={!canVerify}
              type="button"
            >
              {verified ? <CheckCircle2 size={18} /> : <Fingerprint size={18} />}
              Verify proof
            </button>
            <button
              className="danger-button"
              onClick={revokeProof}
              disabled={!canRevoke}
              type="button"
            >
              <XCircle size={18} />
              Revoke my proof
            </button>
          </div>

          <div
            className={
              verified ? "proof-result valid" : verified === false ? "proof-result invalid" : "proof-result"
            }
          >
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

      <section className="architecture-section">
        <article className="architecture-copy">
          <p className="eyebrow">Architecture</p>
          <h2>Private by default, verifiable by design.</h2>
          <p>
            ProofDesk keeps sensitive text outside the chain, then uses Stellar Testnet
            as a transparent timestamp and ownership layer. The interface makes that
            privacy boundary visible instead of hiding it in technical jargon.
          </p>
          <div className="contract-ribbon">
            <Globe2 size={18} />
            <span>{shortAddress(CONTRACT_ID)} on Stellar Testnet</span>
          </div>
        </article>

        <div className="architecture-grid">
          {architectureCards.map(({ icon: Icon, label, value }) => (
            <article className="architecture-card" key={label}>
              <Icon size={22} />
              <div>
                <h3>{label}</h3>
                <p>{value}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="roadmap-section">
        <div>
          <p className="eyebrow">Next product bets</p>
          <h2>Level 5 feedback becomes the roadmap.</h2>
        </div>
        <div className="roadmap-list">
          {roadmapItems.map((item, index) => (
            <div className="roadmap-item" key={item}>
              <span>{index + 1}</span>
              <strong>{item}</strong>
            </div>
          ))}
        </div>
      </section>

      <details className="validation-drawer" id="growth" open>
        <summary>
          <span>
            <strong>Level 5 growth validation</strong>
            <small>
              {uniqueSignedWalletCount}/{levelTargetUsers} signed wallets, {feedbackItems.length} feedback responses
            </small>
          </span>
          <ClipboardCheck size={18} />
        </summary>

        <section className="growth-overview">
          <div>
            <Target size={22} />
            <span>Submission target</span>
            <strong>{remainingWallets ? `${remainingWallets} signed wallets left` : "Target reached"}</strong>
          </div>
          <div>
            <Zap size={22} />
            <span>Active usage proof</span>
            <strong>{signedInteractionCount} signed actions captured</strong>
          </div>
          <div>
            <MessageSquare size={22} />
            <span>Feedback loop</span>
            <strong>{feedbackItems.length} responses ready to analyze</strong>
          </div>
        </section>

        <section className="launch-grid">
          <article className="panel onboarding-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Level 5 Growth</p>
                <h3>50-user onboarding</h3>
              </div>
              <ClipboardCheck size={20} />
            </div>

            <div className="validation-progress">
              <div>
                <strong>{uniqueSignedWalletCount}/{levelTargetUsers}</strong>
                <span>real wallets with signed Testnet activity</span>
              </div>
              <div className="progress-meter" aria-label="50 wallet onboarding progress">
                <span style={{ width: `${validationProgress}%` }} />
              </div>
            </div>

            <div className="onboarding-list">
              {onboardingTasks.map((task) => (
                <div className={task.done ? "check-row done" : "check-row"} key={task.label}>
                  {task.done ? <CheckCircle2 size={17} /> : <Radar size={17} />}
                  <div>
                    <strong>{task.label}</strong>
                    <span>{task.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="panel evidence-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Proof Pack</p>
                <h3>Analytics and evidence</h3>
              </div>
              <BarChart3 size={20} />
            </div>

            <div className="ops-stats">
              <div>
                <Activity size={17} />
                <span>Events</span>
                <strong>{analyticsEvents.length}</strong>
              </div>
              <div>
                <UsersRound size={17} />
                <span>Interactions</span>
                <strong>{walletInteractions.length}</strong>
              </div>
              <div>
                <ShieldAlert size={17} />
                <span>Issues</span>
                <strong>{monitoringIssues.length}</strong>
              </div>
            </div>

            <dl className="compact-list">
              <div>
                <dt>Last wallet action</dt>
                <dd>
                  {latestInteraction
                    ? `${latestInteraction.action.replace("_", " ")} / ${shortAddress(
                        latestInteraction.wallet,
                      )}`
                    : "No wallet evidence yet"}
                </dd>
              </div>
              <div>
                <dt>Monitoring status</dt>
                <dd>{monitoringIssues.length ? "Review captured issues" : "No runtime issues"}</dd>
              </div>
              <div>
                <dt>Average feedback</dt>
                <dd>
                  {averageFeedback}/5 from {feedbackItems.length} responses
                </dd>
              </div>
            </dl>

            <button className="secondary-button full-button" onClick={exportEvidence} type="button">
              <Download size={18} />
              Export Level 5 evidence
            </button>
            <button className="secondary-button full-button stacked-button" onClick={exportFeedbackCsv} type="button">
              <Download size={18} />
              Export feedback CSV
            </button>
          </article>

          <article className="panel feedback-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">User Feedback</p>
                <h3>Collect validation</h3>
              </div>
              <MessageSquare size={20} />
            </div>

            <label>
              Tester name
              <input
                value={feedbackName}
                onChange={(event) => setFeedbackName(event.target.value)}
                placeholder="Name or team"
              />
            </label>

            <label>
              Tester email
              <div className="input-with-icon">
                <Mail size={17} />
                <input
                  value={feedbackEmail}
                  onChange={(event) => setFeedbackEmail(event.target.value)}
                  placeholder="name@example.com"
                  type="email"
                />
              </div>
            </label>

            <label>
              Use case
              <input
                value={feedbackUseCase}
                onChange={(event) => setFeedbackUseCase(event.target.value)}
                placeholder="Certificate verification"
              />
            </label>

            <label>
              Rating
              <input
                min="1"
                max="5"
                type="range"
                value={feedbackRating}
                onChange={(event) => setFeedbackRating(Number(event.target.value))}
              />
              <span className="rating-label">{feedbackRating}/5</span>
            </label>

            <label>
              Feedback
              <textarea
                className="feedback-textarea"
                value={feedbackNotes}
                onChange={(event) => setFeedbackNotes(event.target.value)}
                placeholder="What worked, what was confusing, and would you use this again?"
              />
            </label>

            <button className="primary-button full-button" onClick={saveFeedback} type="button">
              <MessageSquare size={18} />
              Save feedback
            </button>

            <div className="ops-message">
              <strong>{latestFeedback ? latestFeedback.name : "Ready"}</strong>
              <span>{latestFeedback ? latestFeedback.notes : opsMessage}</span>
            </div>
          </article>
        </section>
      </details>
    </main>
  );
}
