.PHONY: help build up down logs clean restart test migrate

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

build: ## Build all Docker images
	docker-compose build

up: ## Start all services
	docker-compose up -d

down: ## Stop all services
	docker-compose down

logs: ## View logs from all services
	docker-compose logs -f

backend-logs: ## View backend logs
	docker-compose logs -f backend

frontend-logs: ## View frontend logs
	docker-compose logs -f frontend

restart: ## Restart all services
	docker-compose restart

clean: ## Remove all containers, networks, and volumes
	docker-compose down -v --remove-orphans
	docker system prune -f

test: ## Run tests
	docker-compose exec backend npm test

migrate: ## Run database migrations
	docker-compose exec backend npx sequelize-cli db:migrate

seed: ## Run database seeders
	docker-compose exec backend npx sequelize-cli db:seed:all

shell: ## Open shell in backend container
	docker-compose exec backend sh



redis-cli: ## Connect to Redis CLI
	docker-compose exec redis redis-cli

status: ## Show status of all services
	docker-compose ps

health: ## Check health of all services
	@echo "Checking service health..."
	@curl -s http://localhost/health || echo "Frontend health check failed"
	@curl -s http://localhost:3000/health || echo "Backend health check failed" 