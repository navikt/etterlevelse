import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export', // <-- enables static export
  distDir: 'build', // optional, changes output dir from 'out' to 'build'
}

export default nextConfig
