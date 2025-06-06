"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { HeartIcon } from "@heroicons/react/24/outline";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.push("/signin");
      } else {
        setUser(data.session.user);
      }
    });

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

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase.from("products").select("*");
      if (error) {
        console.error("Error fetching products:", error.message);
      } else {
        setProducts(data);
      }
      setLoading(false);
    }

    fetchProducts();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const addToCart = async (productId) => {
    try {
      let { data: cart, error: cartError } = await supabase
        .from("carts")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (cartError && cartError.code === "PGRST116") {
        const { data: newCart, error: newCartError } = await supabase
          .from("carts")
          .insert({ user_id: user.id })
          .select("id")
          .single();

        if (newCartError) throw newCartError;
        cart = newCart;
      } else if (cartError) {
        throw cartError;
      }

      const { error: itemError } = await supabase.from("cart_items").insert({
        cart_id: cart.id,
        product_id: productId,
        quantity: 1,
      });

      if (itemError) throw itemError;
      alert("Product added to cart!");
    } catch (error) {
      console.error("Add to cart failed:", error.message || error);
      alert("Something went wrong while adding to cart.");
    }
  };

  const addToWishlist = async (productId) => {
    try {
      // 1) Look up an existing wishlist for this user:
      let { data: wishlist, error: wlError } = await supabase
        .from("wishlists")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (wlError && wlError.code === "PGRST116") {
        // No wishlist found, so create one named "My Wishlist"
        const { data: newWishlist, error: createError } = await supabase
          .from("wishlists")
          .insert({ user_id: user.id, name: "My Wishlist" })
          .select("id")
          .single();

        if (createError) throw createError;
        wishlist = newWishlist;
      } else if (wlError) {
        throw wlError;
      }

      // 2) Insert into wishlist_items
      const { error: itemError } = await supabase
        .from("wishlist_items")
        .insert({
          wishlist_id: wishlist.id,
          product_id: productId,
        });

      if (itemError) throw itemError;
      alert("Product added to wishlist!");
    } catch (error) {
      console.error("Add to wishlist failed:", error.message || error);
      alert("Something went wrong while adding to wishlist.");
    }
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-black bg-white">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <header className="flex justify-between items-center px-6 py-2 border-b border-gray-200 shadow-sm bg-white">
        <div className="flex items-center space-x-3">
          <Image src="/Logo.png" alt="Vape Vault Logo" width={80} height={80} />
          <h1 className="text-3xl font-bold text-gray-700">Vape Vault</h1>
        </div>
        <nav className="space-x-6 text-lg flex items-center">
          <Link href="/account" className="hover:text-yellow-400 transition">
            My Account
          </Link>
          <Link href="/wishlist" className="hover:text-yellow-400 transition">
            Wishlist
          </Link>
          <Link href="/cart" className="hover:text-yellow-400 transition">
            Cart
          </Link>
          <button
            onClick={handleLogout}
            className="bg-yellow-300 hover:bg-yellow-400 text-black px-4 py-2 rounded-md font-medium"
          >
            Logout
          </button>
        </nav>
      </header>

      <main className="relative px-6 py-50 text-center overflow-hidden group">
        <div
          className="absolute inset-0 bg-contain bg-center transition-all duration-1000 ease-in-out group-hover:scale-120"
          style={{ backgroundImage: `url('/vape_back.png')` }}
        ></div>

        <div className="relative z-10">
          <h2 className="text-5xl font-bold mb-4 text-white">
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

      <main id="products" className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-4xl font-semibold text-center mb-12 text-gray-700">
            Our Collection
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <div
                key={product.id}
                onClick={() => router.push(`/product/${product.id}`)}
                className="cursor-pointer bg-gray-50 border border-gray-200 rounded-xl overflow-hidden shadow hover:shadow-xl transition-all flex flex-col"
              >
                <div className="relative h-64 bg-white">
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    className="object-contain p-4 transition-transform duration-300"
                  />
                </div>
                <div className="p-4 flex flex-col">
                  <h4 className="text-xl font-bold mb-4">{product.name}</h4>
                  <p className="text-yellow-600 text-lg font-semibold mb-4">
                    ${product.price}
                  </p>
                  <div className="flex justify-between items-center mt-auto space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product.id);
                      }}
                      className="flex-1 bg-yellow-300 hover:bg-yellow-400 py-2 rounded-md text-sm font-medium text-black transition"
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToWishlist(product.id);
                      }}
                      className="p-2 rounded-md hover:bg-yellow-100 transition"
                      title="Add to Wishlist"
                    >
                      <HeartIcon className="h-5 w-5 text-yellow-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="bg-gray-100 text-gray-700 text-center p-6 text-sm border-t border-gray-200">
        &copy; {new Date().getFullYear()} Vape Vault. All rights reserved.
      </footer>
    </div>
  );
}
