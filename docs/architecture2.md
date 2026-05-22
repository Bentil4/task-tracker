# Task Tracker API — Architecture & Codebase Guide

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Directory Structure](#3-directory-structure)
4. [Entry Points & Application Bootstrap](#4-entry-points--application-bootstrap)
5. [Routing](#5-routing)
6. [Controllers](#6-controllers)
7. [Database Models](#7-database-models)
8. [Middleware Stack](#8-middleware-stack)
9. [Validation & Sanitization](#9-validation--sanitization)
10. [Error Handling](#10-error-handling)
11. [Authentication & Authorization](#11-authentication--authorization)
12. [Utility Functions](#12-utility-functions)
13. [Request / Response Patterns](#13-request--response-patterns)
14. [Data Flow Walkthroughs](#14-data-flow-walkthroughs)
15. [Configuration](#15-configuration)
16. [Security Measures](#16-security-measures)
17. [Known Gaps & Recommendations](#17-known-gaps--recommendations)

---

## 1. Project Overview

Task Tracker is a RESTful API built with **Node.js + Express + TypeScript** for managing personal tasks and users. It supports two roles — `admin` and `user` — with full CRUD for tasks, user management, and JWT-based authentication.

---

## 2. Tech Stack

| Concern | Library / Tool |
|---|---|
| Runtime | Node.js |
| Framework | Express 5.2.1 |
| Language | TypeScript 6.0.2 |
| Database | MongoDB via Mongoose 9.4.1 |
| Authentication | JSON Web Tokens (`jsonwebtoken`) |
| Password Hashing | `bcrypt` |
| Input Validation | `Joi` |
| Input Sanitization | `isomorphic-dompurify` |
| Dev Server | `nodemon` + `ts-node` |
| Linting | ESLint |

---

## 3. Directory Structure

```
task-tracker/
├── src/
│   ├── app.ts                    # Express app factory — middleware + routes
│   ├── server.ts                 # HTTP server entry point + graceful shutdown
│   ├── config/
│   │   ├── db.ts                 # MongoDB connection
│   │   └── env.ts                # Environment variable validation
│   ├── controllers/
│   │   ├── authController.ts     # register, login
│   │   ├── taskController.ts     # task CRUD
│   │   └── userController.ts     # user CRUD + profile
│   ├── middlewares/
│   │   ├── authentication.ts     # JWT verification + RBAC
│   │   ├── errorHandler.ts       # Global error handler
│   │   ├── logger.ts             # HTTP request logger
│   │   └── notFound.ts           # 404 fallback
│   ├── models/
│   │   ├── User.model.ts         # User Mongoose schema + instance methods
│   │   └── Task.model.ts         # Task Mongoose schema
│   ├── routes/
│   │   ├── authRoutes.ts         # /auth/register, /auth/login
│   │   ├── taskRoutes.ts         # /api/tasks
│   │   └── userRoute.ts          # /api/users
│   ├── types/
│   │   ├── user.ts               # IUser, ICreateUserInput, UserRole
│   │   └── task.ts               # ITask, ICreateTaskInput, ITaskQueryParams
│   ├── utils/
│   │   ├── errors.ts             # HttpError custom class
│   │   ├── helper.ts             # validate(), sendSuccess(), wrapAsync()
│   │   └── sanitizeInput.ts      # Recursive DOMPurify sanitizer
│   └── validators/
│       ├── userValidator.ts      # Joi schemas for user fields
│       └── taskValidator.ts      # Joi schemas for task CRUD + query params
├── .env
├── package.json
└── tsconfig.json
```

---

## 4. Entry Points & Application Bootstrap

### `src/server.ts` — HTTP Server

This is the process entry point. It:

1. Loads `.env` via `dotenv.config()`.
2. Validates required environment variables (`JWT_SECRET`) via `src/config/env.ts`.
3. Calls `connectDB()` to establish the MongoDB connection.
4. Starts the Express app on `process.env.PORT` (default `3000`).
5. Registers `SIGTERM` and `SIGINT` handlers for graceful shutdown — closes the MongoDB connection before the process exits.

### `src/app.ts` — Express Application Factory

Configures the Express app and exports it. Middleware and routes are applied in this order:

```
express.json()
express.urlencoded({ extended: true })
loggerMiddleware
GET  /                    → health check ("Task Tracker API is running")
/auth                     → authRoutes   (public)
/api/tasks                → taskRoutes   (protected)
/api/users                → userRoutes   (protected)
notFoundHandler           → 404 catch-all
errorHandler              → global error handler
```

Order matters: `notFound` and `errorHandler` must be last.

### `src/config/db.ts` — MongoDB Connection

Uses `mongoose.connect()` with the `MONGODB_URI` environment variable. Connection errors are caught and re-thrown so `server.ts` can decide whether to abort startup.

### `src/config/env.ts` — Environment Validation

Validates that all required environment variables are present at startup and throws a descriptive error if any are missing, preventing silent misconfiguration.

---

## 5. Routing

### Authentication Routes — `/auth` (public)

```
POST /auth/register    → authController.registerUser
POST /auth/login       → authController.loginUser
```

### Task Routes — `/api/tasks` (protected: requires JWT)

```
GET    /api/tasks        → taskController.getAllTasks
GET    /api/tasks/:id    → taskController.getTaskById
POST   /api/tasks        → taskController.createTask
PUT    /api/tasks/:id    → taskController.updateTask
DELETE /api/tasks/:id    → taskController.deleteTask
```

The task router applies `authenticateToken` on all routes.

### User Routes — `/api/users` (protected: requires JWT)

```
GET    /api/users        → userController.getAllUsers     (admin only)
GET    /api/users/:id    → userController.getUserById     (self or admin)
PUT    /api/users/:id    → userController.updateUserEmail (self or admin)
DELETE /api/users/:id    → userController.deleteUser      (admin only)
```

The user router applies `authenticateToken` on all routes. Admin-only routes additionally apply `requireRole([UserRole.ADMIN])`.

---

## 6. Controllers

All controllers are wrapped with `wrapAsync()` so any thrown error is forwarded to the global error handler automatically.

### `authController.ts`

**`registerUser`**
- Sanitizes incoming body via `sanitizeInput()`.
- Checks MongoDB for a duplicate email; throws `HttpError(409)` if found.
- Creates a new `UserModel` instance. The `pre('save')` hook hashes the password before the document is persisted.
- Returns `201` with the created user (password excluded by the schema's `select: false`).

**`loginUser`**
- Finds user by email (password field explicitly selected back in with `.select('+password')`).
- Calls `user.comparePassword(candidatePassword)` (bcrypt comparison).
- Calls `user.generateAuthToken()` to produce a signed JWT.
- Returns the token in both the `Authorization: Bearer <token>` response header and the JSON body.

### `taskController.ts`

**`getAllTasks`**
- Validates query parameters (pagination, sort, filter) against `querySchema`.
- Non-admin users: filter is scoped to `userId = req.user.id`.
- Supports: `search` (regex on `title`), `completed` (boolean filter), `sortBy` / `order`, `page` / `limit` (pagination).
- Runs `find()` and `countDocuments()` in parallel, returns metadata + results.

**`getTaskById`** / **`updateTask`** / **`deleteTask`**
- All fetch the task by `_id` first; throw `HttpError(404)` if not found.
- Non-admins are denied if `task.userId !== req.user.id` (throws `HttpError(403)`).

**`createTask`**
- Validates body against `createSchema`.
- Attaches `userId: req.user.id` before saving.

### `userController.ts`

**`getAllUsers`** — admin-only, returns all user documents.

**`getUserById`** — throws `403` if non-admin accesses another user's profile.

**`updateUserEmail`** — partial update of the email field only; enforces self-or-admin access.

**`deleteUser`** — admin-only hard delete.

---

## 7. Database Models

### `User.model.ts`

```typescript
{
  fullName : String  // 5–100 chars, required, trimmed
  email    : String  // 5–50 chars, required, unique, lowercase, trimmed
  role     : String  // enum: "admin" | "user", default: "user"
  password : String  // 8–1024 chars, required, select: false (hidden by default)
                     // Must contain uppercase, lowercase, digit, special char
  createdAt: Date    // auto-generated
}
```

**Pre-save hook** (`pre('save')`): hashes `password` with `bcrypt.hash(password, 10)` only when the field is modified.

**Instance methods:**
- `comparePassword(candidate: string): Promise<boolean>` — wraps `bcrypt.compare`.
- `generateAuthToken(): string` — signs `{ id, email, role }` with `JWT_SECRET`; expiry from `JWT_EXPIRES_IN` (default `1h`).

### `Task.model.ts`

```typescript
{
  title    : String   // required, non-empty, trimmed
  completed: Boolean  // default: false
  userId   : ObjectId // required, ref: "User"
  createdAt: Date     // auto-managed (timestamps: true)
  updatedAt: Date     // auto-managed (timestamps: true)
}
```

`userId` is a foreign key reference to the `User` collection and is used for ownership enforcement across all task operations.

---

## 8. Middleware Stack

### `authentication.ts`

**`authenticateToken`**

Reads the `Authorization` header expecting `Bearer <token>`.

- No header → `HttpError(401, "No token provided")`
- Invalid / expired token → `HttpError(403, "Invalid or expired token")`
- Valid token → decodes payload, sets `req.user = { id, email, role }`, calls `next()`.

**`requireRole(roles: UserRole[])`**

A factory that returns an Express middleware:

```typescript
requireRole([UserRole.ADMIN])
```

Checks `req.user.role` against the allowed roles array. If not included, throws `HttpError(403, "Insufficient permissions")`.

### `errorHandler.ts`

The four-argument Express error handler `(err, req, res, next)` — always registered **last** in `app.ts`.

| Error type | Status code |
|---|---|
| `HttpError` instance | `err.statusCode` |
| Joi `ValidationError` | `400` |
| Any other `Error` | `500` |

Response body:
```json
{ "status": "error", "message": "...", "stack": "..." }
```
`stack` is only included when `NODE_ENV === "development"`.

### `logger.ts`

Logs every inbound request with method, URL, and ISO timestamp:

```
[2026-05-19T10:00:00.000Z] GET /api/tasks
```

### `notFound.ts`

Registered just before `errorHandler`. Catches any request that fell through all routers and throws:

```typescript
HttpError(404, `Cannot ${method} ${path}`)
```

---

## 9. Validation & Sanitization

### Input Sanitization — `utils/sanitizeInput.ts`

Applied at the controller level before any database interaction. Uses `isomorphic-dompurify` to strip HTML/script injection vectors. The utility recursively walks the input object:

- Strings → `DOMPurify.sanitize(value).trim()`
- Objects → recurse into each property
- Arrays → map each element

This prevents XSS even if the value is later rendered in a front-end.

### Request Validation — `validators/`

Validation is performed by calling `validate(schema, payload)` from `utils/helper.ts`.

**`userValidator.ts`** exports reusable Joi schemas:

| Schema | Constraints |
|---|---|
| `fullNameSchema` | string, 5–100 chars |
| `emailSchema` | valid email, 5–50 chars |
| `passwordSchema` | regex: ≥1 upper, lower, digit, special; 8–1024 chars |
| `roleSchema` | enum: `admin` \| `user` |
| `userSchema` | combined object schema |

**`taskValidator.ts`** exports:

| Schema | Usage |
|---|---|
| `createSchema` | `title` (required), `completed` (bool, default false) |
| `updateSchema` | `title` and/or `completed` (at least one required) |
| `querySchema` | `page`, `limit`, `sortBy`, `order`, `completed`, `search` |

**Joi options used everywhere:**

```typescript
{ abortEarly: false, allowUnknown: false, stripUnknown: true }
```

`abortEarly: false` collects all field errors before throwing. `stripUnknown: true` silently removes fields not in the schema, preventing property pollution.

---

## 10. Error Handling

### `utils/errors.ts` — `HttpError`

```typescript
class HttpError extends Error {
  statusCode: number;
  constructor(statusCode: number, message: string)
}
```

Thrown anywhere in the codebase to signal a known HTTP error condition. The global error handler reads `statusCode` to set the response status.

### `utils/helper.ts` — `wrapAsync`

```typescript
function wrapAsync(fn: AsyncRequestHandler): RequestHandler {
  return (req, res, next) => fn(req, res, next).catch(next);
}
```

Every controller route handler is wrapped with this. Unhandled promise rejections (Mongoose errors, `HttpError`, Joi errors) flow into `next(err)` automatically — no per-route try/catch required.

### Full Error Flow

```
Controller throws HttpError(404)
  → .catch(next) in wrapAsync
    → next(err) passed to Express
      → errorHandler(err, req, res, next)
        → res.status(404).json({ status: "error", message: "..." })
```

### Common HTTP Error Codes

| Code | Cause |
|---|---|
| 400 | Joi validation failure |
| 401 | Missing Authorization header |
| 403 | Invalid/expired token, insufficient role, ownership violation |
| 404 | Document not found, unknown route |
| 409 | Duplicate email on registration |
| 500 | Unhandled database or application error |

---

## 11. Authentication & Authorization

### JWT Authentication Flow

```
1. Client  → POST /auth/register  (fullName, email, password)
2. Server  → hashes password, saves user, returns 201
3. Client  → POST /auth/login     (email, password)
4. Server  → verifies password, signs JWT { id, email, role }
5. Server  → returns token in body + Authorization header
6. Client  → stores token, sends with every request:
             Authorization: Bearer <token>
7. Server  → authenticateToken middleware decodes token
8. Server  → req.user = { id, email, role } available to all downstream handlers
```

Token payload: `{ id: ObjectId, email: string, role: UserRole }`
Signature: `JWT_SECRET` from environment
Expiry: `JWT_EXPIRES_IN` (default `1h`)

### Role-Based Access Control

| Role | Capabilities |
|---|---|
| `user` | Own tasks (CRUD), own profile (read/update) |
| `admin` | All tasks, all users (CRUD), any profile |

Ownership checks in controllers:
```typescript
if (req.user.role !== UserRole.ADMIN && task.userId.toString() !== req.user.id) {
  throw new HttpError(403, "Access denied");
}
```

---

## 12. Utility Functions

### `utils/helper.ts`

**`validate<T>(schema: Joi.Schema, payload: unknown): T`**

Runs Joi validation and throws `HttpError(400, messages)` where `messages` is the joined list of all Joi error details. Returns the validated (and stripped) value on success.

**`sendSuccess<T>(res, statusCode, data, message)`**

Standardised success response helper:
```json
{ "success": true, "message": "...", "data": { ... } }
```

**`wrapAsync(fn)`** — described in [Error Handling](#10-error-handling).

---

## 13. Request / Response Patterns

### Success Response

```json
{
  "success": true,
  "message": "Tasks retrieved successfully.",
  "data": {
    "tasks": [...],
    "total": 42,
    "page": 1,
    "limit": 10
  }
}
```

### Error Response

```json
{
  "status": "error",
  "message": "Validation failed: title is required",
  "stack": "Error: ..."
}
```
(`stack` only in `development`)

### HTTP Status Convention

| Situation | Code |
|---|---|
| Successful retrieval | 200 |
| Resource created | 201 |
| Validation error | 400 |
| Unauthenticated | 401 |
| Forbidden / ownership | 403 |
| Not found | 404 |
| Duplicate resource | 409 |
| Server error | 500 |

---

## 14. Data Flow Walkthroughs

### Registration

```
POST /auth/register
  → loggerMiddleware
  → express.json() parses body
  → authRoutes → authController.registerUser (wrapped in wrapAsync)
    → sanitizeInput(req.body)
    → UserModel.findOne({ email }) → 409 if exists
    → new UserModel(sanitized) .save()
      → pre('save') hook: bcrypt.hash(password, 10)
    → sendSuccess(res, 201, user)
```

### Login

```
POST /auth/login
  → authController.loginUser
    → UserModel.findOne({ email }).select('+password')
    → user.comparePassword(req.body.password) → 401 if false
    → user.generateAuthToken() → signed JWT
    → res.setHeader('Authorization', 'Bearer ' + token)
    → sendSuccess(res, 200, { token })
```

### Fetch Tasks (paginated)

```
GET /api/tasks?page=2&limit=5&search=meeting
  → authenticateToken → req.user = { id, email, role }
  → taskController.getAllTasks
    → validate(querySchema, req.query)
    → build filter: { userId: req.user.id, title: /meeting/i }
    → Promise.all([Task.find(filter).skip().limit(), Task.countDocuments(filter)])
    → sendSuccess(res, 200, { tasks, total, page, limit })
```

### Error path (invalid JWT)

```
GET /api/tasks  (expired token)
  → authenticateToken
    → jwt.verify() throws JsonWebTokenError
    → HttpError(403, "Invalid or expired token") thrown
    → wrapAsync .catch(next)
    → errorHandler → res.status(403).json({ status: "error", message: "..." })
```

---

## 15. Configuration

### `.env` variables

| Variable | Purpose |
|---|---|
| `PORT` | HTTP server port (default `3000`) |
| `NODE_ENV` | `development` \| `production` — controls stack trace exposure |
| `MONGODB_URI` | Full MongoDB connection string |
| `DB_PASSWORD` | Used inside `MONGODB_URI` |
| `JWT_SECRET` | HMAC secret for signing tokens |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `1h`, `7d` |

### `tsconfig.json` highlights

- `target: ES2020`, `module: NodeNext`
- `strict: true` — full TypeScript strict mode
- `rootDir: src/`, `outDir: dist/`

### `package.json` scripts

| Script | Command |
|---|---|
| `dev` | `ts-node src/server.ts` |
| `build` | `tsc` |
| `start` | `nodemon dist/server.js` |

---

## 16. Security Measures

| Measure | Implementation |
|---|---|
| Password hashing | bcrypt, 10 salt rounds, pre-save hook |
| Token signing | HS256 JWT, secret from env, 1h expiry |
| XSS prevention | DOMPurify on all user-supplied strings |
| NoSQL injection | Mongoose schema typing + Joi `stripUnknown` |
| Role enforcement | `requireRole()` middleware on sensitive routes |
| Ownership check | Controller-level `userId` comparison |
| Secret management | All secrets in `.env`, not hardcoded |
| Error leakage | Stack traces gated behind `NODE_ENV=development` |

---

## 17. Known Gaps & Recommendations

| Area | Current State | Recommendation |
|---|---|---|
| CORS | Not configured | Add `cors` middleware before routes; restrict origins in production |
| Rate limiting | Not implemented | Add `express-rate-limit` on `/auth` routes to prevent brute-force |
| HTTPS | Not enforced | Terminate TLS at a reverse proxy (nginx/Caddy) or cloud load balancer |
| Structured logging | `console.log` in `logger.ts` | Replace with Winston or Pino for JSON logs with log levels |
| Request IDs | Absent | Add `x-request-id` header for distributed tracing |
| Refresh tokens | Single-use JWT | Implement refresh token rotation for longer sessions |
| Input size limits | Not set | Add `express.json({ limit: '10kb' })` to prevent large-payload DoS |
| DB indexes | Email unique index only | Add index on `Task.userId` for query performance at scale |
| Test coverage | No tests visible | Add Jest + Supertest integration tests for routes |
