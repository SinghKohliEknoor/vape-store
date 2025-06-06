// "use client";
// import { useState } from "react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { supabase } from "@/lib/supabaseClient";

// export default function Signin() {
//   const router = useRouter();
//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//   });

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const { email, password } = formData;

//     const {
//       data: { user },
//       error,
//     } = await supabase.auth.signInWithPassword({ email, password });

//     if (error) {
//       alert("Login failed: " + error.message);
//       return;
//     }

//     // Check if user exists in 'users' table
//     const { data: existingUser, error: fetchError } = await supabase
//       .from("users")
//       .select("*")
//       .eq("id", user.id)
//       .single();

//     if (fetchError && fetchError.code !== "PGRST116") {
//       console.error("Error checking user:", fetchError.message);
//     }

//     if (!existingUser) {
//       const { error: insertError } = await supabase.from("users").insert([
//         {
//           id: user.id,
//           email: user.email,
//           full_name: user.user_metadata?.full_name || "No Name",
//         },
//       ]);

//       if (insertError) {
//         console.error(
//           "Failed to insert into users table:",
//           insertError.message
//         );
//         alert("Login succeeded but failed to create user profile.");
//       }
//     }

//     router.push("/home");
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black to-gray-900 text-white p-6">
//       <div className="w-full max-w-md bg-gray-800 rounded-xl shadow-lg p-8 space-y-6">
//         <h2 className="text-3xl font-bold text-center text-violet-400">
//           Sign In
//         </h2>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <input
//             type="email"
//             name="email"
//             placeholder="Email Address"
//             value={formData.email}
//             onChange={handleChange}
//             className="w-full p-3 rounded-lg bg-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
//             required
//           />
//           <input
//             type="password"
//             name="password"
//             placeholder="Password"
//             value={formData.password}
//             onChange={handleChange}
//             className="w-full p-3 rounded-lg bg-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
//             required
//           />
//           <button
//             type="submit"
//             className="w-full bg-violet-600 hover:bg-violet-700 transition py-3 rounded-lg font-medium"
//           >
//             Sign In
//           </button>
//         </form>

//         <p className="text-center text-sm text-gray-400">
//           Don’t have an account?{" "}
//           <Link href="/signup" className="text-violet-400 hover:underline">
//             Sign Up
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// }
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function Signin() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    const {
      data: { user },
      error,
    } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      alert("Login failed: " + error.message);
      return;
    }

    // Ensure user exists in our "users" table
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error checking user:", fetchError.message);
    }

    if (!existingUser) {
      const { error: insertError } = await supabase.from("users").insert([
        {
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || "No Name",
        },
      ]);

      if (insertError) {
        console.error(
          "Failed to insert into users table:",
          insertError.message
        );
        alert("Login succeeded but failed to create user profile.");
      }
    }

    router.push("/home");
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      {/* Header with Logo */}
      <header className="flex justify-center items-center px-6 py-4 border-b border-gray-200 bg-white">
        <Link href="/" className="flex items-center space-x-3">
          <Image src="/Logo.png" alt="Vape Vault Logo" width={80} height={80} />
          <h1 className="text-3xl font-bold text-gray-700">Vape Vault</h1>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md bg-gray-50 border border-gray-200 rounded-xl shadow-md p-8">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
            Sign In
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder="Enter your password"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-yellow-300 hover:bg-yellow-400 text-black py-3 rounded-lg font-medium transition"
            >
              Sign In
            </button>
          </form>
          <p className="text-center text-gray-600 mt-6 text-sm">
            Don’t have an account?{" "}
            <Link href="/signup" className="text-yellow-600 hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </main>

      <footer className="bg-gray-100 text-gray-700 text-center p-6 text-sm border-t border-gray-200">
        &copy; {new Date().getFullYear()} Vape Vault. All rights reserved.
      </footer>
    </div>
  );
}
