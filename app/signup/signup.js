"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient"; // adjust path as needed

export default function Signup() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, confirmPassword } = formData;

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name }, // Store user's name
      },
    });

    if (error) {
      console.error("Signup error:", error.message);
      alert(error.message);
    } else {
      console.log("Signup success:", data);
      alert("Check your email to confirm your account.");
      router.push("/signin");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black to-gray-900 text-white p-6">
      <div className="w-full max-w-md bg-gray-800 rounded-xl shadow-lg p-8 space-y-6">
        <h2 className="text-3xl font-bold text-center text-violet-400">
          Create an Account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
            required
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
            required
          />
          <button
            type="submit"
            className="w-full bg-violet-600 hover:bg-violet-700 transition py-3 rounded-lg font-medium"
          >
            Sign Up
          </button>
        </form>

        <p className="text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link href="/signin" className="text-violet-400 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
