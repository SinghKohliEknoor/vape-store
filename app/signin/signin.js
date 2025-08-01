// app/signin/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function SigninPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // pick up name+email from signup redirect
  const signupName = searchParams.get("name") || "";
  const signupEmail = searchParams.get("email") || "";

  const [formData, setFormData] = useState({
    email: signupEmail,
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) =>
    setFormData((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1️⃣ sign in
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
      if (signInError) throw signInError;
      const user = data.user;
      if (!user) throw new Error("No user returned");

      // 2️⃣ upsert profile row
      const { error: upsertError } = await supabase.from("users").upsert({
        id: user.id,
        email: user.email,
        full_name: signupName,
      });
      if (upsertError) throw upsertError;

      // 3️⃣ redirect home
      router.push("/home");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex flex-col">
      {/* Header */}
      <header className="flex justify-center items-center px-6 py-4 border-b border-white/10 bg-white/10 backdrop-blur-md">
        <Link href="/" className="flex items-center space-x-3">
          <img src="/Logo.png" alt="Vape Vault Logo" className="w-20 h-20" />
          <h1 className="text-3xl font-bold text-yellow-300">Vape Vault</h1>
        </Link>
      </header>

      {/* Form */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-center text-yellow-300 mb-6">
            Sign In to Your Account
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100/20 border-l-4 border-red-400 text-red-300 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-white mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-white/20 border border-white/30 text-white placeholder-white/70 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-white mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-white/20 border border-white/30 text-white placeholder-white/70 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
                placeholder="Your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-medium transition ${
                loading
                  ? "bg-yellow-200 cursor-not-allowed text-black"
                  : "bg-yellow-300 hover:bg-yellow-400 text-black"
              }`}
            >
              {loading ? "Signing In…" : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-white/80">
            Don’t have an account?{" "}
            <Link
              href="/signup"
              className="text-yellow-400 hover:underline font-medium"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/10 backdrop-blur-md text-white/60 text-center p-6 text-sm border-t border-white/10">
        &copy; {new Date().getFullYear()} Vape Vault. All rights reserved.
      </footer>
    </div>
  );
}
