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
      const { data: { user: currentUser } = {}, error } = await supabase.auth.getUser();
      if (error || !currentUser) return router.push("/signin");
      setUser(currentUser);

      const { data: userProfile } = await supabase
        .from("users")
        .select("full_name, email, phone_number, address")
        .eq("id", currentUser.id)
        .single();

      setProfile({
        full_name: userProfile?.full_name || currentUser.user_metadata?.full_name || "",
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
    if (profile.full_name !== (user.user_metadata?.full_name || ""))
      updates.data = { full_name: profile.full_name };
    if (password) updates.password = password;

    if (Object.keys(updates).length > 0) {
      const { error } = await supabase.auth.updateUser(updates);
      if (error) return alert("Error: " + error.message);
    }

    const { error: dbError } = await supabase.from("users").upsert([{
      id: user.id,
      full_name: profile.full_name,
      email: profile.email,
      phone_number: profile.phone_number,
      address: profile.address,
    }]);
    if (dbError) return alert("Error: " + dbError.message);

    alert("Profile updated.");
    setPassword("");
    setSaving(false);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white text-black">
      <p>Loading account...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      <header className="flex justify-center items-center px-4 py-3 border-b border-gray-300 bg-white">
        <Link href="/" className="flex items-center space-x-3">
          <Image src="/Logo.png" alt="Vape Vault Logo" width={60} height={60} />
          <h1 className="text-2xl font-bold text-gray-700">Vape Vault</h1>
        </Link>
      </header>

      <main className="flex-1 px-4 py-6">
        <button
          onClick={() => router.back()}
          className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded-lg mb-4 shadow-sm font-semibold"
        >
          ← Back
        </button>

        <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">My Account</h1>

        <div className="max-w-md mx-auto bg-gray-100 border border-gray-300 rounded-2xl shadow-md p-6 space-y-6">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-white border border-gray-300 rounded-full flex items-center justify-center shadow-sm">
              <span className="text-gray-400">Avatar</span>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            <InputField label="Full Name" id="full_name" value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} />
            <InputField label="Email" id="email" value={profile.email} readOnly />
            <InputField label="Password (encrypted)" id="password" type="password" value={password} placeholder="••••••••" onChange={(e) => setPassword(e.target.value)} hint="Leave blank to keep current password." />
            <InputField label="Phone Number" id="phone_number" value={profile.phone_number} onChange={(e) => setProfile({ ...profile, phone_number: e.target.value })} placeholder="e.g. (555) 123-4567" />
            <TextareaField label="Address" id="address" value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} />

            <div className="flex justify-between pt-4 border-t border-gray-300">
              <button
                type="submit"
                disabled={saving}
                className={`bg-yellow-400 hover:bg-yellow-500 text-black px-5 py-2 rounded-lg font-semibold shadow-sm transition ${saving ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="bg-red-400 hover:bg-red-500 text-black px-5 py-2 rounded-lg font-semibold shadow-sm transition"
              >
                Logout
              </button>
            </div>
          </form>
        </div>
      </main>

      <footer className="bg-gray-100 text-center p-4 border-t border-gray-300 text-sm text-gray-600">
        &copy; {new Date().getFullYear()} Vape Vault.
      </footer>
    </div>
  );
}

function InputField({ label, id, value, onChange, readOnly, type = "text", placeholder, hint }) {
  return (
    <div>
      <label htmlFor={id} className="block text-gray-700 mb-1 font-medium">{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        placeholder={placeholder}
        className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 ${readOnly ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
      />
      {hint && <p className="text-gray-600 text-xs mt-1">{hint}</p>}
    </div>
  );
}

function TextareaField({ label, id, value, onChange }) {
  return (
    <div>
      <label htmlFor={id} className="block text-gray-700 mb-1 font-medium">{label}</label>
      <textarea
        id={id}
        rows={2}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
        placeholder="Street, City, State, ZIP"
      />
    </div>
  );
}
