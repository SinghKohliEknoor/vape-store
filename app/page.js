// "use client";
// import Image from "next/image";
// import Link from "next/link";
// import { useRouter } from "next/navigation";

// const products = [
//   {
//     id: 1,
//     name: "Cloud Chaser Pro",
//     description: "Massive vapor production with adjustable airflow",
//     image: "/vape1.png",
//     features: ["200W max power", "8ml tank capacity", "Triple mesh coils"],
//   },
//   {
//     id: 2,
//     name: "Flavor Master",
//     description: "Enhanced flavor delivery system",
//     image: "/vape3.png",
//     features: ["Ceramic coils", "Precision temperature control", "5ml tank"],
//   },
//   {
//     id: 3,
//     name: "Stealth X",
//     description: "Ultra-portable and discreet",
//     image: "/vape4.png",
//     features: [
//       "Pocket-sized design",
//       "Leak-proof technology",
//       "USB-C charging",
//     ],
//   },
// ];
// export default function Landing() {
//   const router = useRouter();
//   return (
//     <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white font-sans">
//       <header className="flex justify-between items-center p-6 shadow-lg">
//         <h1 className="text-3xl font-bold text-violet-400">Smoke Signals</h1>
//         <nav className="space-x-6 text-lg">
//           <Link
//             href="/signin"
//             className="text-violet-400 hover:text-violet-800"
//           >
//             Sign In/Sign Up
//           </Link>
//           <Link
//             href="#products"
//             className="text-violet-400 hover:text-violet-800"
//           >
//             Products
//           </Link>
//           <Link href="#about" className="text-violet-400 hover:text-violet-800">
//             About
//           </Link>
//           <Link
//             href="#contact"
//             className=" text-violet-400 hover:text-violet-800"
//           >
//             Contact
//           </Link>
//         </nav>
//       </header>

//       <main className="group text-center px-6 py-32 relative overflow-hidden min-h-[500px] flex items-center justify-center">
//         {/* Background with hover animation */}
//         <div
//           className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 ease-in-out group-hover:scale-105"
//           style={{ backgroundImage: `url('/vape_back.png')` }}
//         >
//           <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/10 transition-opacity duration-700 group-hover:opacity-90"></div>
//         </div>

//         {/* Content with hover lift effect */}
//         <div className="relative z-10 transition-transform duration-500 group-hover:-translate-y-2 max-w-4xl mx-auto">
//           <h2 className="text-5xl font-bold mb-6 leading-tight text-white drop-shadow-lg">
//             Discover Your Next Favorite Vape
//           </h2>
//           <p className="text-xl text-gray-200 max-w-2xl mx-auto mb-10 drop-shadow-md">
//             Premium vape products, stylish designs, and smooth flavors – all in
//             one place.
//           </p>
//           <Link href="#products">
//             <button className="bg-violet-600 hover:bg-violet-700 transition-all px-6 py-3 rounded-full text-lg font-medium shadow-lg hover:shadow-violet-500/30 hover:-translate-y-1 hover:scale-105">
//               Browse Products
//             </button>
//           </Link>
//         </div>
//       </main>

//       <section id="products" className="px-6 py-20 bg-gray-800">
//         <div className="max-w-7xl mx-auto">
//           <h3 className="text-4xl font-semibold mb-4 text-center">
//             Our Collection
//           </h3>
//           <p className="text-gray-400 text-center max-w-2xl mx-auto mb-12">
//             Carefully curated selection of premium vaping devices
//           </p>

//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
//             {products.map((product) => (
//               <div
//                 key={product.id}
//                 className="bg-gray-900 rounded-xl shadow-2xl overflow-hidden hover:shadow-violet-500/20 transition-all duration-300 group"
//               >
//                 <div className="relative h-64 bg-gray-800">
//                   <Image
//                     src={product.image}
//                     alt={product.name}
//                     fill
//                     className="object-contain p-6 group-hover:scale-105 transition-transform duration-300"
//                     quality={90}
//                     priority={product.id === 1}
//                     sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
//                   />
//                 </div>
//                 <div className="p-6">
//                   <h4 className="text-2xl font-bold mb-2">{product.name}</h4>
//                   <p className="text-gray-400 mb-4">{product.description}</p>
//                   <ul className="space-y-2 mb-6">
//                     {product.features.map((feature, i) => (
//                       <li key={i} className="flex items-center text-gray-300">
//                         <svg
//                           className="w-4 h-4 mr-2 text-violet-400"
//                           fill="none"
//                           stroke="currentColor"
//                           viewBox="0 0 24 24"
//                         >
//                           <path
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             strokeWidth="2"
//                             d="M5 13l4 4L19 7"
//                           />
//                         </svg>
//                         {feature}
//                       </li>
//                     ))}
//                   </ul>
//                   <button className="w-full bg-violet-600 hover:bg-violet-700 transition-colors py-3 rounded-lg font-medium">
//                     View Details
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       <section id="about" className="px-6 py-20 text-center bg-gray-900">
//         <h3 className="text-4xl font-semibold mb-6">About Smoke Signals</h3>
//         <p className="max-w-3xl mx-auto text-gray-300 text-lg">
//           At Smoke Signals, we’re passionate about providing the best vaping
//           experience. Our products are tested, stylish, and built for your
//           lifestyle.
//         </p>
//       </section>

