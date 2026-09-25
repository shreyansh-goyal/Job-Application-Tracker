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

# Performance: MongoDB Indexing & Load Testing

The job-listing endpoint (`GET /job`) is the hottest read path — it's filtered by `userId` (always), optionally by `status`/`companyName`, sorted (default `createdAt`), and paginated. Before this work, the `Job` collection only had a `{ userId, companyName, role }` unique index, which exists purely to enforce "no duplicate company+role per user" — it does nothing for the `status` filter or the `createdAt` sort, so every listing query fell back to scanning every job belonging to the user and sorting in memory.

## Indexes added

```js
jobSchema.index({ userId: 1, createdAt: -1 }); // default listing, newest first
jobSchema.index({ userId: 1, status: 1, createdAt: -1 }); // status-filtered listing, newest first
```

- `{ userId: 1, createdAt: -1 }` serves the unfiltered "my jobs, newest first" case directly off the index, in the exact order the API returns them in.
- `{ userId: 1, status: 1, createdAt: -1 }` serves the `?status=` filtered case the same way. A query that filters on two fields and sorts by a third generally needs a compound index in that order — a query that skips the middle field (`status`) can't use this index for a globally sorted result, which is why the plain `{ userId, createdAt }` index exists separately.
- The existing `{ userId, companyName, role }` unique index is untouched and still serves the `?companyName=` filter as a prefix match.

## Verifying with `explain('executionStats')`

Tested against a seeded collection of **250,000 documents** (50,000 belonging to one test user, the rest spread across 400 other users, to make the query actually need to narrow down a real haystack).

| Query                                                      | Metric                | Before                       | After                      |
| ---------------------------------------------------------- | --------------------- | ---------------------------- | -------------------------- |
| `GET /job` (no filters, sort by `createdAt`, page 1)       | `totalDocsExamined`   | 50,000                       | **10**                     |
|                                                            | `executionTimeMillis` | 259ms                        | **4ms**                    |
| `GET /job?status=interview` (sort by `createdAt`, page 50) | `totalDocsExamined`   | 50,000                       | **10**                     |
|                                                            | winning stage         | `SORT` (blocking, in-memory) | `FETCH` (index order)      |
|                                                            | `executionTimeMillis` | 259ms                        | **4ms**                    |
| `GET /job?status=offer` (count-style, no sort)             | `totalDocsExamined`   | 50,000                       | **12,634** (= `nReturned`) |
|                                                            | `executionTimeMillis` | 242ms                        | **34ms**                   |

The headline number: listing a page of 10 jobs went from examining **all 50,000** of a user's documents to examining **exactly 10** — the index lets MongoDB fetch only the documents it actually returns instead of scanning-then-filtering-then-sorting the whole set.

## Load testing with k6

