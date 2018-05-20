#!/bin/sh

echo '[relay-compiler] Run Relay compiler to reflect GraphQL schema changes';
relay-compiler --src ./client --schema server/data/schema.graphql
