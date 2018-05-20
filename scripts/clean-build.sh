#!/bin/sh

echo '[clean-build] Removing existing build artifacts';
rm -rf build

echo '[clean-build] Create an empty directory for build artifacts';
mkdir build
