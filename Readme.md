# Job Application Tracker System

A backend system for managing and tracking job applications, built with **Node.js, Express, MongoDB, Redis, Docker, and GitHub Actions**.

The project is being developed with a focus on learning and implementing **production-oriented backend engineering concepts**, including authentication, authorization, API security, rate limiting, caching infrastructure, application lifecycle management, health checks, configuration management, containerization, and CI.

---

## Overview

The Job Application Tracker allows authenticated users to manage their job applications through a REST API.

Users can:

- Create job application records
- View their job applications
- View an individual application
- Update application details
- Delete applications
- Track application status
- Authenticate using JWT-based authentication

The backend is containerized using Docker and uses MongoDB for persistent data storage and Redis for distributed rate limiting.

---

## Tech Stack

### Backend

- **Node.js**
- **Express.js**
- **MongoDB**
- **Mongoose**
- **Redis**
- **JWT**
- **Joi**

### Security

- **Helmet**
- **CORS**
- **Express Rate Limit**
- JWT authentication
- Password hashing using `bcryptjs`

### API & Developer Experience

- **Swagger / OpenAPI**
- **Morgan**
- **Winston**
- **Prettier**

### Infrastructure

- **Docker**
- **Docker Compose**
- **GitHub Actions**

---

# Architecture

```text
                    Client
                      |
                      v
                Express API
                      |
        +-------------+-------------+
        |             |             |
        v             v             v
 Authentication    Rate Limit    Validation
        |             |             |
        |           Redis           |
        |             |             |
        +-------------+-------------+
                      |
             +--------+--------+
             |                 |
             v                 v
          MongoDB            Redis
        Persistent Data    Rate Limiting
```

The application is designed so that MongoDB remains the primary persistent data store while Redis is used for infrastructure concerns such as distributed rate limiting.

---

# Implemented Features

## 1. User Authentication

JWT-based authentication has been implemented.

### Authentication flows

- User signup
- User login
- Access token generation
- Refresh token generation
- Access token refresh
- Logout / refresh-token invalidation

Passwords are hashed using `bcryptjs` before being stored.

Protected APIs use authentication middleware to validate the access token.

---

## 2. Job Application CRUD

Authenticated users can manage their job applications.

### APIs

| Method | Endpoint      | Description                           |
| ------ | ------------- | ------------------------------------- |
| POST   | `/job/create` | Create a job application              |
| GET    | `/job`        | Get authenticated user's applications |
| GET    | `/job/:id`    | Get a specific application            |
| PUT    | `/job/:id`    | Update an application                 |
| DELETE | `/job/:id`    | Delete an application                 |

Job applications support fields such as:

- Role
- Company name
- Status
- Notes

Supported application statuses include:

- `applied`
- `interview`
- `offer`
- `rejected`

Pagination, filtering and sorting are also supported on the job listing API.

---

# API Validation

Request validation is implemented using **Joi**.

Validation middleware is used to validate incoming request bodies before they reach controllers.

Examples include:

- Signup validation
- Login validation
- Refresh-token validation
- Job creation validation
- Job update validation

This keeps validation logic separate from controllers.

---

# HTTP Security

Several common HTTP security practices have been implemented.

## Helmet

Helmet is applied globally to add security-related HTTP headers.

```js
app.use(helmet());
```

## CORS

CORS has been configured to control cross-origin requests.

## Rate Limiting

Rate limiting is implemented using:

- `express-rate-limit`
- Redis
- `rate-limit-redis`

Two different rate limiters are used:

### Authentication rate limiter

Protects authentication-related endpoints such as:

```text
/signup
/login
/refresh
/logout
```

### Job API rate limiter

The job API uses a **user-based rate limiter** rather than relying only on IP addresses.

This means the limit follows the authenticated user.

---

# Redis Integration

Redis is integrated as a shared infrastructure component.

Currently Redis is used for:

- Distributed rate limiting
- Rate-limit counters
- Expiration/TTL management

Separate Redis stores are used for different rate limiters.

Conceptually:

```text
Redis
 |
 +-- Authentication rate-limit store
 |
 +-- Job rate-limit store
```

The application uses a single Redis client while maintaining separate `RedisStore` instances for the individual rate limiters.

---

# Docker

The application is containerized using Docker.

Docker Compose is used to run the complete local environment:

```text
Docker Compose
 |
 +-- Backend
 |
 +-- MongoDB
 |
 +-- Redis
```

The backend connects to the Docker services using their Compose service names:

```text
mongodb
redis
```

Persistent MongoDB storage is configured using a Docker volume.

---

# Application Lifecycle Management

Graceful shutdown has been implemented to handle process termination signals.

The application listens for:

```text
SIGTERM
SIGINT
```

### Shutdown flow

```text
SIGTERM / SIGINT
       |
       v
Stop accepting new requests
       |
       v
Allow active requests to finish
       |
       v
Close HTTP server
       |
       v
Close Redis connection
       |
       v
Close MongoDB connection
       |
       v
Exit process
```

This is particularly important when running the application inside Docker or other container orchestration environments.

The application also distinguishes between successful and failed process termination using appropriate exit codes.

---

# Health & Readiness Checks

Two health-related endpoints have been implemented.

## Liveness

```http
GET /health
```

Determines whether the application process is alive.

Example:

```json
{
  "status": "ok"
}
```

## Readiness

```http
GET /ready
```

Checks whether required infrastructure is available.

Currently checks:

- MongoDB
- Redis

