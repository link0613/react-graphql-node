#!/bin/sh

echo '[build-server] Cleaning up any previous build artifacts';
rm -rf build/server

echo '[build-server] Copying server component artifacts';
mkdir -p build/server
cp -r server build/server
cp -r shared build/server
cp webpack.config.js build/server
cp package.json build/server
