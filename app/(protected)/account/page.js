"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function MyAccountPage() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      if (data?.user) {
        setUser(data.user);
      } else {
        router.push("/signin");
      }
    });
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/signin");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p>Loading user information...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold mb-6">My Account</h1>
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg space-y-4">
        <p>
          <strong>Full Name:</strong> {user.user_metadata?.full_name || "N/A"}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Created At:</strong>{" "}
          {new Date(user.created_at).toLocaleDateString()}
        </p>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
