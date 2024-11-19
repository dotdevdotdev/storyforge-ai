import "../styles/globals.css";
import { ErrorBoundary } from "../components/ErrorBoundary";

function MyApp({ Component, pageProps }) {
  return (
    <ErrorBoundary
      fallback={(error) => (
        <div className="app-error">
          <h1>Something went wrong</h1>
          <p>{error?.message || "An unexpected error occurred"}</p>
          <button
            onClick={() => window.location.reload()}
            className="retry-button"
          >
            Reload Application
          </button>
        </div>
      )}
    >
      <Component {...pageProps} />
    </ErrorBoundary>
  );
}

export default MyApp;
