#!/bin/bash

echo "🚀 Starting Project Management Tool..."
echo "======================================"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Build and start services
echo "📦 Building Docker images..."
docker-compose build

echo "🚀 Starting services..."
docker-compose up -d

echo "⏳ Waiting for services to be ready..."
sleep 30

# Check service health
echo "🔍 Checking service health..."

# Check backend
if curl -s http://localhost:3000/health > /dev/null; then
    echo "✅ Backend is running at http://localhost:3000"
else
    echo "❌ Backend health check failed"
fi

# Check frontend
if curl -s http://localhost/health > /dev/null; then
    echo "✅ Frontend is running at http://localhost"
else
    echo "❌ Frontend health check failed"
fi

echo ""
echo "🎉 Setup complete!"
echo "=================="
echo "📱 Frontend: http://localhost"
echo "🔧 Backend API: http://localhost:3000"
echo "📊 Health Check: http://localhost/health"
echo ""
echo "📚 Useful commands:"
echo "  - View logs: docker-compose logs -f"
echo "  - Stop services: docker-compose down"
echo "  - Restart: docker-compose restart"
echo "  - Clean up: docker-compose down -v"
echo ""
echo "🔐 You can register a new user or use existing credentials"
echo "📖 For more information, see README.md"
echo ""
echo "📖 For more information, see README.md" 