Example:

```json
{
  "status": "ready",
  "dependencies": {
    "mongodb": true,
    "redis": true
  }
}
```

If a required dependency is unavailable, the API returns:

```text
503 Service Unavailable
```

This provides a foundation for future load-balancer or container-orchestration deployments.

---

# Configuration Management

Application configuration is centralized and validated using Joi.

Environment variables are loaded through `dotenv` and validated during application startup.

Examples include:

```text
NODE_ENV
PORT
MONGO_URI
REDIS_URL
JWT_ACCESS_SECRET
JWT_REFRESH_SECRET
```

Instead of accessing environment variables throughout the application:

```js
process.env.MONGO_URI;
```

the application uses a centralized configuration object:

```js
config.mongoUri;
```

This provides:

- Centralized configuration
- Startup validation
- Fail-fast behavior for missing configuration
- Cleaner application code
- Easier environment-specific configuration

---

# Logging

Application logging is implemented using **Winston**.

Morgan is used for HTTP request logging:

```text
HTTP Request
     |
     v
Morgan
     |
     v
Winston
     |
     v
Application logs
```

This provides a foundation for more advanced observability in the future.

---

# API Documentation

Swagger/OpenAPI documentation has been integrated using:

- `swagger-jsdoc`
- `swagger-ui-express`

The API documentation is available at:

```text
/api-docs
```

The documented APIs include authentication and job-management endpoints.

---

# CI — Continuous Integration

A GitHub Actions CI pipeline has been introduced.

The current pipeline performs:

```text
Git Push / Pull Request
          |
          v
Checkout Repository
          |
          v
Setup Node.js
          |
          v
Install Dependencies
          |
          v
Check Prettier Formatting
          |
          v
Build Docker Image
```

The CI pipeline uses:

- GitHub Actions
- Node.js 26
- npm
- Prettier
- Docker

The Docker build step verifies that the application's Docker image can be successfully built.

Automated application testing is intentionally not part of the current pipeline.

---

# Project Structure

The project follows a modular Express structure:

```text
.
├── config/
│   ├── db.js
│   ├── env.js
│   ├── redis.js
│   └── swagger.js
│
├── controllers/
│   ├── job.controller.js
│   └── user.controller.js
│
├── middleware/
│   ├── auth.middleware.js
│   ├── error.middleware.js
│   ├── rate-limiter.middleware.js
│   ├── request-tracker.middleware.js
│   └── validation.middleware.js
│
├── models/
│   ├── job.model.js
│   └── user.model.js
│
├── routes/
│   ├── job.routes.js
│   ├── user.routes.js
│   └── health.routes.js
│
├── utils/
│   ├── graceful-shutdown.js
│   ├── logger.js
│   └── startServer.js
│
├── validators/
│   ├── job.validator.js
│   └── user.validator.js
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── Dockerfile
├── docker-compose.yml
├── package.json
└── app.js
```

---

# Running Locally

## Prerequisites

- Node.js 26+
- Docker
- Docker Compose
- Git

## Using Docker Compose

Start the complete application:

```bash
docker compose up --build
```

The backend will be available at:

```text
http://localhost:3000
```

Swagger documentation:

```text
http://localhost:3000/api-docs
```

Health check:

```text
http://localhost:3000/health
```

Readiness check:

```text
http://localhost:3000/ready
```

Stop the application:

```bash
docker compose down
```

---

# Environment Variables

The application requires environment configuration such as:

```env
NODE_ENV=development
PORT=3000

MONGO_URI=<mongodb-connection-string>

REDIS_URL=<redis-connection-string>

JWT_ACCESS_SECRET=<access-token-secret>
JWT_REFRESH_SECRET=<refresh-token-secret>
```

Secrets should never be committed to the repository.

---

# Current Engineering Focus

This project is being developed incrementally with an emphasis on understanding **how production backend systems are designed**, rather than simply implementing CRUD APIs.

Current areas covered include:

- REST API design
- JWT authentication
- Middleware architecture
- Request validation
- HTTP security
- Redis
- Distributed rate limiting
- User-based rate limiting
- Docker containerization
- Application lifecycle management
- Graceful shutdown
- Health/readiness checks
- Configuration management
- Logging
- API documentation
- Continuous Integration

---

# Roadmap

The following areas are planned for future implementation:

```text
[x] HTTP Security Concepts
[x] Helmet
[x] CORS
[x] Compression
[x] Rate Limiting
[x] Health Checks
[x] Configuration Management

[ ] CI/CD
[ ] Deployment
[ ] Observability
[ ] Performance Optimization
    [ ] MongoDB Indexing
    [ ] Load Testing
[ ] BullMQ / Background Jobs
[ ] Advanced Architecture

Optional:
[ ] WebSockets
[ ] File Storage
```

---

# Learning Goals

The long-term goal of this project is to evolve a simple Job Application Tracker into a backend system that demonstrates progressively more advanced engineering concepts:

```text
CRUD API
   ↓
Authentication
   ↓
Security
   ↓
Redis
   ↓
Rate Limiting
   ↓
Containerization
   ↓
Application Lifecycle
   ↓
Health & Readiness
   ↓
CI/CD
   ↓
Deployment
   ↓
Observability
   ↓
Performance & Scaling
   ↓
Background Processing
   ↓
Advanced Distributed Architecture
```

The project is intentionally being built incrementally so that each architectural decision can be understood and justified rather than added as unnecessary complexity.
Some change
