"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  HeartIcon as HeartOutline,
  PlusIcon,
  MinusIcon,
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import BrandPromise from "app/components/BrandPromise";
import SiteFooter from "app/components/SiteFooter";

// FadeInOnScroll — wraps children and fades them in when scrolled into view
function FadeInOnScroll({ children }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.unobserve(ref.current);
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
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
  const [loading, setLoading] = useState(true);

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const [cartId, setCartId] = useState(null);
  const [cartMap, setCartMap] = useState({});
  const [wishlistId, setWishlistId] = useState(null);
  const [wishlistSet, setWishlistSet] = useState(new Set());

  const [processingId, setProcessingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  // Auth guard
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) return router.replace("/signin");
      setUser(data.session.user);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session) router.replace("/signin");
      else setUser(session.user);
    });
    return () => sub?.subscription.unsubscribe();
  }, [router]);

  // Fetch categories + products
  useEffect(() => {
    (async () => {
      const [pRes, cRes] = await Promise.all([
        supabase.from("products").select("*"),
        supabase.from("categories").select("*"),
      ]);
      setProducts(pRes.data || []);
      setCategories(cRes.data || []);
      setLoading(false);
    })();
  }, []);

  // Fetch cart + wishlist
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: cart } = await supabase
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
        setCartMap(
          items.reduce((m, i) => ({ ...m, [i.product_id]: i.quantity }), {})
        );
      }
    })();
    (async () => {
      const { data: wl } = await supabase
        .from("wishlists")
        .select("id")
        .eq("user_id", user.id)
        .single();
      if (wl?.id) {
        setWishlistId(wl.id);
        const { data: wItems } = await supabase
          .from("wishlist_items")
          .select("product_id")
          .eq("wishlist_id", wl.id);
        setWishlistSet(new Set(wItems.map((w) => w.product_id)));
      }
    })();
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  // Cart ops
  const addToCart = async (pid) => {
    setProcessingId(pid);
    const prod = products.find((p) => p.id === pid);
    const now = cartMap[pid] || 0;
    if (!prod || now >= prod.stock_quantity) {
      alert(`Only ${prod?.stock_quantity ?? 0} left in stock`);
      setProcessingId(null);
      return;
    }
    if (!cartId) {
      const { data: nc } = await supabase
        .from("carts")
        .insert({ user_id: user.id })
        .select("id")
        .single();
      setCartId(nc.id);
    }
    await supabase.from("cart_items").insert({
      cart_id: cartId,
      product_id: pid,
      quantity: 1,
    });
    setCartMap((m) => ({ ...m, [pid]: now + 1 }));
    setProcessingId(null);
  };
  const updateCartQty = async (pid, delta) => {
    const prod = products.find((p) => p.id === pid);
    const now = cartMap[pid] || 0;
    const nxt = now + delta;
    if (nxt < 1) {
      await supabase
        .from("cart_items")
        .delete()
        .match({ cart_id: cartId, product_id: pid });
      const m2 = { ...cartMap };
      delete m2[pid];
      setCartMap(m2);
    } else if (nxt <= prod.stock_quantity) {
      await supabase
        .from("cart_items")
        .update({ quantity: nxt })
        .match({ cart_id: cartId, product_id: pid });
      setCartMap((m) => ({ ...m, [pid]: nxt }));
    } else {
      alert(`Only ${prod.stock_quantity} left in stock`);
    }
  };

  // Wishlist ops
  const addToWishlist = async (pid) => {
    setProcessingId(pid);
    if (!wishlistId) {
      const { data: nw } = await supabase
        .from("wishlists")
        .insert({ user_id: user.id, name: "My Wishlist" })
        .select("id")
        .single();
      setWishlistId(nw.id);
    }
    await supabase
      .from("wishlist_items")
      .insert({ wishlist_id: wishlistId, product_id: pid });
    setWishlistSet((s) => new Set(s).add(pid));
    setProcessingId(null);
  };
  const removeFromWishlist = async (pid) => {
    setProcessingId(pid);
    await supabase
      .from("wishlist_items")
      .delete()
      .match({ wishlist_id: wishlistId, product_id: pid });
    setWishlistSet((s) => {
      const s2 = new Set(s);
      s2.delete(pid);
      return s2;
    });
    setProcessingId(null);
  };

  // Filtering + sorting
  let visibleProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  if (categoryFilter)
    visibleProducts = visibleProducts.filter(
      (p) => p.category_id === categoryFilter
    );
  if (brandFilter)
    visibleProducts = visibleProducts.filter((p) => p.brand === brandFilter);
  if (sortBy === "priceAsc") visibleProducts.sort((a, b) => a.price - b.price);
  else if (sortBy === "priceDesc")
    visibleProducts.sort((a, b) => b.price - a.price);
  else if (sortBy === "nameAsc")
    visibleProducts.sort((a, b) => a.name.localeCompare(b.name));
  else if (sortBy === "nameDesc")
    visibleProducts.sort((a, b) => b.name.localeCompare(a.name));

  const brandOptions = [
    ...new Set(
      products
        .filter((p) => !categoryFilter || p.category_id === categoryFilter)
        .map((p) => p.brand)
    ),
  ];

  if (!user || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      {/* ——— Header (search + nav) ——— */}
      <header className="fixed inset-x-0 top-4 z-50 w-[92%] max-w-6xl mx-auto bg-black/60 backdrop-blur-lg border border-white/20 rounded-3xl px-8 py-4 flex items-center justify-between shadow-2xl">
        <div className="flex items-center space-x-3">
          <Image src="/Logo.png" width={60} height={60} alt="Vape Vault" />
          <h1 className="text-2xl font-bold text-yellow-300">Vape Vault</h1>
        </div>
        <div className="relative w-full max-w-lg mx-4">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
          <input
            type="text"
            placeholder="Search products…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2 rounded-full bg-white/20 border border-white/30 placeholder-white/60 text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
          <EllipsisVerticalIcon
            onClick={() => setShowFilterMenu((v) => !v)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white cursor-pointer"
          />
          {showFilterMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-black text-white border border-white/30 rounded-xl p-4 z-50 shadow-xl">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full mb-2 rounded bg-black border border-white/20 p-2 text-sm"
              >
                <option value="">Sort by…</option>
                <option value="priceAsc">Price: Low → High</option>
                <option value="priceDesc">Price: High → Low</option>
                <option value="nameAsc">Name: A → Z</option>
                <option value="nameDesc">Name: Z → A</option>
              </select>
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setBrandFilter("");
                }}
                className="w-full mb-2 rounded bg-black border border-white/20 p-2 text-sm"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <select
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                className="w-full rounded bg-black border border-white/20 p-2 text-sm"
              >
                <option value="">All Brands</option>
                {brandOptions.map((b, i) => (
                  <option key={i} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          )}
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
            className="bg-yellow-300 hover:bg-yellow-400 text-black px-4 py-2 rounded-md font-medium"
          >
            Logout
          </button>
        </nav>
      </header>

      <main className="pt-32 flex-1">
        {/* ——— Hero ——— */}
        <section
          className="relative h-[500px] bg-cover bg-center"
          style={{ backgroundImage: `url('/vape_back.png')` }}
        >
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
            <h1 className="text-5xl font-bold text-white mb-4">
              Discover Your Next Favorite Vape
            </h1>
            <p className="text-lg text-gray-200 max-w-2xl mb-6">
              Premium vape products, stylish designs, and smooth flavors – all
              in one place.
            </p>
            <Link href="#shop">
              <button className="bg-yellow-300 hover:bg-yellow-400 text-black px-6 py-3 rounded-full">
                Browse Categories
              </button>
            </Link>
          </div>
        </section>

        {/* ——— Brand Promise (fullscreen) ——— */}
        <section className="w-full py-16 bg-gray-900">
          <BrandPromise />
        </section>

        {/* ——— Shop by Category ——— */}
        <section id="shop" className="py-16 px-6 sm:px-8 xl:px-20">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-semibold text-center text-yellow-300 mb-10">
              Shop by Category
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-6">
              {categories.map((cat) => (
                <FadeInOnScroll key={cat.id}>
                  <div
                    onClick={() => router.push(`/category/${cat.id}`)}
                    className="relative group cursor-pointer overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition"
                  >
                    <div className="relative w-full h-40">
                      <Image
                        src={cat.image_url}
                        alt={cat.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors" />
                    <span className="absolute bottom-4 left-4 text-white font-semibold text-lg">
                      {cat.name}
                    </span>
                  </div>
                </FadeInOnScroll>
              ))}
            </div>
          </div>
        </section>

        {/* ——— Our Collection ——— */}
        <section id="products" className="py-16 px-6 sm:px-8 lg:px-10">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-semibold text-center text-yellow-300 mb-10">
              Our Collection
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {visibleProducts.map((p) => (
                <FadeInOnScroll key={p.id}>
                  <div
                    onClick={() => router.push(`/product/${p.id}`)}
                    className="cursor-pointer bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition flex flex-col"
                  >
                    <div className="relative h-64 bg-black/20">
                      <Image
                        src={p.image_url}
                        alt={p.name}
                        fill
                        className="object-contain p-4 transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="text-xl font-bold mb-1 text-white">
                        {p.name}
                      </h3>
                      <p className="text-yellow-300 text-lg font-semibold mb-2">
                        ${p.price.toFixed(2)}
                      </p>
                      {p.stock_quantity > 0 ? (
                        <p className="text-green-400 text-sm mb-4">
                          In stock: {p.stock_quantity}
                        </p>
                      ) : (
                        <p className="text-red-500 text-sm mb-4">
                          Out of stock
                        </p>
                      )}
                      <div className="mt-auto flex items-center space-x-2">
                        {cartMap[p.id] ? (
                          <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateCartQty(p.id, -1);
                              }}
                              className="p-1 hover:bg-white/20 rounded-full transition"
                            >
                              <MinusIcon className="h-4 w-4 text-white" />
                            </button>
                            <span className="px-2 text-white">
                              {cartMap[p.id]}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateCartQty(p.id, 1);
                              }}
                              className="p-1 hover:bg-white/20 rounded-full transition"
                            >
                              <PlusIcon className="h-4 w-4 text-white" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(p.id);
                            }}
                            disabled={processingId === p.id}
                            className="flex-1 bg-yellow-300 hover:bg-yellow-400 py-2 rounded-md text-sm font-medium text-black disabled:opacity-50 transition"
                          >
                            Add to Cart
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            wishlistSet.has(p.id)
                              ? removeFromWishlist(p.id)
                              : addToWishlist(p.id);
                          }}
                          disabled={processingId === p.id}
                          className="p-2 hover:bg-yellow-100 rounded-full transition disabled:opacity-50"
                        >
                          {wishlistSet.has(p.id) ? (
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
          </div>
        </section>
      </main>

      {/* ——— Footer ——— */}
      <SiteFooter />
    </div>
  );
}
