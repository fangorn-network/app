import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    if (!isServer) {
      // Don't resolve 'fs', 'net', 'tls', etc. on the client
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        path: false,
        os: false,
        worker_threads: false,
        'node-localstorage': false,
      };
    }

    // Exclude server-only modules from client bundle
    config.externals = config.externals || [];
    if (!isServer) {
      config.externals.push({
        'node-localstorage': 'commonjs node-localstorage',
      });
    }
    return config;
  },
};

export default nextConfig;
