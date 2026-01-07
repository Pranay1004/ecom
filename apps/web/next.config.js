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

  // Security & SEO headers
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Security headers
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=()",
          },
          // CSP: Allow next.js + three.js + payment providers
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://js.stripe.com https://checkout.razorpay.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https:",
              "connect-src 'self' https://api.stripe.com https://api.razorpay.com https://checkout.razorpay.com http://localhost:8000 " +
                (process.env.NEXT_PUBLIC_ENGINE_URL || ""),
              "frame-src 'self' https://js.stripe.com https://checkout.razorpay.com",
              "media-src 'self'",
              "object-src 'none'",
              "form-action 'self'",
              "frame-ancestors 'self'",
              "base-uri 'self'",
            ].join("; "),
          },
          // SEO
          {
            key: "Cache-Control",
            value: "public, max-age=3600, stale-while-revalidate=86400",
          },
        ],
      },
      // API routes: stricter CSP, no caching
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value:
              "no-store, no-cache, must-revalidate, max-age=0",
          },
          {
            key: "Content-Type",
            value: "application/json",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
