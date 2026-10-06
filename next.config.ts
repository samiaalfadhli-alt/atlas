import type { NextConfig } from "next"

// In sandboxes the application and the baked dependency tree are siblings
// below /workspace. Turbopack must use their common real-filesystem ancestor or
// it rejects the app's node_modules symlink as being outside its filesystem
// root. Keep ordinary local checkouts scoped to the application itself.
const turbopackRoot = process.cwd().startsWith("/workspace/")
  ? "/workspace"
  : process.cwd()

const nextConfig: NextConfig = {
  allowedDevOrigins: ["3000-ila6d554fcu5u2tlow562.sandbox.etlaq.sa", "e2b.etlaq.sa", "*.e2b.etlaq.sa", 
    "preview.etlaq.sa",
    "*.preview.etlaq.sa",
    "sandbox.etlaq.sa",
    "*.sandbox.etlaq.sa",
  ],
  turbopack: {
    root: turbopackRoot,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
      { protocol: "https", hostname: "pixabay.com" },
      { protocol: "https", hostname: "cdn.pixabay.com" },
      { protocol: "https", hostname: "ui-avatars.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "i.imgur.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "www.gravatar.com" },
      { protocol: "https", hostname: "gravatar.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/_next/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
        ],
      },
    ]
  },
}

export default nextConfig
