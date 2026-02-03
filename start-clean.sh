#!/bin/bash

echo "🧹 Rensar cache..."
rm -rf node_modules/.vite
rm -rf dist

echo "🚀 Startar servrar..."
echo ""
echo "✅ Frontend kommer köra på: http://localhost:3000"
echo "✅ Backend API kommer köra på: http://localhost:3001"
echo ""
echo "Tryck Ctrl+C för att stoppa båda servrarna"
echo ""

# Starta båda servrarna samtidigt
npm run dev:full
