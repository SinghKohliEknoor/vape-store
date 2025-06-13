// "use client";

// import Image from "next/image";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { useEffect, useState, useRef } from "react";
// import { supabase } from "@/lib/supabaseClient";
// import {
//   HeartIcon as HeartOutline,
//   MagnifyingGlassIcon,
// } from "@heroicons/react/24/outline";
// import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
// import BrandPromise from "app/components/BrandPromise";

// // FadeInOnScroll - wraps children and fades them in when scrolled into view
// function FadeInOnScroll({ children }) {
//   const ref = useRef(null);
//   const [visible, setVisible] = useState(false);

//   useEffect(() => {
//     const el = ref.current;
//     if (!el) return;
//     const observer = new IntersectionObserver(
//       ([entry]) => {
//         if (entry.isIntersecting) {
//           setVisible(true);
//           observer.unobserve(el);
//         }
//       },
//       { threshold: 0.1 }
//     );
//     observer.observe(el);
//     return () => observer.disconnect();
//   }, []);

//   return (
//     <div
//       ref={ref}
//       className={`transition-all duration-700 ease-out ${
//         visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
//       }`}
//     >
//       {children}
//     </div>
//   );
// }

// export default function Home() {
//   const router = useRouter();
//   const [user, setUser] = useState(null);
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // new states for cart & wishlist
//   const [cartId, setCartId] = useState(null);
//   const [cartMap, setCartMap] = useState({});
//   const [wishlistId, setWishlistId] = useState(null);
//   const [wishlistSet, setWishlistSet] = useState(new Set());

//   const [processingId, setProcessingId] = useState(null);
//   const [errorMessage, setErrorMessage] = useState("");
//   const [searchQuery, setSearchQuery] = useState("");

//   // Auth guard + load user
//   useEffect(() => {
//     supabase.auth.getSession().then(({ data }) => {
//       if (!data.session) return router.push("/signin");
//       setUser(data.session.user);
//     });
//     const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
//       if (!session) router.push("/signin");
//       else setUser(session.user);
//     });
//     return () => listener?.subscription.unsubscribe();
//   }, [router]);

//   // Fetch products once
//   useEffect(() => {
//     (async () => {
//       const { data, error } = await supabase.from("products").select("*");
//       if (error) setErrorMessage("Failed to load products.");
//       else setProducts(data);
//       setLoading(false);
//     })();
//   }, []);

//   // Once user is set, fetch existing cart & wishlist
//   useEffect(() => {
//     if (!user) return;

//     // fetch cart + items
//     (async () => {
//       const { data: cart, error: cartErr } = await supabase
//         .from("carts")
//         .select("id")
//         .eq("user_id", user.id)
//         .single();
//       if (cart?.id) {
//         setCartId(cart.id);
//         const { data: items } = await supabase
//           .from("cart_items")
//           .select("product_id,quantity")
//           .eq("cart_id", cart.id);
//         const map = {};
//         items.forEach((i) => (map[i.product_id] = i.quantity));
//         setCartMap(map);
//       }
//     })();

//     // fetch wishlist + items
//     (async () => {
//       const { data: wl, error: wlErr } = await supabase
//         .from("wishlists")
//         .select("id")
//         .eq("user_id", user.id)
//         .single();
//       if (wl?.id) {
//         setWishlistId(wl.id);
//         const { data: witems } = await supabase
//           .from("wishlist_items")
//           .select("product_id")
//           .eq("wishlist_id", wl.id);
//         setWishlistSet(new Set(witems.map((i) => i.product_id)));
//       }
//     })();
//   }, [user]);

//   const handleLogout = async () => {
//     await supabase.auth.signOut();
//     router.push("/");
//   };

//   // Add to cart
//   const addToCart = async (productId) => {
//     setProcessingId(productId);
//     if (!cartId) {
//       const { data: newCart } = await supabase
//         .from("carts")
//         .insert({ user_id: user.id })
//         .select("id")
//         .single();
//       setCartId(newCart.id);
//     }
//     await supabase.from("cart_items").insert({
//       cart_id: cartId,
//       product_id: productId,
//       quantity: 1,
//     });
//     setCartMap((m) => ({ ...m, [productId]: 1 }));
//     setProcessingId(null);
//   };

