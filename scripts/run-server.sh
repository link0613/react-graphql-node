#!/bin/sh

echo '[run-server] Run local server';
node server/index.js --core --plugins=com.fireeye.athena.hx,com.fireeye.athena.virusTotal
