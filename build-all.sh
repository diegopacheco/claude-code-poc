#!/bin/bash

echo "🔨 Building All Components - Coaching App"
echo "========================================"

# Function to check if command was successful
check_status() {
    if [ $? -eq 0 ]; then
        echo "✅ $1 - SUCCESS"
    else
        echo "❌ $1 - FAILED"
        exit 1
    fi
}

# Build Backend
echo ""
echo "📦 Building Backend..."
cd backend
echo "  - Running go mod tidy..."
go mod tidy
check_status "Go mod tidy"

echo "  - Building Go application..."
go build -o coaching-app .
check_status "Backend build"

echo "  - Running backend tests..."
go test ./...
check_status "Backend tests"

cd ..

# Build Frontend
echo ""
echo "🎨 Building Frontend..."
cd frontend
echo "  - Installing dependencies..."
bun install
check_status "Frontend dependencies"

echo "  - Building frontend..."
bun run build
check_status "Frontend build"

echo "  - Running frontend tests..."
bun run test --run
check_status "Frontend tests"

cd ..

# Build Docker Images
echo ""
echo "🐳 Building Docker Images..."
echo "  - Building backend Docker image..."
docker build -t coaching-app-backend ./backend
check_status "Backend Docker image"

echo "  - Building frontend Docker image..."
docker build -t coaching-app-frontend ./frontend
check_status "Frontend Docker image"

echo "  - Building complete stack with Docker Compose..."
docker-compose build
check_status "Docker Compose build"

echo ""
echo "🎉 All builds completed successfully!"
echo ""
echo "📋 Available commands:"
echo "   ./start.sh              - Start the full stack"
echo "   ./start.sh --clean      - Start with clean database"
echo "   docker-compose up -d    - Start services in background"
echo "   docker-compose logs -f  - View logs"
echo "   docker-compose down     - Stop all services"
echo ""
echo "🌐 Service URLs (when running):"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8080"
echo "   MySQL:    localhost:3306"