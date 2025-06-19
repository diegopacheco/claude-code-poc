#!/bin/bash
set -e

echo "Running integration tests only..."
go test -v -run "TestIntegrationTestSuite" ./...

echo ""
echo "Integration tests completed successfully!"