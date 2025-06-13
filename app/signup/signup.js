'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'password') calculatePasswordStrength(value);
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    setPasswordStrength(strength);
  };

  const validateForm = () => {
    if (!formData.name.trim()) return setError('Please enter your full name'), false;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return setError('Please enter a valid email address'), false;
    if (formData.password.length < 8) return setError('Password must be at least 8 characters'), false;
    if (passwordStrength < 3) return setError('Password is too weak. Include uppercase, numbers, and symbols'), false;
    if (formData.password !== formData.confirmPassword) return setError('Passwords do not match'), false;
    setError(null);
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: { full_name: formData.name },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      if (data.user?.identities?.length === 0) throw new Error('This email is already registered');
      router.push('/signin?signup=success');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex flex-col">
      <header className="flex justify-center items-center px-6 py-4 border-b border-white/10 bg-white/10 backdrop-blur-md">
        <Link href="/" className="flex items-center space-x-3">
          <img src="/Logo.png" alt="Vape Vault Logo" className="w-20 h-20" />
          <h1 className="text-3xl font-bold text-yellow-300">Vape Vault</h1>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-center text-yellow-300 mb-6">Create an Account</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-white mb-1">Full Name <span className="text-red-500">*</span></label>
              <input id="name" type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 bg-white/20 border border-white/30 text-white placeholder-white/70 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400" placeholder="John Doe" />
            </div>

            <div>
              <label htmlFor="email" className="block text-white mb-1">Email Address <span className="text-red-500">*</span></label>
              <input id="email" type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 bg-white/20 border border-white/30 text-white placeholder-white/70 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400" placeholder="you@example.com" />
            </div>

            <div>
              <label htmlFor="password" className="block text-white mb-1">Password <span className="text-red-500">*</span></label>
              <input id="password" type="password" name="password" value={formData.password} onChange={handleChange} className="w-full px-4 py-2 bg-white/20 border border-white/30 text-white placeholder-white/70 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400" placeholder="At least 8 characters" />
              <div className="mt-1 flex gap-1">
                {[1,2,3,4].map(i => (
                  <div key={i} className={`h-1 flex-1 rounded-sm ${passwordStrength >= i ? (i >= 3 ? 'bg-green-500' : 'bg-yellow-500') : 'bg-gray-200'}`} />
                ))}
              </div>
              <p className="text-xs text-gray-300 mt-1">Include uppercase, numbers, and symbols for stronger security</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-white mb-1">Confirm Password <span className="text-red-500">*</span></label>
              <input id="confirmPassword" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full px-4 py-2 bg-white/20 border border-white/30 text-white placeholder-white/70 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400" placeholder="Re-enter your password" />
            </div>

            <button type="submit" disabled={loading} className={`w-full py-3 rounded-lg font-medium transition ${loading ? 'bg-yellow-200 cursor-not-allowed' : 'bg-yellow-300 hover:bg-yellow-400 text-black'}`}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-white/80">
            <p>Already have an account? <a href="/signin" className="text-yellow-400 hover:underline font-medium">Sign In</a></p>
          </div>
        </div>
      </main>

      <footer className="bg-white/10 backdrop-blur-md text-white/60 text-center p-6 text-sm border-t border-white/10">
        &copy; {new Date().getFullYear()} Vape Vault. All rights reserved.
      </footer>
    </div>
  );
}
