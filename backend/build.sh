#!/bin/bash
set -e

echo "Building coaching app..."
go mod tidy
go build -o coaching-app .
echo "Build completed successfully!"