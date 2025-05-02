import { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  //   typescript: {
  //     ignoreBuildErrors: true,
  //   },

  images: {
    unoptimized: true,
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['@react-pdf/renderer'],
    turbo: {
      resolveAlias: {
        canvas: './empty-module.ts',
        encoding: './empty-module.ts',
      },
    },
  },
  // swcMinify: false,
  // transpilePackages: ['@react-pdf/renderer'],
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
