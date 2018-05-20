#!/bin/sh

echo '[docker-run] Run Docker container with minumum set of exposed ports';
docker run -t -d -p3000:80 athena:latest
