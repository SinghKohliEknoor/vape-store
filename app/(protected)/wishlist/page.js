// "use client";

// import { useEffect, useState } from "react";
// import { supabase } from "@/lib/supabaseClient";
// import { useRouter } from "next/navigation";
// import Image from "next/image";
// import Link from "next/link";

// export default function WishlistPage() {
//   const [user, setUser] = useState(null);
//   const [items, setItems] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();

//   useEffect(() => {
//     const fetchWishlist = async () => {
//       // 1) Check session
//       const { data: sessionData } = await supabase.auth.getSession();
//       if (!sessionData.session) {
//         router.push("/signin");
//         return;
//       }
//       setUser(sessionData.session.user);

//       // 2) Fetch the user’s default wishlist (name = "My Wishlist")
//       let { data: wishlist, error: wlError } = await supabase
//         .from("wishlists")
//         .select("id")
//         .eq("user_id", sessionData.session.user.id)
//         .single();

//       if (wlError && wlError.code === "PGRST116") {
//         // No wishlist found → empty state
//         setItems([]);
//         setLoading(false);
//         return;
//       } else if (wlError) {
//         console.error("Error loading wishlist:", wlError.message);
//         setLoading(false);
//         return;
//       }

//       // 3) Now fetch wishlist_items + product details in one go
//       const { data: wlItems, error: itemsError } = await supabase
//         .from("wishlist_items")
//         .select(
//           `
//           id,
//           product_id,
//           products (
//             id,
//             name,
//             price,
//             image_url
//           )
//         `
//         )
//         .eq("wishlist_id", wishlist.id);

//       if (itemsError) {
//         console.error("Error loading wishlist items:", itemsError.message);
//       } else {
//         setItems(wlItems);
//       }

//       setLoading(false);
//     };

//     fetchWishlist();
//   }, [router]);

//   // 4) Remove one item from wishlist
//   const removeItem = async (itemId) => {
//     const { error } = await supabase
//       .from("wishlist_items")
//       .delete()
//       .eq("id", itemId);
//     if (error) {
//       console.error("Error removing item:", error.message);
//     } else {
//       setItems((prev) => prev.filter((i) => i.id !== itemId));
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center text-black bg-white">
//         <p>Loading wishlist...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-white text-black flex flex-col">
//       {/* ─── HEADER ───────────────────────────────────────────────────── */}
//       <header className="flex justify-between items-center px-6 py-4 border-b border-gray-200 shadow-sm bg-white">
//         <div className="flex items-center space-x-3">
//           <Link href="/home" className="flex items-center space-x-3">
//             <Image
//               src="/Logo.png"
//               alt="Vape Vault Logo"
//               width={80}
//               height={80}
//             />
//             <h1 className="text-3xl font-bold text-gray-700">Vape Vault</h1>
//           </Link>
//         </div>
//         <nav className="space-x-6 text-lg flex items-center">
//           <Link href="/account" className="hover:text-yellow-400 transition">
//             My Account
//           </Link>
//           <Link href="/wishlist" className="text-yellow-600 font-medium">
//             Wishlist
//           </Link>
//           <Link href="/cart" className="hover:text-yellow-400 transition">
//             Cart
//           </Link>
//         </nav>
//       </header>

//       {/* ─── CONTENT ─────────────────────────────────────────────────── */}
//       <main className="flex-1 px-6 py-10">
//         <h1 className="text-3xl font-bold mb-6 text-gray-800">My Wishlist</h1>

//         {items.length === 0 ? (
//           <p className="text-gray-600">Your wishlist is empty.</p>
//         ) : (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
//             {items.map((item) => (
//               <div
//                 key={item.id}
//                 className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden shadow hover:shadow-lg transition-all flex flex-col"
//               >
//                 <div
//                   className="relative h-48 bg-gray-100"
//                   onClick={() => router.push(`/product/${item.products?.id}`)}
//                 >
//                   <Image
//                     src={item.products?.image_url || "/placeholder.png"}
//                     alt={item.products?.name || "Product image"}
//                     fill
//                     className="object-contain p-4"
//                   />
//                 </div>
//                 <div className="p-4 flex flex-col h-full">
//                   <h2
//                     className="text-lg font-semibold mb-1 cursor-pointer hover:text-yellow-500"
//                     onClick={() => router.push(`/product/${item.products?.id}`)}
//                   >
//                     {item.products?.name}
//                   </h2>
//                   <p className="text-yellow-600 font-medium mb-4">
//                     ${item.products?.price}
//                   </p>
//                   <div className="mt-auto">
//                     <button
//                       onClick={() => removeItem(item.id)}
//                       className="w-full bg-red-300 hover:bg-red-400 text-black py-2 px-4 rounded-md text-sm font-medium transition"
//                     >
//                       Remove
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </main>

