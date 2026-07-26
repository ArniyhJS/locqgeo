.PHONY: dev dev-console dev-engine dev-drop dev-verify dev-payout-worker dev-webhook-dispatcher dev-analytics-worker build lint test check-types db-generate db-migrate clean help

# Default target: show available commands
help:
	@echo "SpottGeo Monorepo Development Commands:"
	@echo "  make dev                    - Start all workspace packages in development mode"
	@echo "  make dev-console            - Start SpottConsole B2B Dashboard (:3000)"
	@echo "  make dev-drop               - Start SpottDrop Consumer PWA (:3001)"
	@echo "  make dev-verify             - Start SpottVerify Attendance PWA (:3002)"
	@echo "  make dev-engine             - Start SpottEngine Fastify Core API (:8080)"
	@echo "  make dev-payout-worker      - Start Payout Worker background loop"
	@echo "  make dev-webhook-dispatcher - Start Webhook Dispatcher background loop"
	@echo "  make dev-analytics-worker   - Start Analytics Aggregator background loop"
	@echo "  make build                  - Run production build across all workspaces"
	@echo "  make lint                   - Run ESLint checks across all workspaces"
	@echo "  make test                   - Run Vitest unit & integration tests"
	@echo "  make check-types            - Run TypeScript type checks (tsc --noEmit)"
	@echo "  make db-generate            - Generate Drizzle ORM migrations"
	@echo "  make db-migrate             - Execute Drizzle database migrations"
	@echo "  make clean                  - Clean build artifacts and node_modules"

# Monorepo Development Targets
dev:
	pnpm run dev

dev-console:
	pnpm run dev:console

dev-engine:
	pnpm run dev:engine

dev-drop:
	pnpm run dev:drop

dev-verify:
	pnpm run dev:verify

dev-payout-worker:
	pnpm run dev:payout-worker

dev-webhook-dispatcher:
	pnpm run dev:webhook-dispatcher

dev-analytics-worker:
	pnpm run dev:analytics-worker

# Build, Lint & Test Targets
build:
	pnpm run build

lint:
	pnpm run lint

test:
	pnpm run test

check-types:
	pnpm run check-types

# Database Operations
db-generate:
	pnpm run db:generate

db-migrate:
	pnpm run db:migrate

# Maintenance
clean:
	pnpm run clean
