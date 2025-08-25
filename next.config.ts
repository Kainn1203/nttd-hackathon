import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.slack-edge.com" },
      { protocol: "https", hostname: "ca.slack-edge.com" },
      { protocol: "https", hostname: "a.slack-edge.com" }, // 予備
      { protocol: "https", hostname: "secure.gravatar.com" }, // ← 今回のエラーの本丸
      { protocol: "https", hostname: "www.gravatar.com" }, // 予備
      {
        protocol: "https",
        hostname: "dxzemwwaldgwnjkviyfn.supabase.co",
        pathname: "/storage/v1/object/public/**",
      }, // supabase
    ],
  },
};

export default nextConfig;
