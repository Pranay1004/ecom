/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ["@eshant/api", "@eshant/db"],
  typescript: {
    tsconfigPath: "./tsconfig.json",
  },
  images: {
    unoptimized: false, // Enable image optimization for Vercel
  },
  webpack: (config) => {
    config.externals.push({
      "utf-8-validate": "commonjs utf-8-validate",
      bufferutil: "commonjs bufferutil",
    });
    return config;
  },
  // Vercel-specific optimizations
  productionBrowserSourceMaps: false, // Reduce bundle size
  poweredByHeader: false, // Remove X-Powered-By header
};

module.exports = nextConfig;
