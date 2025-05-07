/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    // allow supabase storage URLs
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'uuqohfgyxifctdvllgtg.supabase.co',
        port: '',               // no custom port
        pathname: '/storage/v1/object/public/uploads/**',
      },
    ],
  },

  // ...any other config (webpack, env, etc.)
};

export default nextConfig;
