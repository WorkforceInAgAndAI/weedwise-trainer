import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Root render error caught by ErrorBoundary", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="min-h-screen bg-background text-foreground px-6 py-10">
        <div className="mx-auto flex max-w-3xl flex-col gap-6 rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Application error
            </p>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Something crashed in the UI
            </h1>
            <p className="text-sm leading-6 text-muted-foreground">
              The app hit an uncaught render error. This fallback prevents a blank preview and shows the last captured error.
            </p>
          </div>

          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4">
            <p className="text-sm font-medium text-destructive">
              {this.state.error?.message || "Unknown render error"}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={this.handleReload}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Reload app
            </button>
          </div>

          {this.state.errorInfo?.componentStack && (
            <details className="rounded-xl border border-border bg-secondary/40 p-4 text-sm text-muted-foreground">
              <summary className="cursor-pointer font-medium text-foreground">
                Component stack
              </summary>
              <pre className="mt-3 whitespace-pre-wrap break-words font-mono text-xs text-muted-foreground">
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      </div>
    );
  }
}