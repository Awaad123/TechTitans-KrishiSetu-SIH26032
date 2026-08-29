# KrishiSetu

KrishiSetu is the TechTitans prototype for SIH26032. See `README.md` for the product overview, demo access, architecture and limitations.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- The current internal-hackathon prototype uses seeded in-memory data.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- Prototype data: seeded in-memory records
- Planned production DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/krishisetu` — React web interface
- `artifacts/api-server` — Express API and prototype workflow
- `lib/api-spec` — OpenAPI contract
- `lib/api-client-react` — generated frontend API client
- `lib/api-zod` — generated Zod validation schemas

## Architecture decisions

- The farmer and officer interfaces share one REST API.
- The prototype uses in-memory data so the complete workflow is easy to demonstrate.
- Persistent PostgreSQL storage, password hashing and production security controls are part of the next implementation phase.

## Product

Farmers reserve procurement slots, receive digital tokens and track queue, procurement and payment status. Officers manage centres, slots, arrivals, weighing, pricing and status updates.

## Gotchas

- Prototype data resets when the API restarts.
- Payment is status tracking only; the prototype does not transfer funds.
- Demo passwords are intentionally simple and must be replaced for production.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
