/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
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
      {
        source: '/admin/documents',
        destination: '/admin',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
