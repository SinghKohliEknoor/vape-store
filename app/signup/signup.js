// "use client";
// import { useState } from "react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { supabase } from "@/lib/supabaseClient";

// export default function Signup() {
//   const router = useRouter();
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     password: "",
//     confirmPassword: "",
//   });

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const { name, email, password, confirmPassword } = formData;

//     if (password !== confirmPassword) {
//       alert("Passwords do not match");
//       return;
//     }

//     const { data, error } = await supabase.auth.signUp({
//       email,
//       password,
//       options: {
//         data: { full_name: name },
//       },
//     });

//     if (error) {
//       console.error("Signup error:", error.message);
//       alert(error.message);
//     } else {
//       console.log("Signup success:", data);
//       alert("Check your email to confirm your account.");
//       router.push("/signin");
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black to-gray-900 text-white p-6">
//       <div className="w-full max-w-md bg-gray-800 rounded-xl shadow-lg p-8 space-y-6">
//         <h2 className="text-3xl font-bold text-center text-violet-400">
//           Create an Account
//         </h2>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <input
//             type="text"
//             name="name"
//             placeholder="Full Name"
//             value={formData.name}
//             onChange={handleChange}
//             className="w-full p-3 rounded-lg bg-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
//             required
//           />
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
//           <input
//             type="password"
//             name="confirmPassword"
//             placeholder="Confirm Password"
//             value={formData.confirmPassword}
//             onChange={handleChange}
//             className="w-full p-3 rounded-lg bg-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
//             required
//           />
//           <button
//             type="submit"
//             className="w-full bg-violet-600 hover:bg-violet-700 transition py-3 rounded-lg font-medium"
//           >
//             Sign Up
//           </button>
//         </form>

//         <p className="text-center text-sm text-gray-400">
//           Already have an account?{" "}
//           <Link href="/signin" className="text-violet-400 hover:underline">
//             Sign In
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
        data: { full_name: name },
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
            Create an Account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-gray-700 mb-1">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder="John Doe"
              />
            </div>

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

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-gray-700 mb-1"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder="Re-enter your password"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-yellow-300 hover:bg-yellow-400 text-black py-3 rounded-lg font-medium transition"
            >
              Sign Up
            </button>
          </form>

          <p className="text-center text-gray-600 mt-6 text-sm">
            Already have an account?{" "}
            <Link href="/signin" className="text-yellow-600 hover:underline">
              Sign In
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
