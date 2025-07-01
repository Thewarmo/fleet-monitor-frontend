'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { HiUser, HiLockClosed } from 'react-icons/hi';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const success = await login(username, password);
    if (success) {
      router.push('/dashboard');
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-fade-in">
        <h2 className="text-3xl font-extrabold mb-8 text-center text-gray-800 tracking-tight drop-shadow-sm">Bienvenido</h2>
        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded mb-4 text-center animate-shake">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-gray-700 text-sm font-semibold mb-2">
              Usuario
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <HiUser className="w-5 h-5" />
              </span>
              <input
                type="text"
                id="username"
                className="pl-10 pr-3 py-2 w-full rounded-lg border border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none transition-all duration-200 shadow-sm text-gray-700 bg-white/80 placeholder-gray-400"
                placeholder="Tu usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>
          </div>
          <div>
            <label htmlFor="password" className="block text-gray-700 text-sm font-semibold mb-2">
              Contraseña
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <HiLockClosed className="w-5 h-5" />
              </span>
              <input
                type="password"
                id="password"
                className="pl-10 pr-3 py-2 w-full rounded-lg border border-gray-300 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none transition-all duration-200 shadow-sm text-gray-700 bg-white/80 placeholder-gray-400"
                placeholder="Tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-500 to-pink-500 text-white font-bold text-lg shadow-lg hover:scale-105 hover:from-pink-500 hover:to-blue-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            Iniciar sesión
          </button>
        </form>
      </div>
    </div>
  );
}
