"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function WishlistPage() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.push("/signin");
      } else {
        setUser(data.session.user);
      }
    });
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-4xl font-bold mb-4">Your Wishlist</h1>
      {user ? (
        <p className="text-lg">You haven’t added any items to your wishlist.</p>
      ) : (
        <p>Loading wishlist...</p>
      )}
    </div>
  );
}
