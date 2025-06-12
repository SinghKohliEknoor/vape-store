'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import LoadingSpinner from 'app/components/LoadingSpinner';
import { HeartIcon } from '@heroicons/react/24/solid';

function EmptyWishlist() {
  const router = useRouter();
  return (
    <div className="text-center py-20 px-6">
      <HeartIcon className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
      <p className="text-white text-lg mb-4">Your wishlist is empty.</p>
      <button
        onClick={() => router.push('/')}
        className="inline-block bg-yellow-500 text-white px-6 py-3 rounded hover:bg-yellow-600"
      >
        Browse Products
      </button>
    </div>
  );
}

export default function WishlistPage() {
  const [user, setUser] = useState(null);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserAndWishlist = async () => {
      try {
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError || !authData?.user) {
          router.push('/signin?redirect=/wishlist');
          return;
        }
        setUser(authData.user);

        const { data: wishlist, error: wishlistError } = await supabase
          .from('wishlists')
          .select('id')
          .eq('user_id', authData.user.id)
          .single();

        if (wishlistError || !wishlist) {
          setWishlistItems([]);
          setLoading(false);
          return;
        }

        const { data: items, error: itemsError } = await supabase
          .from('wishlist_items')
          .select(`
            id,
            product_id,
            products:products (
              id,
              name,
              description,
              image_url,
              price,
              stock_quantity
            )
          `)
          .eq('wishlist_id', wishlist.id);

        if (itemsError) throw itemsError;

        const validItems = items.filter(item => item.products);
        setWishlistItems(validItems);
      } catch (err) {
        setError(err.message || 'Failed to load wishlist items');
        setWishlistItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndWishlist();
  }, [router]);

  const deleteItem = async (itemId) => {
    try {
      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      setWishlistItems((prev) => prev.filter(i => i.id !== itemId));
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to remove item');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex flex-col">
      <header className="sticky top-0 z-10 bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-3">
            <Image src="/Logo.png" alt="Logo" width={80} height={80} priority />
            <h1 className="text-3xl font-bold text-yellow-300">Vape Vault</h1>
          </Link>
          <nav className="hidden md:flex items-center space-x-6 text-lg">
            <Link href="/account" className="hover:text-yellow-400">My Account</Link>
            <Link href="/wishlist" className="text-yellow-400 font-medium">Wishlist</Link>
            <Link href="/cart" className="hover:text-yellow-400">Cart</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center text-yellow-300 hover:text-yellow-200 mb-6"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back
          </button>

          <h1 className="text-4xl font-bold mb-10 text-yellow-300">Your Wishlist</h1>

          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-6 text-red-700">
              {error}
            </div>
          )}

          {wishlistItems.length === 0 ? (
            <EmptyWishlist />
          ) : (
            <div className="space-y-6">
              {wishlistItems.map(item => (
                <div key={item.id} className="flex flex-col md:flex-row bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-lg hover:shadow-xl">
                  <div className="relative w-full md:w-1/4 h-48 bg-gray-900 rounded-l-xl">
                    <Image
                      src={item.products?.image_url || '/placeholder-product.png'}
                      alt={item.products?.name}
                      fill
                      className="object-contain p-4 cursor-pointer"
                      onClick={() => router.push(`/product/${item.products?.id}`)}
                    />
                  </div>
                  <div className="p-6 flex flex-col flex-1 text-white">
                    <div className="flex justify-between">
                      <div>
                        <h2
                          className="text-xl font-semibold cursor-pointer hover:text-yellow-400"
                          onClick={() => router.push(`/product/${item.products?.id}`)}
                        >
                          {item.products?.name}
                        </h2>
                        <p className="text-white/70 line-clamp-2">{item.products?.description}</p>
                      </div>
                      <button onClick={() => deleteItem(item.id)} className="text-white/50 hover:text-red-500 text-xl">
                        ✕
                      </button>
                    </div>
                    <div className="mt-auto flex justify-between items-center">
                      <div>
                        <p className="text-yellow-400 font-medium">${item.products?.price?.toFixed(2)}</p>
                        {item.products?.stock_quantity > 0 ? (
                          <p className="text-green-400 font-semibold">In Stock</p>
                        ) : (
                          <p className="text-red-400 font-semibold">Out of Stock</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="bg-white/10 backdrop-blur-md py-6 text-center text-sm border-t border-white/20 text-white/60">
        © 2025 Vape Vault. All rights reserved.
      </footer>
    </div>
  );
}
