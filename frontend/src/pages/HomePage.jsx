import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Hello, {user?.username} 👋
            </h1>
            <p className="text-gray-500 text-sm mt-1">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Sign out
          </button>
        </div>

        {/* তোমার actual page content এখানে বসাও */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <p className="text-gray-400 text-sm text-center">
            Your app starts here. Replace this with your content.
          </p>
        </div>
      </div>
    </div>
  );
}
