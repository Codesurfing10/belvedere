/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: "/belvedere",
  trailingSlash: true,
  images: { unoptimized: true },
};
export default nextConfig;
