// app/(protected)/layout.js
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function ProtectedLayout({ children }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/signin");
      } else {
        setLoading(false);
      }
    };

    checkUser();
  }, [router]);

  if (loading) {
    return <div className="text-white p-6">Loading...</div>;
  }

  return <>{children}</>;
}
