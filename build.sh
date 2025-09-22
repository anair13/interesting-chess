#!/bin/bash
echo "Building client..."
cd client
npm install
npm run build
cd ..
echo "Build completed!"
