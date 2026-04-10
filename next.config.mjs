const buildTarget = process.env.COMPASS_BUILD_TARGET === 'server' ? 'server' : 'static';
const isStaticBuild = buildTarget === 'static';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: isStaticBuild ? 'export' : 'standalone',
  trailingSlash: isStaticBuild,
};

export default nextConfig;
