const { PHASE_DEVELOPMENT_SERVER } = require("next/constants");

/** @type {import('next').NextConfig} */
module.exports = (phase) => ({
  reactStrictMode: true,
  // Keep production builds from overwriting a running development server's chunks.
  distDir: phase === PHASE_DEVELOPMENT_SERVER ? ".next-dev" : ".next",
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'evgd1ro8jvugg2yw.public.blob.vercel-storage.com',
        port: '',
        pathname: '/content/**',
      },
    ],

  },

});
