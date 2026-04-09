const buildTarget = process.env.COMPASS_BUILD_TARGET === 'server' ? 'server' : 'static';
const isStaticBuild = buildTarget === 'static';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: isStaticBuild ? 'export' : undefined,
  trailingSlash: isStaticBuild,
};

export default nextConfig;
