/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@spottgeo/api-contracts", "@spottgeo/database"],
  reactStrictMode: true,
};

export default nextConfig;
