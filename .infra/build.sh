#!/bin/bash

# Move to the directory where the Dockerfile is located
cd "$(dirname "$0")"

# Build the Docker image
docker-compose build

# Run the Docker container to generate the binary
docker-compose up
