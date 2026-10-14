/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    output: "standalone",
    cacheComponents: true,
    partialPrefetching: true,
    outputFileTracingIncludes: { "/help": ["./content/help/**/*"] },
    experimental: {
	workerThreads: false,
	cpus: 2
    },	    
};

export default nextConfig;
