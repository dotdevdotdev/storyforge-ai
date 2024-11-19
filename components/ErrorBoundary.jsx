import React from 'react';
import { logError } from '../lib/errors/handler';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error
    logError(error, {
      componentStack: errorInfo.componentStack,
      ...this.props.context
    });

    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ? (
        this.props.fallback(this.state.error, this.state.errorInfo)
      ) : (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message || 'An unexpected error occurred'}</p>
          {process.env.NODE_ENV === 'development' && (
            <details style={{ whiteSpace: 'pre-wrap' }}>
              <summary>Error Details</summary>
              <p>{this.state.error?.toString()}</p>
              <p>Component Stack:</p>
              <p>{this.state.errorInfo?.componentStack}</p>
            </details>
          )}
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null, errorInfo: null });
              if (this.props.onReset) {
                this.props.onReset();
              }
            }}
            className="retry-button"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary(WrappedComponent, options = {}) {
  return function WithErrorBoundary(props) {
    return (
      <ErrorBoundary {...options}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
}

// Hook for handling errors in async operations
export function useErrorHandler() {
  const [error, setError] = React.useState(null);

  const handleError = React.useCallback((error) => {
    logError(error);
    setError(error);
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    clearError,
  };
}

// Component for displaying error messages
export function ErrorMessage({ error, onRetry, className = '' }) {
  if (!error) return null;

  return (
    <div className={`error-message ${className}`}>
      <p>{error.message || 'An error occurred'}</p>
      {onRetry && (
        <button onClick={onRetry} className="retry-button">
          Retry
        </button>
      )}
    </div>
  );
}

// Add styles
const styles = `
.error-boundary {
  padding: 20px;
  text-align: center;
  background-color: #fff3f3;
  border: 1px solid #ffcdd2;
  border-radius: 4px;
  margin: 10px 0;
}

.error-message {
  color: #d32f2f;
  padding: 10px;
  margin: 10px 0;
  background-color: #ffebee;
  border-radius: 4px;
}

.retry-button {
  background-color: #2196f3;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
}

.retry-button:hover {
  background-color: #1976d2;
}

details {
  margin-top: 20px;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

details summary {
  cursor: pointer;
  color: #666;
}
`;

// Add styles to document
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
