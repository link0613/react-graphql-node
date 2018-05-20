#!/bin/sh

echo '[docker-clean-images] Cleaning local Docker container images';
docker system prune -a -f