Ran a [k6](https://k6.io) ramping-VU test against `GET /job` (mixing filtered and unfiltered requests, random pages) against the same 250k-document dataset, stepping from 10 → 100 concurrent virtual users over ~3.5 minutes, indexes dropped vs. present:

| Metric (at up to 100 concurrent VUs) | Before (no listing indexes) | After (with indexes) |
| ------------------------------------ | --------------------------- | -------------------- |
| Throughput                           | 285.7 req/s                 | **316.5 req/s**      |
| p90 latency                          | 50.9ms                      | 51.8ms               |
| p95 latency                          | 61.2ms                      | 60.6ms               |
| **p99 latency**                      | **787.5ms**                 | **80.2ms**           |
| Max latency                          | 1.78s                       | 339ms                |
| Error rate                           | 0%                          | 0%                   |

At this dataset size the median/p90 latency is nearly identical before and after — the user's 50,000-document working set fits comfortably in MongoDB's in-memory cache, so a full scan is still fast most of the time. The indexing win shows up in the **tail**: without the right index, full collection scans under concurrent load occasionally spike to 700ms-1.8s as scans contend for CPU/cache; with the index, `p99` and `max` stay tightly bounded because every query does ~5,000x less work (`totalDocsExamined` 50,000 → 10) regardless of concurrency. That gap only grows once the dataset outgrows RAM, which is the case the index is really protecting against.

**Methodology note:** the per-user job-listing rate limit (500 req/15min) was temporarily raised for the duration of these load-test runs only, then reverted — otherwise the test would measure "how fast do we hit 429s" rather than real query throughput.

## Load, stress & spike tests: before vs. after caching + indexing

The three k6 scripts in [`loadtest/`](loadtest/README.md) were each run twice against the local Docker Compose stack:

- **Before:** Redis job-list cache disabled, and the `{ userId, createdAt }` and `{ userId, status, createdAt }` listing indexes dropped.
- **After:** Redis cache enabled, and both listing indexes present.

**Setup:**

- **Dataset:** 250,000 jobs. Each of the 15 load-test users has 10,000, and another 100,000 are spread across 400 other users.
- **Traffic mix:** each VU iteration is 70% `GET /job` (random page and status filter), 15% list followed by `GET /job/:id`, 10% `POST /job/create` and 5% create followed by `PUT /job/:id`.
- **Rate limiter:** `jobRateLimiter` was removed for these runs, so the numbers show real server capacity rather than 429s.
- **Cache state:** Redis was flushed before every run, so each "after" run starts with a cold cache.

### Load test (steady 20 VUs for 3 min)

| Metric      | Before     | After      | Change      |
| ----------- | ---------- | ---------- | ----------- |
| Requests    | 9,257      | 9,577      | +3%         |
| Throughput  | 40.9 req/s | 42.3 req/s | +3%         |
| Avg latency | 18.7ms     | **6.5ms**  | 2.9x faster |
| Median      | 21.7ms     | **6.4ms**  | 3.4x        |
| p90         | 29.9ms     | **8.7ms**  | 3.4x        |
| p95         | 33.4ms     | **9.6ms**  | 3.5x        |
| Max         | 93.3ms     | 89.5ms     | —           |
| Error rate  | 0%         | 0%         | —           |

Throughput is capped by the script's 0.5s think time, so the gain here shows up in latency rather than req/s.

### Stress test (ramps 20 → 50 → 100 → 200 → 300 VUs)

| Metric         | Before      | After           | Change |
| -------------- | ----------- | --------------- | ------ |
| Requests       | 76,109      | **238,846**     | 3.1x   |
| Throughput     | 158.2 req/s | **496.3 req/s** | 3.1x   |
| Avg latency    | 626ms       | **85ms**        | 7.4x   |
| Median         | 412ms       | **57ms**        | 7.2x   |
| p90            | 1,709ms     | **219ms**       | 7.8x   |
| p95            | 1,927ms     | **256ms**       | 7.5x   |
| Max            | 2,647ms     | **867ms**       | 3.1x   |
| `GET /job` p95 | 1,983ms     | **252ms**       | 7.9x   |
| Writes p95     | 1,117ms     | **317ms**       | 3.5x   |
| Error rate     | 0%          | 0%              | —      |

### Spike test (10 → 150 VUs in 5s, hold 30s, back to 10)

| Metric      | Before     | After           | Change |
| ----------- | ---------- | --------------- | ------ |
| Requests    | 12,091     | **32,970**      | 2.7x   |
| Throughput  | 95.9 req/s | **261.3 req/s** | 2.7x   |
| Avg latency | 365ms      | **27ms**        | 13.3x  |
| Median      | 113ms      | **25ms**        | 4.4x   |
| p90         | 943ms      | **52ms**        | 18x    |
| p95         | 1,018ms    | **64ms**        | 15.9x  |
| Max         | 1,534ms    | **147ms**       | 10.4x  |
| Error rate  | 0%         | 0%              | —      |

**Takeaways:**

- **Throughput:** under heavy concurrency the API sustains about 3x more traffic, going from 158 to 496 req/s in the stress test.
- **Latency:** p95 drops 7-16x, and there are zero 5xx errors in every run.
- **Burst handling:** the gap is widest in the spike test. Without the cache and indexes, a sudden burst queues up behind `SORT`-stage scans of each user's 10,000 jobs, which pushes p95 past 1s. With them, most reads are Redis hits or index-bounded fetches of 10 documents, so p95 stays at 64ms even at 150 VUs.
- **Writes:** writes get faster too, from 1,117ms to 317ms p95 under stress, because they no longer compete with expensive list queries for MongoDB CPU.

These numbers measure caching and indexing together. They do not isolate each one's individual contribution.

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
[x] Performance Optimization
    [x] MongoDB Indexing
    [x] Load Testing
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
