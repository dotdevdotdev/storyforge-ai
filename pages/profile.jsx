import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { PageHeader } from "../components/shared/PageHeader";
import Layout from "../components/layout/Layout";

export default function Profile() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/auth/signin");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <Layout>
        <div className="container">
          <div className="text-center py-8">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <Layout>
      <div className="container">
        <PageHeader
          title="Profile"
          description="Manage your account settings"
        />

        <div className="profile-container">
          <div className="profile-section">
            <h2>Account Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>Name</label>
                <p>{session.user?.name || "Not set"}</p>
              </div>
              <div className="info-item">
                <label>Email</label>
                <p>{session.user?.email}</p>
              </div>
              <div className="info-item">
                <label>User ID</label>
                <p className="text-mono">{session.user?.id}</p>
              </div>
            </div>
          </div>

          <div className="profile-section">
            <h2>Account Stats</h2>
            <p className="text-secondary">
              Feature coming soon: View your story creation statistics
            </p>
          </div>
        </div>

        <style jsx>{`
          .profile-container {
            max-width: 800px;
            margin: 2rem auto;
          }

          .profile-section {
            background: var(--card-bg);
            border-radius: 8px;
            padding: 2rem;
            margin-bottom: 2rem;
            box-shadow: var(--shadow-sm);
          }

          .profile-section h2 {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 1.5rem;
            color: var(--text-primary);
          }

          .info-grid {
            display: grid;
            gap: 1.5rem;
          }

          .info-item {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
          }

          .info-item label {
            font-size: 0.875rem;
            color: var(--text-secondary);
            font-weight: 500;
          }

          .info-item p {
            font-size: 1rem;
            color: var(--text-primary);
          }

          .text-mono {
            font-family: monospace;
            font-size: 0.875rem;
          }

          .text-secondary {
            color: var(--text-secondary);
          }
        `}</style>
      </div>
    </Layout>
  );
}