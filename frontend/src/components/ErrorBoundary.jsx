import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    // You can also log the error to an error reporting service here
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0b0a13] flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-lg w-full space-y-8 text-center">
            <div>
              <h2 className="mt-6 text-3xl font-extrabold text-white">
                Something went wrong
              </h2>
              <p className="mt-2 text-sm text-white/70">
                We're sorry for the inconvenience. Please try refreshing the page or contact support if the problem persists.
              </p>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mt-4">
                  <details className="text-left bg-red-900/20 p-4 rounded-lg">
                    <summary className="text-red-400 cursor-pointer">Error details</summary>
                    <pre className="mt-2 text-xs text-red-300 overflow-auto">
                      {this.state.error.toString()}
                    </pre>
                    {this.state.errorInfo && (
                      <pre className="mt-2 text-xs text-red-300 overflow-auto">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </details>
                </div>
              )}
              <button
                onClick={() => window.location.reload()}
                className="mt-8 btn-neon"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;