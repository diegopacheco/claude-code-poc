# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **NoSugar Coaching**, a full-stack team coaching application demonstrating Claude Code capabilities. The architecture consists of containerized microservices with React frontend, Go backend, and MySQL database.

## Development Commands

### Quick Start
- `./start.sh` - Start the complete stack with health checks
- `./start.sh --clean` - Clean database restart with fresh schema
- `./build-all.sh` - Production build pipeline for all services
- `./test-functionality.sh` - End-to-end integration testing

### Frontend Development (React + TypeScript + Vite)
- `cd frontend && bun install` - Install dependencies
- `cd frontend && bun run dev` - Development server (hot reload)
- `cd frontend && bun run test` - Run test suite with Vitest
- `cd frontend && bun run build` - Production build

### Backend Development (Go + Gin)
- `cd backend && ./test.sh` - Full test suite with coverage reports
- `cd backend && ./test-unit.sh` - Unit tests only
- `cd backend && ./test-integration.sh` - Integration tests
- `cd backend && go build -o coaching-app .` - Local build
- `cd backend && go run main.go` - Development server

## Architecture

### Service Structure
- **Frontend**: React 19 SPA served via Nginx (port 3000)
- **Backend**: Go REST API with Gin framework (port 8080)
- **Database**: MySQL 9.0 with proper schema and indexes (port 3306)

### API Design
All REST endpoints use `/api/v1` prefix:
- `/members` - Team member CRUD operations
- `/teams` - Team management
- `/assign` - Member-to-team assignment logic
- `/feedback` - Team and individual feedback system

### Database Schema
Located in `db/` directory with initialization scripts and sample data. Uses GORM for ORM with proper foreign key relationships and indexing.

### Docker Architecture
Multi-service Docker Compose setup with:
- Custom bridge networking
- Health checks for all services
- Multi-stage builds for production optimization
- Volume mounts for development

## Testing Strategy

- **Frontend**: Component tests using React Testing Library + Vitest
- **Backend**: Unit tests for models/handlers + integration tests with testify
- **System**: Bash-based curl integration tests via `test-functionality.sh`
- **Coverage**: Automatic Go coverage report generation

## Build Process

1. **Development**: Individual services with hot reload
2. **Testing**: Multi-layer test execution (unit → integration → system)
3. **Building**: Docker multi-stage builds for optimization
4. **Deployment**: Docker Compose orchestration with health monitoring

## Code Conventions

This project follows specific patterns established during Claude Code development:
- Modern Go practices with proper error handling
- React functional components with TypeScript
- Minimal external dependencies
- Input validation and sanitization throughout
- Proper CORS configuration for cross-origin requests

## Package Managers

- **Frontend**: Bun (primary) with `bun.lockb`
- **Backend**: Go modules with `go.mod`
- **Infrastructure**: Docker Compose for orchestration