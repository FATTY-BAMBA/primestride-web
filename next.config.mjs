/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/:locale(en|zh)/ai-zhanggui/:path*",
        destination: "/:locale/stridebrain/:path*",
        permanent: true,
      },
      {
        source: "/ai-zhanggui/:path*",
        destination: "/en/stridebrain/:path*",
        permanent: true,
      },
      {
        source: "/stridebrain/:path*",
        destination: "/en/stridebrain/:path*",
        permanent: true,
      },
    ];
  },
};
export default nextConfig;
