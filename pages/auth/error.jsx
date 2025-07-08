import { useRouter } from "next/router";
import Link from "next/link";
import { PageHeader } from "../../components/shared/PageHeader";

export default function AuthError() {
  const router = useRouter();
  const { error } = router.query;

  const errorMessages = {
    Configuration: "There is a problem with the server configuration.",
    AccessDenied: "You do not have permission to sign in.",
    Verification: "The verification token has expired or has already been used.",
    Default: "An error occurred during authentication.",
  };

  const errorMessage = errorMessages[error] || errorMessages.Default;

  return (
    <div className="container">
      <PageHeader
        title="Authentication Error"
        description="Something went wrong"
      />

      <div className="auth-container">
        <div className="error-box">
          <div className="error-icon">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="error-text">{errorMessage}</p>
          <div className="error-actions">
            <Link href="/auth/signin" className="btn btn-primary">
              Try Again
            </Link>
            <Link href="/" className="btn btn-secondary">
              Go Home
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .auth-container {
          max-width: 400px;
          margin: 2rem auto;
        }

        .error-box {
          background: var(--card-bg);
          border-radius: 8px;
          padding: 3rem 2rem;
          box-shadow: var(--shadow-sm);
          text-align: center;
        }

        .error-icon {
          color: var(--error);
          margin-bottom: 1.5rem;
          display: flex;
          justify-content: center;
        }

        .error-text {
          color: var(--text-primary);
          margin-bottom: 2rem;
          font-size: 1.1rem;
        }

        .error-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 4px;
          font-size: 1rem;
          font-weight: 500;
          text-decoration: none;
          display: inline-block;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary {
          background: var(--primary);
          color: white;
        }

        .btn-primary:hover {
          background: var(--primary-dark);
        }

        .btn-secondary {
          background: var(--bg-secondary);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
        }

        .btn-secondary:hover {
          background: var(--bg-tertiary);
        }
      `}</style>
    </div>
  );
}