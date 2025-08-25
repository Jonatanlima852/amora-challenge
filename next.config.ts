import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ignora erros de TypeScript durante o build
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Ignora erros de ESLint durante o build
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Outras opções úteis
  experimental: {
    // Remove a propriedade inválida
  },
};

export default nextConfig;