//   // Update cart quantity
//   const updateCartQty = async (productId, delta) => {
//     const newQty = (cartMap[productId] || 0) + delta;
//     if (newQty < 1) {
//       await supabase
//         .from("cart_items")
//         .delete()
//         .match({ cart_id: cartId, product_id: productId });
//       setCartMap((m) => {
//         const nm = { ...m };
//         delete nm[productId];
//         return nm;
//       });
//     } else {
//       await supabase
//         .from("cart_items")
//         .update({ quantity: newQty })
//         .match({ cart_id: cartId, product_id: productId });
//       setCartMap((m) => ({ ...m, [productId]: newQty }));
//     }
//   };

//   // Add to wishlist
//   const addToWishlist = async (productId) => {
//     setProcessingId(productId);
//     if (!wishlistId) {
//       const { data: newWl } = await supabase
//         .from("wishlists")
//         .insert({ user_id: user.id, name: "My Wishlist" })
//         .select("id")
//         .single();
//       setWishlistId(newWl.id);
//     }
//     await supabase.from("wishlist_items").insert({
//       wishlist_id: wishlistId,
//       product_id: productId,
//     });
//     setWishlistSet((s) => new Set(s).add(productId));
//     setProcessingId(null);
//   };

//   // Remove from wishlist
//   const removeFromWishlist = async (productId) => {
//     setProcessingId(productId);
//     await supabase
//       .from("wishlist_items")
//       .delete()
//       .match({ wishlist_id: wishlistId, product_id: productId });
//     setWishlistSet((s) => {
//       const ns = new Set(s);
//       ns.delete(productId);
//       return ns;
//     });
//     setProcessingId(null);
//   };

//   const filteredProducts = products.filter((p) =>
//     p.name.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   if (!user || loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-black text-white">
//         <p>Loading...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
//       {/* Header */}
//       <header className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-white/10 backdrop-blur-md border border-white/20 px-8 py-4 shadow-2xl rounded-full w-[92%] max-w-6xl">
//   <div className="flex items-center justify-between">
//     <div className="flex items-center space-x-3">
//       <Image src="/Logo.png" width={80} height={80} alt="Logo" />
//       <h1 className="text-3xl font-bold text-yellow-300">Vape Vault</h1>
//     </div>
//     <div className="relative mx-auto w-full max-w-md">
//       <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/60" />
//       <input
//         type="text"
//         placeholder="Search products..."
//         value={searchQuery}
//         onChange={(e) => setSearchQuery(e.target.value)}
//         className="w-full rounded-full border border-white/30 bg-white/10 px-10 py-2 text-sm text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-yellow-400 backdrop-blur-sm"
//       />
//     </div>
//     <nav className="flex items-center space-x-6 text-lg text-white">
//       <Link href="/account" className="hover:text-yellow-400">
//         My Account
//       </Link>
//       <Link href="/wishlist" className="hover:text-yellow-400">
//         Wishlist
//       </Link>
//       <Link href="/cart" className="hover:text-yellow-400">
//         Cart
//       </Link>
//       <button
//         onClick={handleLogout}
//         className="rounded-full bg-yellow-300 px-4 py-2 text-black hover:bg-yellow-400 font-medium shadow-sm"
//       >
//         Logout
//       </button>
//     </nav>
//   </div>
// </header>

//       {/* Hero */}
//       <main className="relative pt-52 px-6 pb-20 text-center overflow-hidden flex-1">
//         <div
//           className="absolute inset-0 bg-cover bg-center"
//           style={{ backgroundImage: `url('/vape_back.png')` }}
//         ></div>
//         <div className="absolute inset-0 bg-black/50 z-0"></div>
//         <div className="relative z-10 mx-auto max-w-4xl p-8 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
//           <h2 className="text-5xl font-bold mb-6 text-white drop-shadow-lg">
//             Discover Your Next Favorite Vape
//           </h2>
//           <p className="text-xl text-white max-w-2xl mx-auto mb-8">
//             Premium vape products, stylish designs, and smooth flavors – all in
//             one place.
//           </p>
//           <Link href="#products">
//             <button
//               className="bg-yellow-300 hover:bg-yellow-400 px-6 py-3 rounded-full text-lg font-medium text-black transition"
//               aria-label="Browse Products"
//             >
//               Browse Products
//             </button>
//           </Link>
//         </div>
//       </main>
//       <section className="pt-8">
//         <BrandPromise />
//       </section>

