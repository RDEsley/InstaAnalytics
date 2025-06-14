/** @type {import('next').NextConfig} */
const nextConfig = {
  //output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  transpilePackages: ['ow'],
  webpack: (config, { isServer }) => {
    // Disable webpack cache to prevent ENOENT errors
    config.cache = false;
    return config;
  },
};

module.exports = nextConfig;