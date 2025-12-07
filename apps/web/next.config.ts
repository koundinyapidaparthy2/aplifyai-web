import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: "standalone",
    experimental: {
        // Add any experimental features here if needed
    },
    // Ensure we transpile local packages
    transpilePackages: [
        "@aplifyai/ui",
        "@aplifyai/config",
        "@aplifyai/types",
        "@aplifyai/utils",
        "@aplifyai/hooks",
        "@aplifyai/constants",
        "@aplifyai/api",
        "@aplifyai/validation",
        "@aplifyai/storage",
        "@aplifyai/analytics",
        "@aplifyai/errors",
        "@aplifyai/logger",
        "@aplifyai/test-utils",
        "@aplifyai/flags",
    ],
};

export default nextConfig;
