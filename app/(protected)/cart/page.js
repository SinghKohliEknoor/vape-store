// "use client";

// import { useEffect, useState } from "react";
// import { supabase } from "@/lib/supabaseClient";
// import { useRouter } from "next/navigation";

// export default function CartPage() {
//   const [user, setUser] = useState(null);
//   const [cartItems, setCartItems] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();

//   useEffect(() => {
//     const fetchUserAndCart = async () => {
//       const { data: authData } = await supabase.auth.getUser();
//       if (authData?.user) {
//         setUser(authData.user);
//         await fetchCartItems(authData.user.id);
//       } else {
//         router.push("/signin");
//       }
//     };

//     fetchUserAndCart();
//   }, [router]);

//   const fetchCartItems = async (userId) => {
//     setLoading(true);

//     const { data: cart, error: cartError } = await supabase
//       .from("carts")
//       .select("id")
//       .eq("user_id", userId)
//       .single();

//     if (cartError || !cart) {
//       console.error("Error fetching cart:", cartError?.message);
//       setCartItems([]);
//       setLoading(false);
//       return;
//     }

//     const { data: items, error: itemsError } = await supabase
//       .from("cart_items")
//       .select(
//         "id, quantity, product_id, products(name, description, image_url, price)"
//       )
//       .eq("cart_id", cart.id);

//     if (itemsError) {
//       console.error("Error fetching cart items:", itemsError.message);
//     } else {
//       setCartItems(items);
//     }

//     setLoading(false);
//   };

//   const updateQuantity = async (itemId, change) => {
//     const item = cartItems.find((i) => i.id === itemId);
//     const newQuantity = item.quantity + change;
//     if (newQuantity <= 0) return;

//     const { error } = await supabase
//       .from("cart_items")
//       .update({ quantity: newQuantity })
//       .eq("id", itemId);

//     if (error) {
//       console.error("Error updating quantity:", error.message);
//     } else {
//       setCartItems((prev) =>
//         prev.map((i) => (i.id === itemId ? { ...i, quantity: newQuantity } : i))
//       );
//     }
//   };

//   const deleteItem = async (itemId) => {
//     const { error } = await supabase
//       .from("cart_items")
//       .delete()
//       .eq("id", itemId);
//     if (error) {
//       console.error("Error deleting item:", error.message);
//     } else {
//       setCartItems((prev) => prev.filter((i) => i.id !== itemId));
//     }
//   };

//   const calculateTotal = () => {
//     return cartItems.reduce(
//       (total, item) => total + item.quantity * (item.products?.price || 0),
//       0
//     );
//   };

//   if (!user || loading) {
//     return (
//       <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
//         <p>Loading cart...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-900 text-white px-4 md:px-12 py-6">
//       <button
//         className="bg-violet-600 hover:bg-violet-700 px-4 py-2 mb-5 rounded-lg transition"
//         onClick={() => router.back()}
//       >
//         ← Back
//       </button>

//       <h1 className="text-4xl font-bold mb-6">Your Cart</h1>

//       {cartItems.length === 0 ? (
//         <p className="text-gray-400">Your cart is currently empty.</p>
//       ) : (
//         <>
//           <div className="mr-20 ml-20 grid gap-6">
//             {cartItems.map((item) => (
//               <div
//                 key={item.id}
//                 className="bg-gray-800 p-4 rounded-lg flex flex-col md:flex-row items-center md:items-start gap-4 shadow-lg"
//               >
//                 <img
//                   src={item.products?.image_url || "/placeholder.png"}
//                   alt={item.products?.name}
//                   className="w-32 h-32 object-cover rounded"
//                 />
//                 <div className="flex-1 w-full">
//                   <h3 className="text-xl font-semibold">
//                     {item.products?.name}
//                   </h3>
//                   <p className="text-gray-400">{item.products?.description}</p>
//                   <p className="text-gray-300 mt-1">
//                     Price: ${item.products?.price?.toFixed(2)}
//                   </p>
//                   <div className="flex items-center mt-2">
//                     <button
//                       className="px-3 text-lg bg-gray-700 rounded hover:bg-gray-600"
//                       onClick={() => updateQuantity(item.id, -1)}
//                     >
//                       −
//                     </button>
//                     <span className="mx-4">{item.quantity}</span>
//                     <button
//                       className="px-3 text-lg bg-gray-700 rounded hover:bg-gray-600"
//                       onClick={() => updateQuantity(item.id, 1)}
//                     >
//                       +
//                     </button>
//                   </div>
//                   <p className="text-green-400 mt-2">
//                     Subtotal: $
//                     {(item.quantity * item.products?.price).toFixed(2)}
//                   </p>
//                 </div>
//                 <button
//                   onClick={() => deleteItem(item.id)}
//                   className="mt-4 md:mt-0 md:ml-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
//                 >
//                   Delete
//                 </button>
//               </div>
//             ))}
//           </div>

