#!/bin/bash

# Setup script for Quant View
# Creates necessary symlinks and verifies data files

set -e

echo "🔧 Setting up Quant View..."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: Must run from project root directory"
  exit 1
fi

# Create symlink for data directory if it doesn't exist
if [ ! -L "public/data" ]; then
  echo "📁 Creating symlink: public/data -> data/"
  ln -sf ../data public/data
  echo "✅ Symlink created"
else
  echo "✅ Symlink already exists: public/data"
fi

# Verify data files exist
if [ ! -f "data/metadata.json" ]; then
  echo "⚠️  Warning: data/metadata.json not found"
  echo "   Run 'pnpm run fetch-data' to initialize data"
else
  echo "✅ Data files found"
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  pnpm install
else
  echo "✅ Dependencies installed"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Ensure .env.local has FRED_API_KEY set"
echo "  2. Run 'pnpm run fetch-data' to initialize data (if needed)"
echo "  3. Run 'pnpm run dev' to start development server"
echo "  4. Run 'pnpm run check-sync' to verify data synchronization"
echo ""
