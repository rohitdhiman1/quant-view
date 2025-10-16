/** @type {import('next').NextConfig} */
const nextConfig = {
  // CRITICAL: Configures Next.js to output static HTML/CSS/JS files
  output: 'export',
  // Recommended for cleaner URLs when hosting static files
  trailingSlash: true, 
};

export default nextConfig; // Note: Use 'export default' for .ts config files