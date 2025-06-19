#!/bin/bash
set -e

echo "Starting coaching app..."
export DATABASE_URL="${DATABASE_URL:-root:password@tcp(localhost:3306)/coaching_app?charset=utf8mb4&parseTime=True&loc=Local}"
./coaching-app