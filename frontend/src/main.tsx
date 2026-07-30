import React, { Component, type ErrorInfo, type ReactNode } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { captureError } from "./lib/productOps";
import "./styles.css";

class RootErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    captureError(error, { componentStack: info.componentStack ?? "" });
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="shell">
          <section className="error-page">
            <p className="eyebrow">Monitoring event captured</p>
            <h1>ProofDesk needs a refresh</h1>
            <p>
              The app recorded the issue locally. Refresh the page and try the
              wallet action again.
            </p>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}

window.addEventListener("error", (event) => {
  captureError(event.error ?? event.message, { source: "window.error" });
});

window.addEventListener("unhandledrejection", (event) => {
  captureError(event.reason, { source: "unhandledrejection" });
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  </React.StrictMode>,
);