//           <div className="mr-20 ml-20 bg-gray-800 p-6 rounded-lg shadow-lg text-right mt-8">
//             <h2 className="text-2xl font-semibold mb-2">
//               Total: ${calculateTotal().toFixed(2)}
//             </h2>
//             <button className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg">
//               Checkout
//             </button>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function CartPage() {
  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUserAndCart = async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user) {
        setUser(authData.user);
        await fetchCartItems(authData.user.id);
      } else {
        router.push("/signin");
      }
    };

    fetchUserAndCart();
  }, [router]);

  const fetchCartItems = async (userId) => {
    setLoading(true);

    const { data: cart, error: cartError } = await supabase
      .from("carts")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (cartError || !cart) {
      console.error("Error fetching cart:", cartError?.message);
      setCartItems([]);
      setLoading(false);
      return;
    }

    const { data: items, error: itemsError } = await supabase
      .from("cart_items")
      .select(
        `
        id,
        quantity,
        product_id,
        products (
          id,
          name,
          description,
          image_url,
          price
        )
      `
      )
      .eq("cart_id", cart.id);

    if (itemsError) {
      console.error("Error fetching cart items:", itemsError.message);
      setCartItems([]);
    } else {
      setCartItems(items);
    }

    setLoading(false);
  };

  const updateQuantity = async (itemId, change) => {
    const item = cartItems.find((i) => i.id === itemId);
    const newQuantity = item.quantity + change;
    if (newQuantity <= 0) return;

    const { error } = await supabase
      .from("cart_items")
      .update({ quantity: newQuantity })
      .eq("id", itemId);

    if (error) {
      console.error("Error updating quantity:", error.message);
    } else {
      setCartItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, quantity: newQuantity } : i))
      );
    }
  };

  const deleteItem = async (itemId) => {
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", itemId);
    if (error) {
      console.error("Error deleting item:", error.message);
    } else {
      setCartItems((prev) => prev.filter((i) => i.id !== itemId));
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.quantity * (item.products?.price || 0),
      0
    );
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-black bg-white">
        <p>Loading cart...</p>
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
          <Link href="/wishlist" className="hover:text-yellow-400 transition">
            Wishlist
          </Link>
          <Link href="/cart" className="text-yellow-600 font-medium">
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

        <h1 className="text-3xl font-bold mb-6 text-gray-800">Your Cart</h1>

        {cartItems.length === 0 ? (
          <p className="text-gray-600">Your cart is currently empty.</p>
        ) : (
          <div className="space-y-6 mr-20 ml-20">
            {cartItems.map((item) => (
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

                {/* ─── DETAILS & CONTROLS ────────────────────────────── */}
                <div className="p-6 flex flex-col flex-1">
                  <h2
                    className="text-xl font-semibold mb-2 text-gray-800 cursor-pointer hover:text-yellow-500"
                    onClick={() => router.push(`/product/${item.products?.id}`)}
                  >
                    {item.products?.name}
                  </h2>
                  <p className="text-gray-600 mb-2">
                    {item.products?.description}
                  </p>
                  <p className="text-yellow-600 font-medium mb-4">
                    ${item.products?.price}
                  </p>
                  <div className="flex items-center mb-4 space-x-4">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="px-3 text-lg bg-gray-200 rounded hover:bg-gray-300"
                    >
                      −
                    </button>
                    <span className="text-lg font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="px-3 text-lg bg-gray-200 rounded hover:bg-gray-300"
                    >
                      +
                    </button>
                    <span className="ml-auto text-green-500 font-semibold">
                      Subtotal: $
                      {(item.quantity * item.products?.price).toFixed(2)}
                    </span>
                  </div>
                  <div className="mt-auto">
                    <button
                      onClick={() => deleteItem(item.id)}
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

        {cartItems.length > 0 && (
          <div className="mt-10 bg-gray-50 border border-gray-200 p-6 rounded-lg shadow-md flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-800">
              Total: ${calculateTotal().toFixed(2)}
            </h2>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition">
              Checkout
            </button>
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
