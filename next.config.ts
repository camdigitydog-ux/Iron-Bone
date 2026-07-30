import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const nextConfig: NextConfig = {
  // Silences Next's Turbopack/webpack-config mismatch warning: Serwist always attaches a
  // `webpack()` hook (even when disabled in dev), but the SW is only actually built via
  // `next build --webpack` in production, so there's nothing for Turbopack to migrate here.
  turbopack: {},
};

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV !== "production",
  register: true,
  reloadOnOnline: true,
});

export default withSerwist(nextConfig);
