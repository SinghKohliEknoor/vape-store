"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  HeartIcon as HeartOutline,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import BrandPromise from "app/components/BrandPromise";

// FadeInOnScroll - wraps children and fades them in when scrolled into view
function FadeInOnScroll({ children }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      {children}
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // new states for cart & wishlist
  const [cartId, setCartId] = useState(null);
  const [cartMap, setCartMap] = useState({});
  const [wishlistId, setWishlistId] = useState(null);
  const [wishlistSet, setWishlistSet] = useState(new Set());

  const [processingId, setProcessingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Auth guard + load user
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) return router.push("/signin");
      setUser(data.session.user);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session) router.push("/signin");
      else setUser(session.user);
    });
    return () => listener?.subscription.unsubscribe();
  }, [router]);

  // Fetch products once
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("products").select("*");
      if (error) setErrorMessage("Failed to load products.");
      else setProducts(data);
      setLoading(false);
    })();
  }, []);

  // Once user is set, fetch existing cart & wishlist
  useEffect(() => {
    if (!user) return;

    // fetch cart + items
    (async () => {
      const { data: cart, error: cartErr } = await supabase
        .from("carts")
        .select("id")
        .eq("user_id", user.id)
        .single();
      if (cart?.id) {
        setCartId(cart.id);
        const { data: items } = await supabase
          .from("cart_items")
          .select("product_id,quantity")
          .eq("cart_id", cart.id);
        const map = {};
        items.forEach((i) => (map[i.product_id] = i.quantity));
        setCartMap(map);
      }
    })();

    // fetch wishlist + items
    (async () => {
      const { data: wl, error: wlErr } = await supabase
        .from("wishlists")
        .select("id")
        .eq("user_id", user.id)
        .single();
      if (wl?.id) {
        setWishlistId(wl.id);
        const { data: witems } = await supabase
          .from("wishlist_items")
          .select("product_id")
          .eq("wishlist_id", wl.id);
        setWishlistSet(new Set(witems.map((i) => i.product_id)));
      }
    })();
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  // Add to cart
  const addToCart = async (productId) => {
    setProcessingId(productId);
    if (!cartId) {
      const { data: newCart } = await supabase
        .from("carts")
        .insert({ user_id: user.id })
        .select("id")
        .single();
      setCartId(newCart.id);
    }
    await supabase.from("cart_items").insert({
      cart_id: cartId,
      product_id: productId,
      quantity: 1,
    });
    setCartMap((m) => ({ ...m, [productId]: 1 }));
    setProcessingId(null);
  };

  // Update cart quantity
  const updateCartQty = async (productId, delta) => {
    const newQty = (cartMap[productId] || 0) + delta;
    if (newQty < 1) {
      await supabase
        .from("cart_items")
        .delete()
        .match({ cart_id: cartId, product_id: productId });
      setCartMap((m) => {
        const nm = { ...m };
        delete nm[productId];
        return nm;
      });
    } else {
      await supabase
        .from("cart_items")
        .update({ quantity: newQty })
        .match({ cart_id: cartId, product_id: productId });
      setCartMap((m) => ({ ...m, [productId]: newQty }));
    }
  };

  // Add to wishlist
  const addToWishlist = async (productId) => {
    setProcessingId(productId);
    if (!wishlistId) {
      const { data: newWl } = await supabase
        .from("wishlists")
        .insert({ user_id: user.id, name: "My Wishlist" })
        .select("id")
        .single();
      setWishlistId(newWl.id);
    }
    await supabase.from("wishlist_items").insert({
      wishlist_id: wishlistId,
      product_id: productId,
    });
    setWishlistSet((s) => new Set(s).add(productId));
    setProcessingId(null);
  };

  // Remove from wishlist
  const removeFromWishlist = async (productId) => {
    setProcessingId(productId);
    await supabase
      .from("wishlist_items")
      .delete()
      .match({ wishlist_id: wishlistId, product_id: productId });
    setWishlistSet((s) => {
      const ns = new Set(s);
      ns.delete(productId);
      return ns;
    });
    setProcessingId(null);
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Header */}
      <header className="fixed inset-x-0 top-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/20 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Image src="/Logo.png" width={80} height={80} alt="Logo" />
            <h1 className="text-3xl font-bold text-yellow-300">Vape Vault</h1>
          </div>
          <div className="relative mx-auto w-full max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/60" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-white/30 bg-white/10 px-10 py-2 text-sm text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
          <nav className="flex items-center space-x-6 text-lg">
            <Link href="/account" className="hover:text-yellow-400">
              My Account
            </Link>
            <Link href="/wishlist" className="hover:text-yellow-400">
              Wishlist
            </Link>
            <Link href="/cart" className="hover:text-yellow-400">
              Cart
            </Link>
            <button
              onClick={handleLogout}
              className="rounded-md bg-yellow-300 px-4 py-2 text-black hover:bg-yellow-400"
            >
              Logout
            </button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="relative pt-52 px-6 pb-20 text-center overflow-hidden flex-1">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('/vape_back.png')` }}
        ></div>
        <div className="absolute inset-0 bg-black/50 z-0"></div>
        <div className="relative z-10 mx-auto max-w-4xl p-8 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
          <h2 className="text-5xl font-bold mb-6 text-white drop-shadow-lg">
            Discover Your Next Favorite Vape
          </h2>
          <p className="text-xl text-white max-w-2xl mx-auto mb-8">
            Premium vape products, stylish designs, and smooth flavors – all in
            one place.
          </p>
          <Link href="#products">
            <button
              className="bg-yellow-300 hover:bg-yellow-400 px-6 py-3 rounded-full text-lg font-medium text-black transition"
              aria-label="Browse Products"
            >
              Browse Products
            </button>
          </Link>
        </div>
      </main>
      <section className="pt-8">
        <BrandPromise />
      </section>

      {/* Products */}
      <section id="products" className="px-6 pb-20">
        <h3 className="mb-12 text-center text-4xl font-semibold text-yellow-300">
          Our Collection
        </h3>
        {errorMessage && (
          <p className="mb-6 text-center text-red-400">{errorMessage}</p>
        )}
        <div className="grid gap-8 pl-40 pr-40 sm:grid-cols-2 lg:grid-cols-4">
          {filteredProducts.map((product) => (
            <FadeInOnScroll key={product.id}>
              <div
                onClick={() => router.push(`/product/${product.id}`)}
                className="cursor-pointer bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all flex flex-col"
              >
                <div className="relative h-64 bg-gray-100">
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    loading="lazy"
                    className="object-contain p-4"
                  />
                </div>
                <div className="p-4 flex flex-col">
                  <h4 className="text-xl font-bold mb-4 text-white">
                    {product.name}
                  </h4>
                  <p className="text-yellow-300 text-lg font-semibold mb-4">
                    ${product.price}
                  </p>
                  <div className="mt-auto flex items-center space-x-2">
                    {cartMap[product.id] ? (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateCartQty(product.id, -1);
                          }}
                          className="bg-yellow-300 hover:bg-yellow-400 px-2 py-1 rounded"
                        >
                          −
                        </button>
                        <span>{cartMap[product.id]}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateCartQty(product.id, +1);
                          }}
                          className="bg-yellow-300 hover:bg-yellow-400 px-2 py-1 rounded"
                        >
                          +
                        </button>
                      </>
                    ) : (
                      <button
                        disabled={processingId === product.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product.id);
                        }}
                        className="flex-1 bg-yellow-300 hover:bg-yellow-400 py-2 rounded-md text-sm font-medium text-black transition-opacity disabled:opacity-50"
                      >
                        Add to Cart
                      </button>
                    )}
                    <button
                      disabled={processingId === product.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        wishlistSet.has(product.id)
                          ? removeFromWishlist(product.id)
                          : addToWishlist(product.id);
                      }}
                      className="rounded-md p-2 hover:bg-yellow-100 transition-opacity disabled:opacity-50"
                      title={
                        wishlistSet.has(product.id)
                          ? "Remove from Wishlist"
                          : "Add to Wishlist"
                      }
                    >
                      {wishlistSet.has(product.id) ? (
                        <HeartSolid className="h-5 w-5 text-yellow-400" />
                      ) : (
                        <HeartOutline className="h-5 w-5 text-yellow-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </FadeInOnScroll>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white/10 backdrop-blur-md border-t border-white/20 p-6 text-center text-sm text-white/70">
        &copy; {new Date().getFullYear()} Vape Vault. All rights reserved.
      </footer>
    </div>
  );
}
