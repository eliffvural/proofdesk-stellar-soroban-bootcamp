/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SOROBAN_RPC_URL?: string;
  readonly VITE_ANALYTICS_ENDPOINT?: string;
  readonly VITE_FEEDBACK_ENDPOINT?: string;
  readonly VITE_MONITORING_ENDPOINT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
