"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient"; // Adjust path as needed

const products = [
  {
    id: 1,
    name: "Cloud Chaser Pro",
    description: "Massive vapor production with adjustable airflow",
    image: "/vape1.png",
    features: ["200W max power", "8ml tank capacity", "Triple mesh coils"],
  },
  {
    id: 2,
    name: "Flavor Master",
    description: "Enhanced flavor delivery system",
    image: "/vape3.png",
    features: ["Ceramic coils", "Precision temperature control", "5ml tank"],
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
  },
];

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check current session on mount
    const session = supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        // No user, redirect to signin
        router.push("/signin");
      } else {
        setUser(data.session.user);
      }
    });

    // Listen for auth state changes (optional, keeps user updated)
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!session) {
          router.push("/signin");
        } else {
          setUser(session.user);
        }
      }
    );

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [router]);

  // Handle logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/signin");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-black">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white font-sans">
      <header className="flex justify-between items-center p-6 shadow-lg">
        <h1 className="text-3xl font-bold text-violet-400">Smoke Signals</h1>
        <nav className="space-x-6 text-lg flex items-center">
          <span className="text-violet-300 mr-4">Welcome, {user.email}</span>
          <button
            onClick={handleLogout}
            className="bg-violet-600 hover:bg-violet-700 px-4 py-2 rounded-lg transition"
          >
            Logout
          </button>
        </nav>
      </header>

      <main className="group text-center px-6 py-32 relative overflow-hidden min-h-[500px] flex items-center justify-center">
        {/* Background with hover animation */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 ease-in-out group-hover:scale-105"
          style={{ backgroundImage: `url('/vape_back.png')` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/10 transition-opacity duration-700 group-hover:opacity-90"></div>
        </div>

        {/* Content with hover lift effect */}
        <div className="relative z-10 transition-transform duration-500 group-hover:-translate-y-2 max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold mb-6 leading-tight text-white drop-shadow-lg">
            Discover Your Next Favorite Vape
          </h2>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto mb-10 drop-shadow-md">
            Premium vape products, stylish designs, and smooth flavors – all in
            one place.
          </p>
          <Link href="#products">
            <button className="bg-violet-600 hover:bg-violet-700 transition-all px-6 py-3 rounded-full text-lg font-medium shadow-lg hover:shadow-violet-500/30 hover:-translate-y-1 hover:scale-105">
              Browse Products
            </button>
          </Link>
        </div>
      </main>

      <section id="products" className="px-6 py-20 bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-4xl font-semibold mb-4 text-center">
            Our Collection
          </h3>
          <p className="text-gray-400 text-center max-w-2xl mx-auto mb-12">
            Carefully curated selection of premium vaping devices
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-gray-900 rounded-xl shadow-2xl overflow-hidden hover:shadow-violet-500/20 transition-all duration-300 group"
              >
                <div className="relative h-64 bg-gray-800">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-contain p-6 group-hover:scale-105 transition-transform duration-300"
                    quality={90}
                    priority={product.id === 1}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <div className="p-6">
                  <h4 className="text-2xl font-bold mb-2">{product.name}</h4>
                  <p className="text-gray-400 mb-4">{product.description}</p>
                  <ul className="space-y-2 mb-6">
                    {product.features.map((feature, i) => (
                      <li key={i} className="flex items-center text-gray-300">
                        <svg
                          className="w-4 h-4 mr-2 text-violet-400"
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
                  <button className="w-full bg-violet-600 hover:bg-violet-700 transition-colors py-3 rounded-lg font-medium">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="px-6 py-20 text-center bg-gray-900">
        <h3 className="text-4xl font-semibold mb-6">About Smoke Signals</h3>
        <p className="max-w-3xl mx-auto text-gray-300 text-lg">
          At Smoke Signals, we’re passionate about providing the best vaping
          experience. Our products are tested, stylish, and built for your
          lifestyle.
        </p>
      </section>

      <section id="contact" className="px-6 py-20 text-center bg-gray-800">
        <h3 className="text-4xl font-semibold mb-6">Contact Us</h3>
        <p className="text-gray-300 text-lg mb-4">
          Have questions or want to collaborate?
        </p>
        <a
          href="mailto:support@SmokeSignals.com"
          className="text-violet-400 hover:underline text-xl"
        >
          support@SmokeSignals.com
        </a>
      </section>

      <footer className="bg-black text-gray-500 text-center p-6">
        &copy; {new Date().getFullYear()} Smoke Signals. All rights reserved.
      </footer>
    </div>
  );
}
