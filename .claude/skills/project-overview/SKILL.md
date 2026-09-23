---
name: project-overview
description: Explains this repo's stack, folder structure, auth/job API design, Redis rate-limiting setup, health checks, graceful shutdown, and the CI/CD pipeline (GitHub Actions -> AWS ECR -> SSM deploy to EC2). Use when you need context on how this project is put together, e.g. before making architectural changes, debugging CI/CD, or onboarding to a part of the codebase you haven't touched yet.
---

# Job Application Tracker System — Project Overview

Node.js/Express backend for managing job applications, built as a learning project focused on production-grade backend engineering practices (not just CRUD). Each concept (auth, security, Redis, rate limiting, containers, lifecycle, health checks, CI/CD, ...) is added deliberately and incrementally so it can be understood, not just implemented.

## Stack
Express 5, MongoDB via Mongoose, Redis, RabbitMQ (amqplib), JWT auth (jsonwebtoken + bcryptjs), Joi validation, Helmet + CORS, express-rate-limit + rate-limit-redis, Winston + Morgan logging, Swagger (swagger-jsdoc/swagger-ui-express) at `/api-docs`, Docker + Docker Compose, GitHub Actions CI/CD, Prettier formatting. **No automated test suite exists yet** — CI does not run tests.

## Structure
- `config/` — db.js, env.js (centralized Joi-validated env config; access via `config.mongoUri` etc., never raw `process.env`), redis.js, rabbitmq.js (connection/channel + `job-events` topic exchange), swagger.js
- `controllers/` — job.controller.js, user.controller.js, health.controller.js
- `middleware/` — auth.middleware.js (JWT), error.middleware.js, rate-limiter.middleware.js (separate limiters for auth vs job APIs — job limiter is per-user, not per-IP), request-tracker.middleware.js, validation.middleware.js (Joi)
- `db/models/` — job.schema.js, user.schema.js
- `routes/` — job.routes.js, user.routes.js, health.routes.js
- `services/` — cache.service.js (Redis job-list cache invalidation), event-publisher.service.js (RabbitMQ producer: `publishJobCreated`, `publishJobStatusChanged`)
- `validators/` — job.validator.js, user.validator.js (Joi schemas)
- `utils/` — jwt.utils.js, logger.js (Winston), startServer.js, graceful-shutdown.utils.js, app.error.js, general.utils.js
- `app.js` — API entrypoint, wires middleware/routes; `startServer.js` boots the app after Mongo/Redis/RabbitMQ connect
- `worker.js` — separate consumer entrypoint (run via `npm run worker` or its own Docker Compose service); binds queue `job-notifications` to the `job-events` exchange with routing pattern `job.#`, manual ack/nack, `prefetch(1)`

## RabbitMQ (producer/consumer)
Real event-driven pub/sub, not cron. The API process (producer) publishes to a durable topic exchange `job-events`:
- `job.created` — on `POST /job/create`
- `job.status.changed` — on `PUT /job/:id` when `status` actually changes (includes previous + new status)

`worker.js` runs as an independent process/container (producer and consumer scale/deploy separately), consumes with manual ack, and currently just logs a "notification" (stand-in for a future email/SMS integration) — this is the seam to extend for real side effects. RabbitMQ management UI is exposed at `http://localhost:15672` (guest/guest) when running via Docker Compose.

## Auth
JWT access + refresh tokens. Signup/login/refresh/logout flow. Passwords hashed with bcryptjs. `authMiddleware` protects `/job/*` routes.

## Job API
`POST /job/create`, `GET /job` (paginated/filtered/sorted), `GET /job/:id`, `PUT /job/:id`, `DELETE /job/:id`. Statuses: applied, interview, offer, rejected.

## Health
`GET /health` (liveness), `GET /ready` (readiness — checks MongoDB + Redis, returns 503 if a dependency is down).

## Redis
Currently used only for distributed rate limiting — separate `RedisStore` instances for the auth-endpoint limiter and the job-API limiter, sharing one Redis client.

## Graceful shutdown
Listens for SIGTERM/SIGINT, drains in-flight requests, closes HTTP server → Redis → MongoDB, then exits with an appropriate code.

## CI/CD (`.github/workflows/ci.yml`, "Backend CI")
On every push/PR: checkout, setup Node 26, `npm ci`, `npm run format:check` (Prettier). Then, via AWS OIDC role assumption: builds and pushes the Docker image to ECR (`job-application-tracker` repo, `ap-south-1`). On push to `main` only: assumes a second IAM role and deploys via AWS SSM `send-command` to an EC2 instance tagged `App=job-application-tracker` — pulls the new image, stops/removes the old container, runs the new one (port 80→3000), then curls `/health` to verify.

CI/CD has been the actively debugged area recently (several "fix ci/cd" commits in a row) — check current git log/CI run status before assuming the pipeline is stable.

## Roadmap
Done: HTTP security, rate limiting, health checks, config management. In progress: CI/CD. Planned: deployment hardening, observability, MongoDB indexing, load testing, BullMQ background jobs, advanced architecture. Optional: WebSockets, file storage.
