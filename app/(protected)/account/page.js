"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function MyAccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    address: "",
  });
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      const { data: { user: currentUser } = {}, error: authError } =
        await supabase.auth.getUser();
      if (authError || !currentUser) {
        router.push("/signin");
        return;
      }
      setUser(currentUser);

      const { data: userProfile, error: profileError } = await supabase
        .from("users")
        .select("full_name, email, phone_number, address")
        .eq("id", currentUser.id)
        .single();

      if (profileError && profileError.code !== "PGRST116") {
        console.error("Error fetching profile:", profileError.message);
      }

      setProfile({
        full_name:
          userProfile?.full_name || currentUser.user_metadata?.full_name || "",
        email: userProfile?.email || currentUser.email || "",
        phone_number: userProfile?.phone_number || "",
        address: userProfile?.address || "",
      });

      setLoading(false);
    };

    fetchUserAndProfile();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    const updates = {};
    if (profile.full_name !== (user.user_metadata?.full_name || "")) {
      updates.data = { full_name: profile.full_name };
    }
    if (password) {
      updates.password = password;
    }
    if (Object.keys(updates).length > 0) {
      const { error: authUpdateError } = await supabase.auth.updateUser(
        updates
      );
      if (authUpdateError) {
        alert("Error updating account info: " + authUpdateError.message);
        setSaving(false);
        return;
      }
    }

    const { error: dbError } = await supabase.from("users").upsert([
      {
        id: user.id,
        full_name: profile.full_name,
        email: profile.email,
        phone_number: profile.phone_number,
        address: profile.address,
      },
    ]);

    if (dbError) {
      alert("Error saving profile details: " + dbError.message);
      setSaving(false);
      return;
    }

    alert("Profile updated successfully.");
    setPassword("");
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-black">
        <p>Loading account...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      {/* Header */}
      <header className="flex justify-center items-center px-6 py-4 border-b border-gray-200 bg-white">
        <Link href="/" className="flex items-center space-x-3">
          <Image src="/Logo.png" alt="Vape Vault Logo" width={80} height={80} />
          <h1 className="text-3xl font-bold text-gray-700">Vape Vault</h1>
        </Link>
      </header>

      <main className="flex-1 px-6 py-10">
        <button
          onClick={() => router.back()}
          className="bg-yellow-300 hover:bg-yellow-400 text-black px-4 py-2 rounded-md font-medium mb-6"
        >
          ← Back
        </button>

        <h1 className="text-3xl font-bold mb-6 text-gray-800">My Account</h1>

        {/* Expanded card width: max-w-2xl */}
        <div className="max-w-2xl mx-auto bg-gray-50 border border-gray-200 rounded-xl shadow-md p-8">
          {/* Avatar placeholder */}
          <div className="flex justify-center mb-8">
            <div className="w-48 h-48 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-gray-500">Avatar</span>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            {/* Full Name */}
            <div>
              <label
                htmlFor="full_name"
                className="block text-gray-700 mb-2 font-medium"
              >
                Full Name
              </label>
              <input
                id="full_name"
                type="text"
                value={profile.full_name}
                onChange={(e) =>
                  setProfile({ ...profile, full_name: e.target.value })
                }
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                required
              />
            </div>

            {/* Email (read-only) */}
            <div>
              <label
                htmlFor="email"
                className="block text-gray-700 mb-2 font-medium"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={profile.email}
                readOnly
                className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg cursor-not-allowed"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-gray-700 mb-2 font-medium"
              >
                Password (encrypted)
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <p className="text-gray-500 text-sm mt-1">
                Leave blank to keep current password.
              </p>
            </div>

            {/* Phone Number */}
            <div>
              <label
                htmlFor="phone_number"
                className="block text-gray-700 mb-2 font-medium"
              >
                Phone Number
              </label>
              <input
                id="phone_number"
                type="text"
                value={profile.phone_number}
                onChange={(e) =>
                  setProfile({ ...profile, phone_number: e.target.value })
                }
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder="e.g. (555) 123-4567"
              />
            </div>

            {/* Address */}
            <div>
              <label
                htmlFor="address"
                className="block text-gray-700 mb-2 font-medium"
              >
                Address
              </label>
              <textarea
                id="address"
                rows={3}
                value={profile.address}
                onChange={(e) =>
                  setProfile({ ...profile, address: e.target.value })
                }
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder="Street, City, State, ZIP"
              />
            </div>

            {/* Save & Logout Buttons */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={saving}
                className={`bg-yellow-300 hover:bg-yellow-400 text-black px-6 py-2 rounded-md font-medium transition ${
                  saving ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="bg-red-300 hover:bg-red-400 text-black px-6 py-2 rounded-md font-medium transition"
              >
                Logout
              </button>
            </div>
          </form>
        </div>
      </main>

      <footer className="bg-gray-100 text-gray-700 text-center p-6 text-sm border-t border-gray-200">
        &copy; {new Date().getFullYear()} Vape Vault. All rights reserved.
      </footer>
    </div>
  );
}
