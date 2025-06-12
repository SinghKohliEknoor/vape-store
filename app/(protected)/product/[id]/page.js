"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import Link from "next/link";
import { HeartIcon } from "@heroicons/react/24/outline";

export default function ProductDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);

  useEffect(() => {
    const fetchUserAndProduct = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        router.push("/signin");
        return;
      }
      setUser(sessionData.session.user);

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error loading product:", error.message);
      } else {
        setProduct(data);
      }
      setLoading(false);
    };

    fetchUserAndProduct();
  }, [id, router]);

  const addToCart = async () => {
    if (!user || addingToCart) return;
    setAddingToCart(true);
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
        product_id: product.id,
        quantity: 1,
      });

      if (itemError) throw itemError;
      alert("Added to cart!");
    } catch (error) {
      console.error(error);
      alert("Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const addToWishlist = async () => {
    if (!user || addingToWishlist) return;
    setAddingToWishlist(true);
    try {
      let { data: wishlist, error: wlError } = await supabase
        .from("wishlists")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (wlError && wlError.code === "PGRST116") {
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

      const { error: itemError } = await supabase.from("wishlist_items").insert({
        wishlist_id: wishlist.id,
        product_id: product.id,
      });

      if (itemError) throw itemError;
      alert("Added to wishlist!");
    } catch (error) {
      console.error("Add to wishlist failed:", error);
      alert("Failed to add to wishlist");
    } finally {
      setAddingToWishlist(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex justify-center items-center bg-black text-white">Loading...</div>;
  }

  if (!product) {
    return <div className="min-h-screen flex justify-center items-center bg-black text-white">Product not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white pb-12">
      {/* Sticky Transparent Header */}
      <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-white/10 border-b border-white/20 py-4 px-6 flex justify-between items-center shadow-sm">
        <Link href="/home" className="text-2xl font-bold text-yellow-300">Vape Vault</Link>
        <nav className="space-x-6 text-sm">
          <Link href="/home" className="hover:text-yellow-400">Home</Link>
          <Link href="/wishlist" className="hover:text-yellow-400">Wishlist</Link>
          <Link href="/cart" className="hover:text-yellow-400">Cart</Link>
        </nav>
      </header>

      <div className="pt-24 px-8 flex items-center justify-center">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 backdrop-blur-md border border-white/20 rounded-xl shadow-lg p-6 flex items-center justify-center h-[450px]">
            <Image
              src={product.image_url}
              alt={product.name}
              width={400}
              height={400}
              className="object-contain drop-shadow-lg rounded"
            />
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-lg p-8">
            <h1 className="text-4xl font-bold text-yellow-300 mb-2">{product.name}</h1>
            <p className="text-yellow-400 text-2xl font-semibold mb-4">${product.price}</p>

            <p className="text-white/80 text-base leading-relaxed mb-4">
              {product.description}
            </p>

            <ul className="list-disc pl-5 text-white/70 text-sm mb-6 space-y-1">
              {(Array.isArray(product.features)
                ? product.features
                : typeof product.features === "string"
                ? product.features.split(",")
                : []
              ).map((f, i) => (
                <li key={i}>{f.trim()}</li>
              ))}
            </ul>

            <div className="flex gap-4">
              <button
                onClick={addToCart}
                disabled={addingToCart}
                className={`px-6 py-2 rounded-md text-black font-medium text-base transition ${
                  addingToCart ? "bg-yellow-200 cursor-not-allowed" : "bg-yellow-300 hover:bg-yellow-400"
                }`}
              >
                {addingToCart ? "Adding..." : "Add to Cart"}
              </button>
              <button
                onClick={addToWishlist}
                disabled={addingToWishlist}
                className={`flex items-center gap-2 px-6 py-2 rounded-md border text-yellow-300 text-base transition ${
                  addingToWishlist ? "border-yellow-100 cursor-not-allowed" : "border-yellow-400 hover:bg-white/10"
                }`}
              >
                <HeartIcon className="h-5 w-5" />
                {addingToWishlist ? "Adding..." : "Wishlist"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
