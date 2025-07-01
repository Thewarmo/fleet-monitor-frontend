'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Or a loading spinner, as the redirect will happen soon
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-600 p-4 text-white flex justify-between items-center">
        <h1 className="text-xl font-bold">Fleet Monitor Dashboard</h1>
        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Logout
        </button>
      </nav>
      <main className="p-4">
        {children}
      </main>
    </div>
  );
}