//       {/* Products */}
//       <section id="products" className="px-6 pb-20">
//         <h3 className="mb-12 mt-5 text-center text-4xl font-semibold text-yellow-300">
//           Our Collection
//         </h3>
//         {errorMessage && (
//           <p className="mb-6 text-center text-red-400">{errorMessage}</p>
//         )}
//         <div className="grid gap-8 pl-40 pr-40 sm:grid-cols-2 lg:grid-cols-4">
//           {filteredProducts.map((product) => (
//             <FadeInOnScroll key={product.id}>
//               <div
//                 onClick={() => router.push(`/product/${product.id}`)}
//                 className="cursor-pointer bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all flex flex-col"
//               >
//                 <div className="relative h-64 bg-gray-100">
//                   <Image
//                     src={product.image_url}
//                     alt={product.name}
//                     fill
//                     loading="lazy"
//                     className="object-contain p-4"
//                   />
//                 </div>
//                 <div className="p-4 flex flex-col">
//                   <h4 className="text-xl font-bold mb-4 text-white">
//                     {product.name}
//                   </h4>
//                   <p className="text-yellow-300 text-lg font-semibold mb-4">
//                     ${product.price}
//                   </p>
//                   <div className="mt-auto flex items-center space-x-2">
//                     {cartMap[product.id] ? (
//                       <>
//                         <button
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             updateCartQty(product.id, -1);
//                           }}
//                           className="bg-yellow-300 hover:bg-yellow-400 px-2 py-1 rounded"
//                         >
//                           −
//                         </button>
//                         <span>{cartMap[product.id]}</span>
//                         <button
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             updateCartQty(product.id, +1);
//                           }}
//                           className="bg-yellow-300 hover:bg-yellow-400 px-2 py-1 rounded"
//                         >
//                           +
//                         </button>
//                       </>
//                     ) : (
//                       <button
//                         disabled={processingId === product.id}
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           addToCart(product.id);
//                         }}
//                         className="flex-1 bg-yellow-300 hover:bg-yellow-400 py-2 rounded-md text-sm font-medium text-black transition-opacity disabled:opacity-50"
//                       >
//                         Add to Cart
//                       </button>
//                     )}
//                     <button
//                       disabled={processingId === product.id}
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         wishlistSet.has(product.id)
//                           ? removeFromWishlist(product.id)
//                           : addToWishlist(product.id);
//                       }}
//                       className="rounded-md p-2 hover:bg-yellow-100 transition-opacity disabled:opacity-50"
//                       title={
//                         wishlistSet.has(product.id)
//                           ? "Remove from Wishlist"
//                           : "Add to Wishlist"
//                       }
//                     >
//                       {wishlistSet.has(product.id) ? (
//                         <HeartSolid className="h-5 w-5 text-yellow-400" />
//                       ) : (
//                         <HeartOutline className="h-5 w-5 text-yellow-400" />
//                       )}
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </FadeInOnScroll>
//           ))}
//         </div>
//       </section>

//       {/* Footer */}
//       <footer className="bg-white/10 backdrop-blur-md border-t border-white/20 p-6 text-center text-sm text-white/70">
//         &copy; {new Date().getFullYear()} Vape Vault. All rights reserved.
//       </footer>
//     </div>
//   );
// }
"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  HeartIcon as HeartOutline,
  MagnifyingGlassIcon,
  PlusIcon,
  MinusIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import BrandPromise from "app/components/BrandPromise";

