// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,               //  ← comma was missing here

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "uuqohfgyxifctdvllgtg.supabase.co",
        pathname: "/storage/v1/object/public/**",   // Supabase public bucket
      },
    ],
  },
};

export default nextConfig;
