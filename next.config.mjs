/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "sbongjtygyygohjxpqyi.supabase.co",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
