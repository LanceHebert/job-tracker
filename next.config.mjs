/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Ignore ESLint errors during builds so generated Prisma files don't block production build
    ignoreDuringBuilds: true,
  },
  output: "standalone",
};

export default nextConfig;
