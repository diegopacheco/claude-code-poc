#!/bin/bash
set -e

echo "Running unit tests only..."
go test -v -run "Test.*Model|TestTeamMemberAssociation" ./...

echo ""
echo "Unit tests completed successfully!"