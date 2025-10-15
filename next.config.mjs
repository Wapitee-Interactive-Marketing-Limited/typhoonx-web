/** @type {import('next').NextConfig} */
const nextConfig = {
  redirects: async () => [
    { source: '/auth/signup.html', destination: '/auth/signup', permanent: true },
    { source: '/auth/callback.html', destination: '/auth/callback', permanent: true },
    { source: '/', destination: '/auth/callback', permanent: false }
  ]
};

export default nextConfig;

