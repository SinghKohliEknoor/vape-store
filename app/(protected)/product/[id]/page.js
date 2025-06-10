"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
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
      // Get or create wishlist
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

      // Insert into wishlist_items
      const { error: itemError } = await supabase
        .from("wishlist_items")
        .insert({
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
    return (
      <div className="min-h-screen flex justify-center items-center bg-white text-black">
        <p>Loading...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-white text-black">
        <p>Product not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black p-8 max-w-5xl mx-auto">
      <button
        onClick={() => router.back()}
        className="bg-yellow-300 hover:bg-yellow-400 text-black px-4 py-2 rounded-md font-medium mb-6"
      >
        ← Back
      </button>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <div className="relative w-full lg:w-1/2 h-[400px] bg-gray-200 rounded-lg">
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-contain p-6"
          />
        </div>

        <div className="flex-1 space-y-4">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-yellow-600 text-xl font-semibold">${product.price}</p>
          <p className="text-gray-700">{product.description}</p>

          <ul className="list-disc pl-5 text-gray-600">
            {(Array.isArray(product.features)
              ? product.features
              : typeof product.features === "string"
              ? product.features.split(",")
              : []
            ).map((f, i) => (
              <li key={i}>{f.trim()}</li>
            ))}
          </ul>

          <div className="flex gap-4 mt-6">
            <button
              onClick={addToCart}
              disabled={addingToCart}
              className={`px-6 py-2 rounded-md text-black font-medium ${
                addingToCart
                  ? "bg-yellow-200 cursor-not-allowed"
                  : "bg-yellow-300 hover:bg-yellow-400"
              }`}
            >
              {addingToCart ? "Adding..." : "Add to Cart"}
            </button>
            <button
              onClick={addToWishlist}
              disabled={addingToWishlist}
              className={`flex items-center gap-2 px-6 py-2 rounded-md border text-yellow-600 ${
                addingToWishlist
                  ? "border-yellow-200 cursor-not-allowed"
                  : "border-yellow-400 hover:bg-yellow-100"
              }`}
            >
              <HeartIcon className="h-5 w-5" />
              {addingToWishlist ? "Adding..." : "Wishlist"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
