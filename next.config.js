/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    wasm: true,
  },
  webpack(config, { isServer }) {
    if (!isServer) {
      // Alias node‐only runtime to the web runtime
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        'onnxruntime-node': 'onnxruntime-web',
      };
      // Prevent bundling of Node core modules
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        fs: false,
        path: false,
        os: false,
      };
    }
    return config;
  },
};

export default nextConfig;
