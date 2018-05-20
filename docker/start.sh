#!/bin/sh

i=1
while true; do
  nginx -g "daemon off;"
  sleep 2
    if [ $i -gt 50 ]; then
      echo Timeout waiting for nginx start
      exit 1
    fi
done
