# Announcements API

JSON REST API for an announcements board: JWT auth, announcement CRUD, and ownership checks for update/delete.

## Features

- **Auth:** register, login, refresh (token rotation), logout, me
- **Announcements:** list with pagination / search / sorting, get by id, create / update / delete
- Public GET endpoints; create/update/delete require authentication
- Access token: 15 minutes; refresh token: 7 days (stored in DB)
- Tokens returned in JSON and optionally set as HttpOnly cookies
- Interactive docs: Swagger UI at `/api-docs`

## Tech stack

| Layer | Stack |
|-------|-------|
| Runtime | Node.js, TypeScript (ESM), `tsx` |
| HTTP | Express 5 |
| Database | PostgreSQL + Prisma 7 |
| Validation | Zod |
| Auth | JWT (`jsonwebtoken`), bcrypt, cookie-parser |
| Docs | `@asteasolutions/zod-to-openapi`, swagger-ui-express |
| Infra | Docker Compose (Postgres) |

### Project structure

```
announcements_app/
├── app.ts
├── db.ts
├── prisma.config.ts
├── package.json
├── tsconfig.json
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── prisma/
│   └── schema.prisma
└── src/
    ├── config/
    │   ├── config.ts
    │   └── index.ts
    ├── constants/
    │   ├── pagination.ts
    │   ├── routes.ts
    │   └── userSelect.ts
    ├── controllers/
    │   ├── auth.controller.ts
    │   └── announcements.controller.ts
    ├── docs/
    │   ├── index.ts
    │   ├── openapi.ts
    │   ├── swagger.ts
    │   ├── paths/
    │   │   ├── index.ts
    │   │   ├── auth.paths.ts
    │   │   └── announcements.paths.ts
    │   └── schemas/
    │       ├── auth.schemas.ts
    │       └── announcements.schemas.ts
    ├── middlewares/
    │   ├── authenticate.ts
    │   ├── validate.ts
    │   └── errorHandler.ts
    ├── repositories/
    │   ├── auth.repository.ts
    │   └── announcements.repository.ts
    ├── routes/
    │   ├── auth.routes.ts
    │   └── announcements.routes.ts
    ├── services/
    │   ├── auth.services.ts
    │   ├── token.service.ts
    │   └── announcements.services.ts
    ├── utils/
    │   └── auth.ts
    └── validations/
        ├── auth.validator.ts
        └── announcements.validator.ts
```

## Quick start

### 1. Install dependencies

```bash
npm install
```

### 2. Environment

Copy `.env.example` to `.env` and fill in values (especially `JWT_SECRET` and DB password).

### 3. Start Postgres

```bash
npm run docker:up
```

### 4. Prisma

```bash
npm run prisma:generate
npm run prisma:migrate -- --name init
```

(If migrations are already applied, Prisma will report `Already in sync`.)

### 5. Run the API

```bash
npm run dev
```

Server: [http://localhost:3000](http://localhost:3000)  
Swagger: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

## Useful commands

| Command | Description |
|---------|-------------|
| `npm run dev` | API with hot-reload |
| `npm start` | API without watch |
| `npm run docker:up` | Postgres only |
| `npm run docker:up:app` | app + Postgres in Docker |
| `npm run docker:down` | stop Compose |
| `npm run docker:logs` | container logs |
| `npm run prisma:migrate` | run migrations |
| `npm run prisma:generate` | generate Prisma Client |

## Main endpoints

### Auth

| Method | Path | Auth |
|--------|------|------|
| POST | `/auth/register` | no |
| POST | `/auth/login` | no |
| POST | `/auth/refresh` | no (refresh token in body) |
| POST | `/auth/logout` | Bearer |
| GET | `/auth/me` | Bearer |

### Announcements

| Method | Path | Auth |
|--------|------|------|
| GET | `/announcements` | no (`page`, `search`, `sort`) |
| GET | `/announcements/:id` | no |
| POST | `/announcements` | Bearer |
| PATCH | `/announcements/:id` | Bearer + ownership |
| DELETE | `/announcements/:id` | Bearer + ownership |

Protected requests:

```http
Authorization: Bearer <accessToken>
```

## Notes

- Passwords are stored only as bcrypt hashes.
- The `password` field is never returned in API responses.
- Updating/deleting someone else's announcement returns `403` with `Access denied`.
- List pagination is fixed at **10** items per page.
