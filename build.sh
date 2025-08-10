#!/bin/bash

# Build script for CAR11 application deployment on Render.com

echo "Building CAR11 application..."

# Navigate to frontend directory
cd car11-frontend

echo "Installing frontend dependencies..."
npm install

echo "Building frontend..."
npm run build

echo "Copying built frontend to backend static folder..."
rm -rf ../car11-backend/src/static/*
cp -r dist/* ../car11-backend/src/static/

echo "Build completed successfully!"
echo "The application is ready for deployment on Render.com"

