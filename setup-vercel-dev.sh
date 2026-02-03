#!/bin/bash

# Setup script for Vercel Dev environment
# Uses npx to run Vercel CLI without global installation

echo "🔧 Setting up Vercel Dev environment..."
echo ""
echo "🚀 Starting Vercel Dev server with npx..."
echo ""
echo "NOTE: You will be asked some setup questions:"
echo "  - Set up and deploy? Choose 'Y'"
echo "  - Which scope? Select your account"
echo "  - Link to existing project? Choose 'N' (first time) or 'Y' (if already created)"
echo "  - Project name? Press Enter for default or type custom name"
echo "  - Directory location? Press Enter (current directory)"
echo "  - Override settings? Choose 'N'"
echo ""
echo "Press Ctrl+C to stop the server when needed"
echo ""

# Start Vercel Dev using npx (no global install needed)
npx vercel dev
