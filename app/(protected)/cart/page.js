'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import LoadingSpinner from 'app/components/LoadingSpinner';
import EmptyCart from 'app/components/EmptyCart';

export default function CartPage() {
  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserAndCart = async () => {
      try {
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError || !authData?.user) {
          router.push('/signin?redirect=/cart');
          return;
        }
        setUser(authData.user);
        await fetchCartItems(authData.user.id);
      } catch (err) {
        setError('Failed to load cart. Please try again.');
        console.error('Authentication error:', err);
      }
    };
    fetchUserAndCart();
  }, [router]);

  const fetchCartItems = async (userId) => {
    setLoading(true);
    try {
      const { data: cart, error: cartError } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (cartError || !cart) throw new Error('Cart not found');

      const { data: items, error: itemsError } = await supabase
        .from('cart_items')
        .select(`
          id,
          quantity,
          product_id,
          products:products(
            id,
            name,
            description,
            image_url,
            price,
            stock_quantity
          )
        `)
        .eq('cart_id', cart.id);

      if (itemsError) throw itemsError;

      const validItems = items.filter(item => item.products);
      setCartItems(validItems);
    } catch (err) {
      setError(err.message || 'Failed to load cart items');
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, change) => {
    const item = cartItems.find((i) => i.id === itemId);
    if (!item) return;

    const newQuantity = item.quantity + change;
    if (newQuantity > (item.products?.stock_quantity || 0)) {
      setError(`Only ${item.products.stock_quantity} available in stock`);
      return;
    }
    if (newQuantity <= 0) {
      await deleteItem(itemId);
      return;
    }

    try {
      setUpdatingItemId(itemId);
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', itemId);

      if (error) throw error;

      setCartItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, quantity: newQuantity } : i))
      );
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to update quantity');
    } finally {
      setUpdatingItemId(null);
    }
  };

  const deleteItem = async (itemId) => {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      setCartItems((prev) => prev.filter((i) => i.id !== itemId));
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to remove item');
    }
  };

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    try {
      const outOfStock = cartItems.filter(
        item => item.quantity > (item.products?.stock_quantity || 0)
      );
      if (outOfStock.length > 0) {
        setError('Some items exceed available stock. Update quantities.');
        setCheckoutLoading(false);
        return;
      }
      router.push('/checkout');
    } catch (err) {
      setError(err.message || 'Checkout failed');
      setCheckoutLoading(false);
    }
  };

  const calculateTotal = () => 
    cartItems.reduce(
      (total, item) => total + item.quantity * (item.products?.price || 0),
      0
    );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-300 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-3">
            <Image src="/Logo.png" alt="Logo" width={80} height={80} priority />
            <h1 className="text-3xl font-bold text-gray-700">Vape Vault</h1>
          </Link>
          <nav className="hidden md:flex items-center space-x-6 text-lg">
            <Link href="/account" className="hover:text-yellow-500">My Account</Link>
            <Link href="/wishlist" className="hover:text-yellow-500">Wishlist</Link>
            <Link href="/cart" className="text-yellow-600 font-medium flex items-center">
              Cart
              {cartItems.length > 0 && (
                <span className="ml-1 bg-yellow-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </Link>
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 container mx-auto px-6 py-10">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center text-yellow-600 hover:text-yellow-700 mb-6"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back
          </button>

          <h1 className="text-3xl font-bold mb-8 text-gray-800">Your Cart</h1>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 text-red-700">
              {error}
            </div>
          )}

          {cartItems.length === 0 ? (
            <EmptyCart />
          ) : (
            <>
              <div className="space-y-6">
                {cartItems.map(item => (
                  <div key={item.id} className="flex flex-col md:flex-row border rounded-xl shadow-sm hover:shadow-md">
                    <div className="relative w-full md:w-1/4 h-48 bg-gray-50">
                      <Image
                        src={item.products?.image_url || '/placeholder-product.png'}
                        alt={item.products?.name}
                        fill
                        className="object-contain p-4 cursor-pointer"
                        onClick={() => router.push(`/product/${item.products?.id}`)}
                      />
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex justify-between">
                        <div>
                          <h2
                            className="text-xl font-semibold cursor-pointer hover:text-yellow-500"
                            onClick={() => router.push(`/product/${item.products?.id}`)}
                          >
                            {item.products?.name}
                          </h2>
                          <p className="text-gray-600 line-clamp-2">{item.products?.description}</p>
                        </div>
                        <button onClick={() => deleteItem(item.id)} className="text-gray-400 hover:text-red-500">
                          ✕
                        </button>
                      </div>
                      <div className="mt-auto flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            disabled={updatingItemId === item.id}
                            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded"
                          >−</button>
                          <span>{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            disabled={updatingItemId === item.id || item.quantity >= (item.products?.stock_quantity || 0)}
                            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded"
                          >+</button>
                        </div>
                        <div className="text-right">
                          <p className="text-yellow-600 font-medium">${item.products?.price?.toFixed(2)}</p>
                          <p className="font-semibold text-green-600">Subtotal: ${(item.quantity * item.products?.price).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 bg-gray-50 p-6 rounded-lg border">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                <div className="space-y-3">
                  <div className="flex justify-between"><span>Subtotal</span><span>${calculateTotal().toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>Shipping</span><span className="text-green-600">Free</span></div>
                  <div className="border-t my-2"></div>
                  <div className="flex justify-between font-semibold text-lg"><span>Total</span><span>${calculateTotal().toFixed(2)}</span></div>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={checkoutLoading || cartItems.length === 0}
                  className={`w-full mt-6 py-3 rounded-lg font-medium text-white transition ${checkoutLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  {checkoutLoading ? 'Processing...' : 'Proceed to Checkout'}
                </button>
              </div>
            </>
          )}
        </div>
      </main>

      <footer className="bg-gray-100 py-6 text-center text-sm border-t border-gray-300">© 2025 Vape Vault. All rights reserved.</footer>
    </div>
  );
}
