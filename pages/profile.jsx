import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { PageHeader } from "../components/shared/PageHeader";
import Navigation from "../components/Navigation";

export default function Profile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/auth/signin");
    }
  }, [session, status, router]);

  useEffect(() => {
    if (session) {
      fetchUserStats();
    }
  }, [session]);

  const fetchUserStats = async () => {
    try {
      const response = await fetch('/api/user/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="text-center py-8">Loading...</div>
          </div>
        </div>
      </>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <PageHeader
            title="Profile"
            description="Manage your account settings"
          />

          <div className="grid gap-6">
            {/* Account Information Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-6">Account Information</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Name</label>
                    <p className="mt-1 text-lg">{session.user?.name || "Not set"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="mt-1 text-lg">{session.user?.email}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">User ID</label>
                  <p className="mt-1 text-sm font-mono text-gray-600 break-all">{session.user?.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Member Since</label>
                  <p className="mt-1 text-lg">Just now</p>
                </div>
              </div>
            </div>

            {/* Account Stats Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-6">Your Activity</h2>
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading statistics...</div>
              ) : stats ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-3xl font-bold text-blue-600">{stats.stories || 0}</div>
                      <div className="text-sm text-gray-500 mt-1">Stories Created</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-3xl font-bold text-green-600">{stats.characters || 0}</div>
                      <div className="text-sm text-gray-500 mt-1">Characters</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-3xl font-bold text-purple-600">{stats.story_parameters || 0}</div>
                      <div className="text-sm text-gray-500 mt-1">Story Parameters</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-3xl font-bold text-orange-600">{stats.themes || 0}</div>
                      <div className="text-sm text-gray-500 mt-1">Themes</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-3xl font-bold text-indigo-600">{stats.archetypes || 0}</div>
                      <div className="text-sm text-gray-500 mt-1">Archetypes</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-3xl font-bold text-pink-600">{stats.locations || 0}</div>
                      <div className="text-sm text-gray-500 mt-1">Locations</div>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-500 text-center">
                  Failed to load statistics
                </p>
              )}
            </div>

            {/* Quick Actions Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => router.push('/stories')}
                  className="p-4 text-left border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <h3 className="font-medium">Create a Story</h3>
                  <p className="text-sm text-gray-500 mt-1">Start crafting your next adventure</p>
                </button>
                <button
                  onClick={() => router.push('/characters')}
                  className="p-4 text-left border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
                >
                  <h3 className="font-medium">Manage Characters</h3>
                  <p className="text-sm text-gray-500 mt-1">Create and edit your characters</p>
                </button>
                <button
                  onClick={() => router.push('/story-parameters')}
                  className="p-4 text-left border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
                >
                  <h3 className="font-medium">Story Parameters</h3>
                  <p className="text-sm text-gray-500 mt-1">Customize your story settings</p>
                </button>
                <button
                  onClick={() => router.push('/themes')}
                  className="p-4 text-left border border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors"
                >
                  <h3 className="font-medium">Browse Themes</h3>
                  <p className="text-sm text-gray-500 mt-1">Explore story themes and ideas</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}