/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export: every page becomes plain HTML/JS files. Vercel serves them, and so can any static host.
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
};
export default nextConfig;
