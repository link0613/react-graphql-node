#!/bin/sh

echo '[docker-run-full] Run Docker container with full set of exposed ports';
docker run -t -d -p3000:80 -p3001:8000 -p3002:5672 -p3003:15672 -p3004:9200 -p3005:9300 athena:latest
