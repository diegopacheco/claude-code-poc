#!/bin/bash

echo "🚀 Starting Coaching App Full Stack..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose > /dev/null 2>&1 && ! docker compose version > /dev/null 2>&1; then
    echo "❌ Error: Docker Compose is not available. Please install Docker Compose and try again."
    exit 1
fi

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down --remove-orphans

# Clean up any existing MySQL data if requested
if [ "$1" = "--clean" ]; then
    echo "🧹 Cleaning MySQL data directory..."
    sudo rm -rf db/mysql_data/
fi

# Build and start all services
echo "🔨 Building and starting services..."
docker-compose up --build -d

# Wait for services to be healthy
echo "⏳ Waiting for services to start..."
sleep 10

# Check service health
echo "🔍 Checking service health..."

# Check MySQL
echo -n "MySQL: "
if docker-compose exec mysql mysqladmin ping -h localhost -u root -prootpassword > /dev/null 2>&1; then
    echo "✅ Healthy"
else
    echo "❌ Not healthy"
fi

# Check Backend
echo -n "Backend: "
if curl -s http://localhost:8080/api/v1/members > /dev/null 2>&1; then
    echo "✅ Healthy"
else
    echo "❌ Not healthy"
fi

# Check Frontend
echo -n "Frontend: "
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Healthy"
else
    echo "❌ Not healthy"
fi

echo ""
echo "🎉 Coaching App is starting up!"
echo ""
echo "📋 Service URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8080/api/v1"
echo "   MySQL: localhost:3306"
echo ""
echo "📊 View logs:"
echo "   docker-compose logs -f"
echo ""
echo "🛑 Stop services:"
echo "   docker-compose down"
echo ""
echo "🔄 Restart with clean data:"
echo "   ./start.sh --clean"