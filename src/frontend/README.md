# Frontend - Next.js Application

This is the frontend for the X.509 Certificate Management System. It is built with Next.js, React, TypeScript, Supabase client libraries, and a small set of UI helpers for authentication, API calls, notifications, and file downloads.

## What this app does

- Provides the customer and admin user interface for the certificate lifecycle.
- Handles sign in, sign up, logout, and session-based route protection.
- Calls the Flask backend for certificate requests, approvals, revocations, and related workflows.
- Uses role-based routing so admin-only pages stay separated from customer pages.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.1.7 |
| UI | React 19.2.3, TypeScript, Tailwind CSS 4 |
| Auth/Data Client | Supabase JS, Supabase SSR |
| API | Axios |
| Session/Cookies | `js-cookie`, `jose` |
| UX Utilities | `react-toastify`, `file-saver`, `lucide-react` |
| Testing | Playwright |

## Prerequisites

- Node.js 20+ recommended
- `pnpm`
- A configured backend service running on port 5000

## Setup

1. Install dependencies.

   ```bash
   cd src/frontend
   pnpm install
   ```

2. Create your local environment file.

   ```bash
   cp .env.example .env.local
   ```

3. Fill in the required values.

   Minimum variables used by the app:

   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_API_BASE_URL`
   - `JWT_SECRET_KEY`

   If you use the admin server route, also provide `SUPABASE_SERVICE_ROLE_KEY`.

## Run Locally

```bash
pnpm dev
```

The app starts on `http://localhost:3000`.

Other useful commands:

```bash
pnpm build
pnpm start
pnpm lint
pnpm test:e2e
```

## Environment Notes

- `NEXT_PUBLIC_API_BASE_URL` is used by the frontend API clients. If it is missing, the code falls back to `http://localhost:5000`.
- The auth and middleware flow reads session cookies and JWT data to protect routes.
- The backend must be reachable from the browser before most pages can complete their workflows.

## Project Structure

- `app/` - route groups, pages, and API routes
- `components/` - reusable UI components
- `context/` - React context such as loading state
- `lib/` - API clients, Supabase helpers, and shared frontend logic
- `public/` - static assets
- `schema/` - frontend-facing TypeScript data structures
- `proxy.ts` - request-time route protection and token checks

## Main Workflows

- Customer registration and login
- Admin and customer dashboard routing
- Certificate request submission and status tracking
- Certificate download and related file actions
- Password change with re-authentication
- Admin-only checks and management actions

## Testing

Recommended checks for local development:

1. `pnpm lint`
2. `pnpm test:e2e`
3. Manual smoke test: open `/register`, sign in, and verify the dashboard can reach the backend

If a test fails, first confirm that `NEXT_PUBLIC_API_BASE_URL` points to the running backend and that the required Supabase variables are present.

## Troubleshooting

- If the app cannot call the backend, confirm the Flask service is running on port 5000.
- If auth or protected routes fail, recheck the cookie/JWT secrets in `.env.local`.
- If admin routes fail in development, make sure the Supabase service role key is available to the server-side route code.

## Related Docs

- [Backend README](../backend/README.md)
- [Backend API notes](../backend/api.md)
- [Project requirements](../../docs/requirements/REAME.md)
- [Database design notes](../../docs/design/db-design/ER-spec.md)