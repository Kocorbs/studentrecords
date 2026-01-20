/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    eslint: {
        // Disable the unescaped entities rule during builds
        // This allows apostrophes and other characters in JSX text
        ignoreDuringBuilds: false,
        dirs: ['src'],
    },
    /* config options here */
};

module.exports = nextConfig;
