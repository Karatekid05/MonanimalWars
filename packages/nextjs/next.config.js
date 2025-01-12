// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  experimental: {
    externalDir: true
  },
  env: {
    NEXT_PUBLIC_MONAD_RPC_URL: process.env.NEXT_PUBLIC_MONAD_RPC_URL,
    NEXT_PUBLIC_MONAD_BLOCKSCOUT_URL: process.env.NEXT_PUBLIC_MONAD_BLOCKSCOUT_URL,
    NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID
  },
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: https: wss: metamask-inpage: chrome-extension:; connect-src 'self' https: wss: data:; frame-src 'self' https: chrome-extension:; frame-ancestors 'none';"
          }
        ],
      },
    ]
  }
};

module.exports = nextConfig;
