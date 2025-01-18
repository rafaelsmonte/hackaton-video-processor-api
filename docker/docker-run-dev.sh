#!/bin/bash
echo "STARTING API SERVICE"
# rm -rf node_modules
# Install the project dependencies
# yarn install
yarn install --network-concurrency 1
# Start the API server on development mode
echo "run start:dev"
yarn run start:dev