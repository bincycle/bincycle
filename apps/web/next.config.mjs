/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui", "@workspace/data"],
  images: {
    remotePatterns: [
      {
        // Allow the CDN used for hero / circular / texture images.
        // Swap to your own domain once assets are self-hosted.
        protocol: "https",
        hostname: "static.prod-images.emergentagent.com",
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig
