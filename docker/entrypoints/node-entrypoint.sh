#!/bin/bash

echo 'Athena GraphQL application starting up...'

echo 'NODE version'
node -v

echo 'NPM version'
npm -v

cd /usr/share/athena/server

export NODE_ENV=development

echo 'Installing dependencies';
npm install

echo 'Starting Athena GraphQL application';
node server/server --core --plugins=com.fireeye.athena.hx,com.fireeye.athena.virustotal
