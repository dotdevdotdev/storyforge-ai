import React from 'react';
import { ErrorBoundary } from './ErrorBoundary';

// Higher-order component for wrapping components with specific error handling
export const withFeatureErrorBoundary = (WrappedComponent, featureName) => {
  return function FeatureErrorBoundary(props) {
    return (
      <ErrorBoundary
        fallback={(error) => (
          <div className="feature-error">
            <h3>{featureName} Error</h3>
            <p>{error?.message || `The ${featureName.toLowerCase()} feature encountered an error`}</p>
            {props.onRetry && (
              <button onClick={props.onRetry} className="retry-button">
                Retry
              </button>
            )}
          </div>
        )}
        context={{ feature: featureName }}
      >
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
};

// Story Generation Error Boundary
export const StoryGenerationBoundary = ({ children }) => (
  <ErrorBoundary
    fallback={(error) => (
      <div className="feature-error">
        <h3>Story Generation Error</h3>
        <p>{error?.message || "Failed to generate story"}</p>
        <button onClick={() => window.location.reload()} className="retry-button">
          Try Again
        </button>
      </div>
    )}
    context={{ feature: 'StoryGeneration' }}
  >
    {children}
  </ErrorBoundary>
);

// Image Processing Error Boundary
export const ImageProcessingBoundary = ({ children, onRetry }) => (
  <ErrorBoundary
    fallback={(error) => (
      <div className="feature-error">
        <h3>Image Processing Error</h3>
        <p>{error?.message || "Failed to process image"}</p>
        {onRetry && (
          <button onClick={onRetry} className="retry-button">
            Try Again
          </button>
        )}
      </div>
    )}
    context={{ feature: 'ImageProcessing' }}
  >
    {children}
  </ErrorBoundary>
);

// API Error Boundary
export const APIBoundary = ({ children, onRetry }) => (
  <ErrorBoundary
    fallback={(error) => (
      <div className="feature-error">
        <h3>API Error</h3>
        <p>{error?.message || "Failed to communicate with the server"}</p>
        {onRetry && (
          <button onClick={onRetry} className="retry-button">
            Retry
          </button>
        )}
      </div>
    )}
    context={{ feature: 'API' }}
  >
    {children}
  </ErrorBoundary>
);

// Data Management Error Boundary
export const DataBoundary = ({ children, onRetry }) => (
  <ErrorBoundary
    fallback={(error) => (
      <div className="feature-error">
        <h3>Data Error</h3>
        <p>{error?.message || "Failed to manage data"}</p>
        {onRetry && (
          <button onClick={onRetry} className="retry-button">
            Retry
          </button>
        )}
      </div>
    )}
    context={{ feature: 'DataManagement' }}
  >
    {children}
  </ErrorBoundary>
);
