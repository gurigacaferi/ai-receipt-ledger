.PHONY: help dev build test clean

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}\' $(MAKEFILE_LIST)

dev: ## Start development environment
	docker compose -f docker-compose.yml -f infra/docker-compose.override.yml up --build

build: ## Build production images
	docker compose build

test: ## Run tests
	cd backend && python -m pytest tests/

clean: ## Clean up containers and volumes
	docker compose down -v
	docker system prune -f

setup-env: ## Copy environment templates
	cp backend/.env.example backend/.env
	cp frontend/.env.example frontend/.env.local
	@echo "Please edit the .env files with your configuration"

migrate: ## Run database migrations
	cd backend && alembic upgrade head

seed: ## Seed database with sample data (TODO)
	@echo "Seeding not implemented yet"

logs: ## Show logs
	docker compose logs -f

restart: ## Restart services
	docker compose restart

shell-backend: ## Open shell in backend container
	docker compose exec backend bash

shell-frontend: ## Open shell in frontend container
	docker compose exec frontend sh

db-shell: ## Open PostgreSQL shell
	docker compose exec postgres psql -U postgres -d receipt_tracker