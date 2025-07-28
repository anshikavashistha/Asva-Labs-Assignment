#!/bin/bash

echo "🚀 Setting up Project Management Tool Docker Environment..."
echo "========================================================"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker Desktop first."
    echo "📥 Download from: https://www.docker.com/products/docker-desktop/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running. Please start Docker Desktop."
    exit 1
fi

echo "✅ Docker environment is ready!"

# Stop any existing containers
echo "🛑 Stopping any existing containers..."
docker-compose down

# Remove old images to ensure fresh build
echo "🧹 Cleaning up old images..."
docker-compose down --rmi all

# Build and start services
echo "📦 Building Docker images..."
docker-compose build --no-cache

echo "🚀 Starting services..."
docker-compose up -d

echo "⏳ Waiting for services to be ready..."
sleep 45

# Check service health
echo "🔍 Checking service health..."

# Check backend
echo "Checking backend..."
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ Backend is running at http://localhost:3000"
else
    echo "⚠️  Backend might still be starting up..."
    echo "   You can check logs with: docker-compose logs backend"
fi

# Check frontend
echo "Checking frontend..."
if curl -s http://localhost > /dev/null 2>&1; then
    echo "✅ Frontend is running at http://localhost"
else
    echo "⚠️  Frontend might still be starting up..."
    echo "   You can check logs with: docker-compose logs frontend"
fi

echo ""
echo "🎉 Setup complete!"
echo "=================="
echo "📱 Frontend: http://localhost"
echo "🔧 Backend API: http://localhost:3000"
echo ""
echo "📚 Useful commands:"
echo "  - View logs: docker-compose logs -f"
echo "  - View specific service logs: docker-compose logs -f [service-name]"
echo "  - Stop services: docker-compose down"
echo "  - Restart: docker-compose restart"
echo "  - Clean up everything: docker-compose down -v --rmi all"
echo ""
echo "🔐 You can register a new user or use existing credentials"
echo "📖 For more information, see README.md" 