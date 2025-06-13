'use client';

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Header from "app/components/Header";

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
      const { data: { user: currentUser } = {}, error } =
        await supabase.auth.getUser();
      if (error || !currentUser) {
        router.push("/signin");
        return;
      }
      setUser(currentUser);

      const { data: userProfile } = await supabase
        .from("users")
        .select("full_name, email, phone_number, address")
        .eq("id", currentUser.id)
        .single();

      setProfile({
        full_name:
          userProfile?.full_name ||
          currentUser.user_metadata?.full_name ||
          "",
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
    if (
      profile.full_name !==
      (user.user_metadata?.full_name || "")
    ) {
      updates.data = { full_name: profile.full_name };
    }
    if (password) {
      updates.password = password;
    }

    if (Object.keys(updates).length > 0) {
      const { error } = await supabase.auth.updateUser(updates);
      if (error) {
        alert("Error: " + error.message);
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
      alert("Error: " + dbError.message);
    } else {
      alert("Profile updated.");
      setPassword("");
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <p>Loading account…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <Header />

      {/* bump the pt so content sits below header */}
      <main className="flex-1 flex items-center justify-center px-4 pt-32 pb-16">
        <div className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-xl">
          <h1 className="text-3xl font-bold text-center text-yellow-300 mb-8">
            My Account
          </h1>

          <form onSubmit={handleSave} className="space-y-6">
            <InputField
              label="Full Name"
              id="full_name"
              value={profile.full_name}
              onChange={(e) =>
                setProfile({ ...profile, full_name: e.target.value })
              }
            />

            <InputField
              label="Email"
              id="email"
              value={profile.email}
              readOnly
            />

            <InputField
              label="Password (leave blank to keep current)"
              id="password"
              type="password"
              value={password}
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
            />

            <InputField
              label="Phone Number"
              id="phone_number"
              value={profile.phone_number}
              onChange={(e) =>
                setProfile({ ...profile, phone_number: e.target.value })
              }
            />

            <TextareaField
              label="Address"
              id="address"
              value={profile.address}
              onChange={(e) =>
                setProfile({ ...profile, address: e.target.value })
              }
            />

            <div className="flex justify-between items-center pt-4 border-t border-white/20">
              <button
                type="submit"
                disabled={saving}
                className={`bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-2 rounded-lg font-semibold shadow transition ${
                  saving ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {saving ? "Saving…" : "Save Changes"}
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold shadow"
              >
                Logout
              </button>
            </div>
          </form>
        </div>
      </main>

      <footer className="bg-white/10 backdrop-blur-lg text-white/60 text-center p-4 border-t border-white/10 text-sm">
        &copy; {new Date().getFullYear()} Vape Vault.
      </footer>
    </div>
  );
}

function InputField({
  label,
  id,
  value,
  onChange,
  readOnly,
  type = "text",
  placeholder,
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block mb-1 font-medium text-white"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        placeholder={placeholder}
        className={`w-full px-4 py-2 rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition ${
          readOnly
            ? "bg-white/10 cursor-not-allowed text-white/50"
            : "bg-white/10 text-white"
        }`}
      />
    </div>
  );
}

function TextareaField({ label, id, value, onChange }) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block mb-1 font-medium text-white"
      >
        {label}
      </label>
      <textarea
        id={id}
        rows={3}
        value={value}
        onChange={onChange}
        placeholder="Street, City, State, ZIP"
        className="w-full px-4 py-2 bg-white/10 text-white border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
      />
    </div>
  );
}
