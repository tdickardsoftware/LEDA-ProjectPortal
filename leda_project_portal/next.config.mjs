/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    output: "standalone",
    cacheComponents: true,
    experimental: {
	workerThreads: false,
	cpus: 1
    },	    
};

export default nextConfig;
