type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export type AnalyticsEventName =
  | "app_loaded"
  | "wallet_connected"
  | "fingerprint_generated"
  | "proof_created"
  | "proof_verified"
  | "proof_revoked"
  | "feedback_submitted"
  | "evidence_exported"
  | "error_captured";

export interface AnalyticsEvent {
  id: string;
  name: AnalyticsEventName;
  occurredAt: string;
  sessionId: string;
  properties: Record<string, JsonValue>;
}

export interface WalletInteraction {
  id: string;
  action: "create_proof" | "verify_proof" | "revoke_proof";
  wallet: string;
  proofHash: string;
  contractId: string;
  network: string;
  title?: string;
  transactionHash?: string;
  explorerUrl?: string;
  result?: string;
  occurredAt: string;
}

export interface FeedbackItem {
  id: string;
  wallet: string;
  name: string;
  useCase: string;
  rating: number;
  notes: string;
  occurredAt: string;
}

export interface MonitoringIssue {
  id: string;
  message: string;
  stack?: string;
  context: Record<string, JsonValue>;
  occurredAt: string;
  url: string;
}

const ANALYTICS_KEY = "proofdesk.analytics.v1";
const FEEDBACK_KEY = "proofdesk.feedback.v1";
const INTERACTIONS_KEY = "proofdesk.wallet-interactions.v1";
const MONITORING_KEY = "proofdesk.monitoring.v1";
const SESSION_KEY = "proofdesk.session.v1";
const MAX_LOG_ITEMS = 250;

function getEndpoint(name: string) {
  const env = import.meta.env as unknown as Record<string, string | undefined>;
  return env[name]?.trim();
}

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readCollection<T>(key: string): T[] {
  if (typeof localStorage === "undefined") return [];

  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function writeCollection<T>(key: string, values: T[]) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(key, JSON.stringify(values.slice(-MAX_LOG_ITEMS)));
}

function appendCollection<T>(key: string, value: T) {
  const values = [...readCollection<T>(key), value];
  writeCollection(key, values);
  return value;
}

function getSessionId() {
  if (typeof sessionStorage === "undefined") return "server-session";

  const existing = sessionStorage.getItem(SESSION_KEY);
  if (existing) return existing;

  const next = createId();
  sessionStorage.setItem(SESSION_KEY, next);
  return next;
}

async function sendToEndpoint(endpoint: string | undefined, payload: unknown) {
  if (!endpoint || typeof window === "undefined") return;

  const body = JSON.stringify(payload);
  const blob = new Blob([body], { type: "application/json" });

  if ("sendBeacon" in navigator && navigator.sendBeacon(endpoint, blob)) {
    return;
  }

  await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  });
}

export function getAnalyticsEvents() {
  return readCollection<AnalyticsEvent>(ANALYTICS_KEY);
}

export function getFeedbackItems() {
  return readCollection<FeedbackItem>(FEEDBACK_KEY);
}

export function getWalletInteractions() {
  return readCollection<WalletInteraction>(INTERACTIONS_KEY);
}

export function getMonitoringIssues() {
  return readCollection<MonitoringIssue>(MONITORING_KEY);
}

export function trackEvent(
  name: AnalyticsEventName,
  properties: Record<string, JsonValue> = {},
) {
  const event = appendCollection<AnalyticsEvent>(ANALYTICS_KEY, {
    id: createId(),
    name,
    occurredAt: new Date().toISOString(),
    sessionId: getSessionId(),
    properties,
  });

  void sendToEndpoint(getEndpoint("VITE_ANALYTICS_ENDPOINT"), event).catch(() => undefined);
  return event;
}

export function recordWalletInteraction(
  input: Omit<WalletInteraction, "id" | "occurredAt">,
) {
  const interaction = appendCollection<WalletInteraction>(INTERACTIONS_KEY, {
    id: createId(),
    occurredAt: new Date().toISOString(),
    ...input,
  });

  trackEvent(
    input.action === "create_proof"
      ? "proof_created"
      : input.action === "revoke_proof"
        ? "proof_revoked"
        : "proof_verified",
    {
      wallet: input.wallet,
      proofHash: input.proofHash,
      contractId: input.contractId,
      network: input.network,
      hasTransactionHash: Boolean(input.transactionHash),
    },
  );

  return interaction;
}

export function submitFeedback(input: Omit<FeedbackItem, "id" | "occurredAt">) {
  const feedback = appendCollection<FeedbackItem>(FEEDBACK_KEY, {
    id: createId(),
    occurredAt: new Date().toISOString(),
    ...input,
  });

  trackEvent("feedback_submitted", {
    wallet: input.wallet,
    rating: input.rating,
    useCase: input.useCase,
  });
  void sendToEndpoint(getEndpoint("VITE_FEEDBACK_ENDPOINT"), feedback).catch(() => undefined);

  return feedback;
}

export function captureError(error: unknown, context: Record<string, JsonValue> = {}) {
  const issue = appendCollection<MonitoringIssue>(MONITORING_KEY, {
    id: createId(),
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    context,
    occurredAt: new Date().toISOString(),
    url: typeof window === "undefined" ? "server" : window.location.href,
  });

  trackEvent("error_captured", { message: issue.message, ...context });
  void sendToEndpoint(getEndpoint("VITE_MONITORING_ENDPOINT"), issue).catch(() => undefined);

  return issue;
}

export function buildSubmissionSnapshot() {
  const feedback = getFeedbackItems();
  const interactions = getWalletInteractions();
  const analytics = getAnalyticsEvents();
  const monitoring = getMonitoringIssues();
  const uniqueWallets = new Set(interactions.map((item) => item.wallet)).size;
  const averageRating =
    feedback.length === 0
      ? 0
      : feedback.reduce((total, item) => total + item.rating, 0) / feedback.length;

  return {
    generatedAt: new Date().toISOString(),
    uniqueWallets,
    interactionCount: interactions.length,
    feedbackCount: feedback.length,
    averageRating: Number(averageRating.toFixed(2)),
    analyticsEventCount: analytics.length,
    monitoringIssueCount: monitoring.length,
    interactions,
    feedback,
    analytics,
    monitoring,
  };
}
