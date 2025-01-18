#!/bin/bash
echo "STARTING API SERVICE"

# Install the project dependencies
yarn install --network-concurrency 1

# Run end-to-end tests
yarn run test:e2e