//       <section id="contact" className="px-6 py-20 text-center bg-gray-800">
//         <h3 className="text-4xl font-semibold mb-6">Contact Us</h3>
//         <p className="text-gray-300 text-lg mb-4">
//           Have questions or want to collaborate?
//         </p>
//         <a
//           href="mailto:support@SmokeSignals.com"
//           className="text-violet-400 hover:underline text-xl"
//         >
//           support@SmokeSignals.com
//         </a>
//       </section>

//       <footer className="bg-black text-gray-500 text-center p-6">
//         &copy; {new Date().getFullYear()} Smoke Signals. All rights reserved.
//       </footer>
//     </div>
//   );
// }
"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const products = [
  {
    id: 1,
    name: "Cloud Chaser Pro",
    description: "Massive vapor production with adjustable airflow",
    image: "/vape1.png",
    features: ["200W max power", "8ml tank capacity", "Triple mesh coils"],
    price: 69.99,
  },
  {
    id: 2,
    name: "Flavor Master",
    description: "Enhanced flavor delivery system",
    image: "/vape3.png",
    features: ["Ceramic coils", "Precision temperature control", "5ml tank"],
    price: 74.99,
  },
  {
    id: 3,
    name: "Stealth X",
    description: "Ultra-portable and discreet",
    image: "/vape4.png",
    features: [
      "Pocket-sized design",
      "Leak-proof technology",
      "USB-C charging",
    ],
    price: 39.99,
  },
];

export default function Landing() {
  const router = useRouter();

  // If user is already authenticated, redirect to protected home
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.push("/home");
      }
    });
  }, [router]);

  return (
    <div className="min-h-screen bg-white text-black font-sans flex flex-col">
      {/* HEADER */}
      <header className="flex justify-between items-center px-6 py-4 border-b border-gray-200 shadow-sm bg-white">
        <Link href="/" className="flex items-center space-x-3">
          <Image src="/Logo.png" alt="Vape Vault Logo" width={80} height={80} />
          <h1 className="text-3xl font-bold text-gray-700">Vape Vault</h1>
        </Link>
        <nav className="space-x-6 text-lg flex items-center">
          <Link
            href="/signin"
            className="text-yellow-600 hover:text-yellow-800 transition"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="text-yellow-600 hover:text-yellow-800 transition"
          >
            Sign Up
          </Link>
          <Link
            href="#products"
            className="text-gray-600 hover:text-gray-800 transition"
          >
            Products
          </Link>
          <Link
            href="#about"
            className="text-gray-600 hover:text-gray-800 transition"
          >
            About
          </Link>
          <Link
            href="#contact"
            className="text-gray-600 hover:text-gray-800 transition"
          >
            Contact
          </Link>
        </nav>
      </header>

      {/* HERO SECTION */}
      <main className="relative px-6 py-32 text-center overflow-hidden flex-1">
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out group-hover:scale-105"
          style={{ backgroundImage: `url('/vape_back.png')` }}
        ></div>

        <div className="relative z-10 mx-auto max-w-4xl">
          <h2 className="text-5xl font-bold mb-6 text-white drop-shadow-lg">
            Discover Your Next Favorite Vape
          </h2>
          <p className="text-xl text-white max-w-2xl mx-auto mb-8">
            Premium vape products, stylish designs, and smooth flavors – all in
            one place.
          </p>
          <Link href="#products">
            <button className="bg-yellow-300 hover:bg-yellow-400 px-6 py-3 rounded-full text-lg font-medium text-black transition">
              Browse Products
            </button>
          </Link>
        </div>
      </main>

      {/* PRODUCTS SECTION */}
      <section id="products" className="px-6 py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-4xl font-semibold text-center mb-4 text-gray-800">
            Our Collection
          </h3>
          <p className="text-center text-gray-500 mb-12 max-w-2xl mx-auto">
            Carefully curated selection of premium vaping devices
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white border border-gray-200 rounded-xl shadow hover:shadow-lg transition-all flex flex-col"
              >
                <div className="relative h-64 bg-gray-100">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-contain p-6 transition-transform duration-300 hover:scale-105"
                  />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h4 className="text-2xl font-bold mb-2 text-gray-800">
                    {product.name}
                  </h4>
                  <p className="text-gray-600 mb-2">{product.description}</p>
                  <p className="text-yellow-600 font-semibold mb-4">
                    ${product.price}
                  </p>
                  <ul className="text-gray-500 text-sm mb-6 space-y-1 flex-1">
                    {product.features.map((feature, i) => (
                      <li key={i} className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-2 text-yellow-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => router.push("/signup")}
                    className="mt-auto w-full bg-yellow-300 hover:bg-yellow-400 text-black py-3 rounded-lg font-medium transition"
                  >
                    Sign Up to View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about" className="px-6 py-20 text-center bg-white">
        <h3 className="text-4xl font-semibold mb-6 text-gray-800">
          About Vape Vault
        </h3>
        <p className="max-w-3xl mx-auto text-gray-600 text-lg">
          At Vape Vault, we’re passionate about providing the best vaping
          experience. Our products are tested, stylish, and built for your
          lifestyle.
        </p>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" className="px-6 py-20 text-center bg-gray-50">
        <h3 className="text-4xl font-semibold mb-6 text-gray-800">
          Contact Us
        </h3>
        <p className="text-gray-600 text-lg mb-4">
          Have questions or want to collaborate?
        </p>
        <a
          href="mailto:support@vapevault.com"
          className="text-yellow-600 hover:underline text-xl"
        >
          support@vapevault.com
        </a>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-100 text-gray-700 text-center p-6 text-sm border-t border-gray-200">
        &copy; {new Date().getFullYear()} Vape Vault. All rights reserved.
      </footer>
    </div>
  );
}
