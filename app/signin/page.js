'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      router.push('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex flex-col">
      <header className="sticky top-0 z-10 bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-3">
            <Image src="/Logo.png" alt="Vape Vault Logo" width={60} height={60} />
            <h1 className="text-2xl font-bold text-yellow-300">Vape Vault</h1>
          </Link>
          <nav className="flex items-center space-x-6 text-sm md:text-base">
            <Link href="/signin" className="text-yellow-400 hover:underline">Sign In</Link>
            <Link href="/signup" className="text-yellow-400 hover:underline">Sign Up</Link>
            <Link href="/products" className="hover:text-yellow-400">Products</Link>
            <Link href="/about" className="hover:text-yellow-400">About</Link>
            <Link href="/contact" className="hover:text-yellow-400">Contact</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-center text-yellow-300 mb-6">Sign in to your account</h2>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-sm mb-1">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-md bg-white/10 border border-white/30 placeholder-white/60 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm mb-1">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-md bg-white/10 border border-white/30 placeholder-white/60 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="form-checkbox text-yellow-400" />
                <span>Remember me</span>
              </label>
              <a href="/forgot-password" className="text-yellow-400 hover:underline">Forgot your password?</a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 rounded-lg font-semibold text-black bg-yellow-300 hover:bg-yellow-400 transition ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-white/70">
            Don't have an account?{' '}
            <a href="/signup" className="text-yellow-400 hover:underline font-medium">Sign up</a>
          </div>
        </div>
      </main>
    </div>
  );
}
