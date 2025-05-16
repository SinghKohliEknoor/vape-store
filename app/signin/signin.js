// "use client";
// import { useState } from "react";
// import { useRouter } from "next/navigation";

// export default function LoginPage() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const router = useRouter();

//   const handleLogin = (e) => {
//     e.preventDefault();
//     setIsLoading(true);
//     // Simulate API call
//     setTimeout(() => {
//       setIsLoading(false);
//       router.push("/signup");
//     }, 1500);
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800">
//       {/* Animated Background Elements */}
//       <div className="absolute inset-0 overflow-hidden">
//         <div className="absolute top-0 left-20 w-72 h-72 bg-violet-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
//         <div className="absolute top-0 right-20 w-72 h-72 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
//         <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
//       </div>

//       <div className="relative z-10 bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden w-full max-w-md border border-white/20">
//         {/* Decorative Header */}
//         <div className="bg-gradient-to-r from-violet-600 to-pink-600 p-6 text-center">
//           <h2 className="text-4xl font-bold text-white">Smoke Signals</h2>
//           <p className="text-white/80 mt-2">Elevate your experience</p>
//         </div>

//         <div className="p-8">
//           {error && (
//             <div className="mb-6 p-3 bg-red-500/10 text-red-500 rounded-lg border border-red-500/30 text-center">
//               {error}
//             </div>
//           )}

//           <form onSubmit={handleLogin} className="space-y-6">
//             <div className="space-y-2">
//               <label className="block text-white/80 text-sm font-medium">
//                 Email
//               </label>
//               <div className="relative">
//                 <input
//                   id="email"
//                   type="email"
//                   className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-white placeholder-white/50 transition-all duration-300 hover:border-white/40"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   placeholder="Enter your email"
//                   required
//                 />
//                 <span className="absolute right-3 top-3 text-white/50">
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     className="h-5 w-5"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                     stroke="currentColor"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
//                     />
//                   </svg>
//                 </span>
//               </div>
//             </div>

//             <div className="space-y-2">
//               <label
//                 htmlFor="password"
//                 className="block text-white/80 text-sm font-medium"
//               >
//                 Password
//               </label>
//               <div className="relative">
//                 <input
//                   id="password"
//                   type="password"
//                   className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-white placeholder-white/50 transition-all duration-300 hover:border-white/40"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   placeholder="Enter your password"
//                   required
//                 />
//                 <span className="absolute right-3 top-3 text-white/50">
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     className="h-5 w-5"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                     stroke="currentColor"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
//                     />
//                   </svg>
//                 </span>
//               </div>
//             </div>

//             <button
//               type="submit"
//               disabled={isLoading}
//               className={`w-full py-3 px-4 rounded-xl font-medium text-white transition-all duration-300 ${
//                 isLoading
//                   ? "bg-violet-700 cursor-not-allowed"
//                   : "bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700 shadow-lg hover:shadow-violet-500/30"
//               }`}
//             >
//               {isLoading ? (
//                 <span className="flex items-center justify-center">
//                   <svg
//                     className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
//                     xmlns="http://www.w3.org/2000/svg"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                   >
//                     <circle
//                       className="opacity-25"
//                       cx="12"
//                       cy="12"
//                       r="10"
//                       stroke="currentColor"
//                       strokeWidth="4"
//                     ></circle>
//                     <path
//                       className="opacity-75"
//                       fill="currentColor"
//                       d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                     ></path>
//                   </svg>
//                   Signing in...
//                 </span>
//               ) : (
//                 "Sign In"
//               )}
//             </button>
//           </form>

//           <div className="mt-6 text-center text-white/70 text-sm">
//             <p>
//               Don't have an account?{" "}
//               <a
//                 href="#"
//                 className="text-violet-300 hover:text-violet-200 underline transition"
//               >
//                 Sign up
//               </a>
//             </p>
//             <a
//               href="#"
//               className="mt-2 inline-block text-white/50 hover:text-white transition"
//             >
//               Forgot password?
//             </a>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient"; // Make sure this path is correct

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoading(false);

    if (error) {
      setError(error.message);
    } else {
      router.push("/home"); // new — redirect to the protected page
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-20 w-72 h-72 bg-violet-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-20 w-72 h-72 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden w-full max-w-md border border-white/20">
        <div className="bg-gradient-to-r from-violet-600 to-pink-600 p-6 text-center">
          <h2 className="text-4xl font-bold text-white">Smoke Signals</h2>
          <p className="text-white/80 mt-2">Elevate your experience</p>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-3 bg-red-500/10 text-red-500 rounded-lg border border-red-500/30 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-white/80 text-sm font-medium">
                Email
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-white placeholder-white/50 transition-all duration-300 hover:border-white/40"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-white/80 text-sm font-medium"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 text-white placeholder-white/50 transition-all duration-300 hover:border-white/40"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-xl font-medium text-white transition-all duration-300 ${
                isLoading
                  ? "bg-violet-700 cursor-not-allowed"
                  : "bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700 shadow-lg hover:shadow-violet-500/30"
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-white/70 text-sm">
            <p>
              Don't have an account?{" "}
              <a
                href="/signup"
                className="text-violet-300 hover:text-violet-200 underline transition"
              >
                Sign up
              </a>
            </p>
            <a
              href="#"
              className="mt-2 inline-block text-white/50 hover:text-white transition"
            >
              Forgot password?
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
