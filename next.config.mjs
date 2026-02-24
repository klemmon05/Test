/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      url: false,
      os: false,
    };
    // Exclude cesium from server bundle
    config.externals = config.externals || [];
    return config;
  },
};

export default nextConfig;
