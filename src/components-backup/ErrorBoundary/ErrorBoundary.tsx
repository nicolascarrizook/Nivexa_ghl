import { Button } from "@/components/Button/Button";
import Alert from "@/design-system/components/feedback/Alert";
import { captureError } from "@core/services/SentryService";
import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    // Update state with error info
    this.setState({
      error,
      errorInfo,
    });

    // Send error to Sentry
    captureError(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    });
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    // Optionally reload the page
    window.location.reload();
  };

  private handleReport = () => {
    const { error, errorInfo } = this.state;
    const errorReport = {
      message: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // Copy to clipboard
    navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2));
    alert("Error details copied to clipboard. Please share with support.");
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            <div className="bg-white rounded-lg  p-6 md:p-8">
              <div className="flex items-start mb-6">
                <div className="flex-shrink-0">
                  <svg
                    className="h-12 w-12 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <h1 className="text-2xl font-bold text-gray-900">
                    Oops! Something went wrong
                  </h1>
                  <p className="mt-2 text-gray-600">
                    We encountered an unexpected error. Don't worry, your data
                    is safe.
                  </p>
                </div>
              </div>

              {import.meta.env.DEV && this.state.error && (
                <Alert
                  variant="error"
                  title="Error Details (Development Only)"
                  className="mb-6"
                >
                  <div className="mt-2">
                    <p className="font-mono text-sm text-gray-600">
                      {this.state.error.message}
                    </p>
                    {this.state.error.stack && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-600">
                          Show stack trace
                        </summary>
                        <pre className="mt-2 text-xs overflow-x-auto bg-gray-100 p-2 rounded">
                          {this.state.error.stack}
                        </pre>
                      </details>
                    )}
                  </div>
                </Alert>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={this.handleReset}
                  variant="primary"
                  size="lg"
                  className="flex-1"
                >
                  Try Again
                </Button>
                <Button
                  onClick={() => (window.location.href = "/")}
                  variant="secondary"
                  size="lg"
                  className="flex-1"
                >
                  Go to Home
                </Button>
                {import.meta.env.DEV && (
                  <Button
                    onClick={this.handleReport}
                    variant="outline"
                    size="lg"
                    className="flex-1"
                  >
                    Copy Error Details
                  </Button>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500 text-center">
                  If this problem persists, please contact support at{" "}
                  <a
                    href="mailto:support@nivexa.com"
                    className="text-gray-600 hover:text-gray-600"
                  >
                    support@nivexa.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