// Fade-in wrapper
function FadeInOnScroll({ children }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
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
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // cart & wishlist state
  const [cartId, setCartId] = useState(null);
  const [cartMap, setCartMap] = useState({});
  const [wishlistId, setWishlistId] = useState(null);
  const [wishlistSet, setWishlistSet] = useState(new Set());

  const [processingId, setProcessingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // auth guard
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) return router.push("/signin");
      setUser(data.session.user);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session) router.push("/signin");
      else setUser(session.user);
    });
    return () => sub?.subscription.unsubscribe();
  }, [router]);

  // fetch products
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("products").select("*");
      if (error) setErrorMessage("Failed to load products.");
      else setProducts(data);
      setLoading(false);
    })();
  }, []);

  // fetch cart + wishlist once user is ready
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
        const m = {};
        items.forEach((i) => (m[i.product_id] = i.quantity));
        setCartMap(m);
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

  // cart operations
  const addToCart = async (pid) => {
    setProcessingId(pid);
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
      product_id: pid,
      quantity: 1,
    });
    setCartMap((m) => ({ ...m, [pid]: 1 }));
    setProcessingId(null);
  };
  const updateCartQty = async (pid, delta) => {
    const newQty = (cartMap[pid] || 0) + delta;
    if (newQty < 1) {
      await supabase
        .from("cart_items")
        .delete()
        .match({ cart_id: cartId, product_id: pid });
      setCartMap((m) => {
        const nm = { ...m };
        delete nm[pid];
        return nm;
      });
    } else {
      await supabase
        .from("cart_items")
        .update({ quantity: newQty })
        .match({ cart_id: cartId, product_id: pid });
      setCartMap((m) => ({ ...m, [pid]: newQty }));
    }
  };

  // wishlist ops
  const addToWishlist = async (pid) => {
    setProcessingId(pid);
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
      product_id: pid,
    });
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
      const ns = new Set(s);
      ns.delete(pid);
      return ns;
    });
    setProcessingId(null);
  };

  const filtered = products.filter((p) =>
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
      {/* header */}
      <header className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-white/10 backdrop-blur-lg border border-white/20 px-8 py-4 shadow-2xl rounded-3xl w-[92%] max-w-6xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Image src="/Logo.png" width={60} height={60} alt="Vape Vault" />
          <h1 className="text-2xl font-bold text-yellow-300">Vape Vault</h1>
        </div>
        <div className="relative w-full max-w-md mx-8">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-white/30 bg-white/10 px-10 py-2 text-sm text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-yellow-400 backdrop-blur-sm"
          />
        </div>
        <nav className="flex items-center space-x-6">
          <Link href="/account" className="hover:text-yellow-400">My Account</Link>
          <Link href="/wishlist" className="hover:text-yellow-400">Wishlist</Link>
          <Link href="/cart" className="hover:text-yellow-400">Cart</Link>
          <button
            onClick={handleLogout}
            className="rounded-full bg-yellow-300 px-4 py-2 text-black hover:bg-yellow-400 transition"
          >
            Logout
          </button>
        </nav>
      </header>

      {/* hero */}
      <main className="relative pt-52 px-6 pb-20 text-center flex-1 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('/vape_back.png')` }}
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 mx-auto max-w-4xl p-8 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
          <h2 className="text-5xl font-bold mb-6 text-white drop-shadow-lg">
            Discover Your Next Favorite Vape
          </h2>
          <p className="text-xl text-white max-w-2xl mx-auto mb-8">
            Premium vape products, stylish designs, and smooth flavors – all in one place.
          </p>
          <Link href="#products">
            <button className="bg-yellow-300 hover:bg-yellow-400 px-6 py-3 rounded-full text-lg font-medium text-black">
              Browse Products
            </button>
          </Link>
        </div>
      </main>

      <section className="pt-8">
        <BrandPromise />
      </section>

      {/* products */}
      <section id="products" className="px-6 pb-20">
        <h3 className="text-center text-4xl font-semibold text-yellow-300 mb-12">
          Our Collection
        </h3>
        {errorMessage && (
          <p className="text-center text-red-400 mb-6">{errorMessage}</p>
        )}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 px-10">
          {filtered.map((p) => (
            <FadeInOnScroll key={p.id}>
              <div
                onClick={() => router.push(`/product/${p.id}`)}
                className="cursor-pointer bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition flex flex-col"
              >
                <div className="relative h-64 bg-gray-100">
                  <Image
                    src={p.image_url}
                    alt={p.name}
                    fill
                    className="object-contain p-4"
                  />
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h4 className="text-xl font-bold mb-2 text-white">{p.name}</h4>
                  <p className="text-yellow-300 text-lg font-semibold mb-4">
                    ${p.price}
                  </p>
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
                        <span className="px-2 text-white">{cartMap[p.id]}</span>
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
      </section>

      {/* footer */}
      <footer className="bg-white/10 backdrop-blur-md border-t border-white/20 p-6 text-center text-sm text-white/70">
        © {new Date().getFullYear()} Vape Vault. All rights reserved.
      </footer>
    </div>
  );
}
