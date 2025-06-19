#!/bin/bash
set -e

echo "Running Go tests..."
go test -v ./... -cover

echo ""
echo "Running tests with coverage report..."
go test -v ./... -coverprofile=coverage.out

echo ""
echo "Generating coverage HTML report..."
go tool cover -html=coverage.out -o coverage.html

echo ""
echo "Coverage report generated: coverage.html"
echo "Test execution completed successfully!"