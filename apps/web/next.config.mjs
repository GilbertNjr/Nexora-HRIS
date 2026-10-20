/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async redirects() {
    return [
      {
        source: '/ess/:path*',
        destination: '/karyawan/:path*',
        permanent: true,
      },
      {
        source: '/ess',
        destination: '/karyawan',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
