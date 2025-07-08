import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";
import { PageHeader } from "../../components/shared/PageHeader";

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = (provider) => {
    setLoading(true);
    signIn(provider, { callbackUrl: "/" });
  };

  return (
    <div className="container">
      <PageHeader
        title="Sign In"
        description="Welcome back to StoryForge AI"
      />

      <div className="auth-container">
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="auth-divider">
          <span>Or continue with</span>
        </div>

        <div className="oauth-buttons">
          <button
            onClick={() => handleOAuthSignIn("google")}
            className="btn btn-oauth"
            disabled={loading}
          >
            <img src="/google-icon.svg" alt="Google" />
            Google
          </button>
          <button
            onClick={() => handleOAuthSignIn("github")}
            className="btn btn-oauth"
            disabled={loading}
          >
            <img src="/github-icon.svg" alt="GitHub" />
            GitHub
          </button>
        </div>

        <p className="auth-link">
          Don't have an account?{" "}
          <Link href="/auth/signup">Sign up</Link>
        </p>
      </div>

      <style jsx>{`
        .auth-container {
          max-width: 400px;
          margin: 2rem auto;
          padding: 2rem;
          background: var(--card-bg);
          border-radius: 8px;
          box-shadow: var(--shadow-sm);
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          font-weight: 500;
          color: var(--text-secondary);
        }

        .form-group input {
          padding: 0.75rem;
          border: 1px solid var(--border-color);
          border-radius: 4px;
          font-size: 1rem;
          transition: border-color 0.2s;
        }

        .form-group input:focus {
          outline: none;
          border-color: var(--primary);
        }

        .form-group input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 4px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-primary {
          background: var(--primary);
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: var(--primary-dark);
        }

        .auth-divider {
          text-align: center;
          margin: 2rem 0;
          position: relative;
        }

        .auth-divider span {
          background: var(--card-bg);
          padding: 0 1rem;
          color: var(--text-secondary);
          position: relative;
          z-index: 1;
        }

        .auth-divider::before {
          content: "";
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: var(--border-color);
        }

        .oauth-buttons {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .btn-oauth {
          background: white;
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
        }

        .btn-oauth:hover:not(:disabled) {
          background: var(--bg-secondary);
        }

        .btn-oauth img {
          width: 20px;
          height: 20px;
        }

        .error-message {
          background: var(--error-bg);
          color: var(--error);
          padding: 0.75rem;
          border-radius: 4px;
          text-align: center;
        }

        .auth-link {
          text-align: center;
          margin-top: 2rem;
          color: var(--text-secondary);
        }

        .auth-link a {
          color: var(--primary);
          text-decoration: none;
          font-weight: 500;
        }

        .auth-link a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}