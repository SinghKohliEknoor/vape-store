'use client';
import Image from 'next/image';
import Link from 'next/link';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setUser(data.session.user);
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/20 px-6 py-3">
      <div className="flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-3">
          <Image src="/Logo.png" alt="Vape Vault Logo" width={60} height={60} />
          <h1 className="text-2xl font-bold text-yellow-300">Vape Vault</h1>
        </Link>

        {user && (
          <div className="flex-grow max-w-md mx-8 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60 pointer-events-none" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 text-sm font-medium bg-white/10 border border-white/30 text-white placeholder-white/70 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition duration-300 ease-in-out"
            />
          </div>
        )}

        <nav className="space-x-6 text-lg flex items-center">
          <Link href="/account" className="hover:text-yellow-400">My Account</Link>
          <Link href="/wishlist" className="hover:text-yellow-400">Wishlist</Link>
          <Link href="/cart" className="hover:text-yellow-400">Cart</Link>
          {user && (
            <button
              onClick={handleLogout}
              className="bg-yellow-300 hover:bg-yellow-400 text-black px-4 py-2 rounded-md font-medium"
            >
              Logout
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