//       {/* ─── FOOTER ─────────────────────────────────────────────────── */}
//       <footer className="bg-gray-100 text-gray-700 text-center p-6 text-sm border-t border-gray-200">
//         &copy; {new Date().getFullYear()} Vape Vault. All rights reserved.
//       </footer>
//     </div>
//   );
// }
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function WishlistPage() {
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchWishlist = async () => {
      // 1) Check session
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        router.push("/signin");
        return;
      }
      setUser(sessionData.session.user);

      // 2) Fetch the user’s default wishlist (name = "My Wishlist")
      let { data: wishlist, error: wlError } = await supabase
        .from("wishlists")
        .select("id")
        .eq("user_id", sessionData.session.user.id)
        .single();

      if (wlError && wlError.code === "PGRST116") {
        // No wishlist found → empty state
        setItems([]);
        setLoading(false);
        return;
      } else if (wlError) {
        console.error("Error loading wishlist:", wlError.message);
        setLoading(false);
        return;
      }

      // 3) Now fetch wishlist_items + product details in one go
      const { data: wlItems, error: itemsError } = await supabase
        .from("wishlist_items")
        .select(
          `
          id,
          product_id,
          products (
            id,
            name,
            price,
            image_url,
            description
          )
        `
        )
        .eq("wishlist_id", wishlist.id);

      if (itemsError) {
        console.error("Error loading wishlist items:", itemsError.message);
      } else {
        setItems(wlItems);
      }

      setLoading(false);
    };

    fetchWishlist();
  }, [router]);

  // Remove one item from wishlist
  const removeItem = async (itemId) => {
    const { error } = await supabase
      .from("wishlist_items")
      .delete()
      .eq("id", itemId);
    if (error) {
      console.error("Error removing item:", error.message);
    } else {
      setItems((prev) => prev.filter((i) => i.id !== itemId));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-black bg-white">
        <p>Loading wishlist...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      {/* ─── HEADER ───────────────────────────────────────────────────── */}
      <header className="flex justify-between items-center px-6 py-4 border-b border-gray-200 shadow-sm bg-white">
        <Link href="/home" className="flex items-center space-x-3">
          <Image src="/Logo.png" alt="Vape Vault Logo" width={80} height={80} />
          <h1 className="text-3xl font-bold text-gray-700">Vape Vault</h1>
        </Link>
        <nav className="space-x-6 text-lg flex items-center">
          <Link href="/account" className="hover:text-yellow-400 transition">
            My Account
          </Link>
          <Link href="/wishlist" className="text-yellow-600 font-medium">
            Wishlist
          </Link>
          <Link href="/cart" className="hover:text-yellow-400 transition">
            Cart
          </Link>
        </nav>
      </header>

      {/* ─── CONTENT ─────────────────────────────────────────────────── */}
      <main className="flex-1 px-6 py-10">
        <button
          onClick={() => router.back()}
          className="bg-yellow-300 hover:bg-yellow-400 text-black px-4 py-2 rounded-md font-medium mb-6"
        >
          ← Back
        </button>
        <h1 className="text-3xl font-bold mb-6 text-gray-800">My Wishlist</h1>

        {items.length === 0 ? (
          <p className="text-gray-600">Your wishlist is empty.</p>
        ) : (
          <div className="space-y-6 mr-20 ml-20">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row bg-gray-50 border border-gray-200 rounded-xl shadow-md overflow-hidden transition-shadow hover:shadow-lg"
              >
                {/* ─── IMAGE ─────────────────────────────────────────── */}
                <div
                  className="relative w-full sm:w-1/3 h-48 sm:h-auto bg-gray-100 cursor-pointer"
                  onClick={() => router.push(`/product/${item.products?.id}`)}
                >
                  <Image
                    src={item.products?.image_url || "/placeholder.png"}
                    alt={item.products?.name || "Product image"}
                    fill
                    className="object-contain p-4"
                  />
                </div>

                {/* ─── DETAILS & REMOVE BUTTON ─────────────────────── */}
                <div className="p-6 flex flex-col flex-1">
                  <h2
                    className="text-xl font-semibold mb-2 text-gray-800 cursor-pointer hover:text-yellow-500"
                    onClick={() => router.push(`/product/${item.products?.id}`)}
                  >
                    {item.products?.name}
                  </h2>
                  <p className="text-yellow-600 font-medium mb-4">
                    ${item.products?.price}
                  </p>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {item.products?.description}
                  </p>
                  <div className="mt-auto">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="bg-red-300 hover:bg-red-400 text-black py-2 px-4 rounded-md text-sm font-medium transition"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ─── FOOTER ─────────────────────────────────────────────────── */}
      <footer className="bg-gray-100 text-gray-700 text-center p-6 text-sm border-t border-gray-200">
        &copy; {new Date().getFullYear()} Vape Vault. All rights reserved.
      </footer>
    </div>
  );
}
