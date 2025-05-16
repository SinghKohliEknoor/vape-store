"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function CartPage() {
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p>Loading cart...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-6">Your Cart</h1>

      <section className="mb-8 bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">User Info</h2>
        <p>
          <strong>Full Name:</strong> {user.user_metadata?.full_name || "N/A"}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
      </section>

      <section className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">Cart Items</h2>
        <p>Your cart is currently empty.</p>
        {/* Replace with real cart items later */}
      </section>
    </div>
  );
}
