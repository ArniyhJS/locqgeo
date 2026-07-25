.PHONY: dev dev-engine dev-console dev-drop dev-verify build lint test check-types db-generate db-migrate clean

dev:
	pnpm run dev

dev-grid:
	pnpm run dev:grid

dev-os:
	pnpm run dev:os

dev-verify:
	pnpm run dev:verify

dev-drop:
	pnpm run dev:drop

build:
	pnpm run build

lint:
	pnpm run lint

test:
	pnpm run test

check-types:
	pnpm run check-types

db-generate:
	pnpm run db:generate

db-migrate:
	pnpm run db:migrate

clean:
	pnpm run clean
