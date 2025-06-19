#!/bin/bash
set -e

echo "Running handler tests only..."
go test -v -run "TestCreate.*|TestGet.*|TestUpdate.*|TestDelete.*|TestAssign.*" ./...

echo ""
echo "Handler tests completed successfully!"