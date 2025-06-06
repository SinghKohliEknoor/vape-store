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
    };

    fetchUserAndProduct();
  }, [id, router]);

  const addToCart = async () => {
    try {
      let { data: cart, error: cartError } = await supabase
        .from("carts")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (cartError && cartError.code === "PGRST116") {
        const { data: newCart } = await supabase
          .from("carts")
          .insert({ user_id: user.id })
          .select("id")
          .single();
        cart = newCart;
      }

      await supabase.from("cart_items").insert({
        cart_id: cart.id,
        product_id: product.id,
        quantity: 1,
      });

      alert("Added to cart!");
    } catch (error) {
      console.error(error);
      alert("Failed to add to cart");
    }
  };

  const addToWishlist = async () => {
    try {
      await supabase.from("wishlists").insert({
        user_id: user.id,
        product_id: product.id,
      });
      alert("Added to wishlist!");
    } catch (error) {
      console.error(error);
      alert("Failed to add to wishlist");
    }
  };

  if (!product) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-white text-black">
        <p>Loading...</p>
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
          <p className="text-yellow-600 text-xl font-semibold">
            ${product.price}
          </p>
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
              className="bg-yellow-300 hover:bg-yellow-400 px-6 py-2 rounded-md text-black font-medium"
            >
              Add to Cart
            </button>
            <button
              onClick={addToWishlist}
              className="flex items-center gap-2 px-6 py-2 rounded-md border border-yellow-400 text-yellow-600 hover:bg-yellow-100"
            >
              <HeartIcon className="h-5 w-5" />
              Wishlist
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
