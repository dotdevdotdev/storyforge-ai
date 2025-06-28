import "../styles/globals.css";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { Button, Card } from "../components/ui";

function MyApp({ Component, pageProps }) {
  return (
    <ErrorBoundary
      fallback={(error) => (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 18.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h1>
              <p className="text-gray-600 mb-6">
                {error?.message || "An unexpected error occurred. Please try refreshing the page."}
              </p>
            </div>
            <Button
              onClick={() => window.location.reload()}
              variant="primary"
              className="w-full"
            >
              Reload Application
            </Button>
          </Card>
        </div>
      )}
    >
      <Component {...pageProps} />
    </ErrorBoundary>
  );
}

export default MyApp;
