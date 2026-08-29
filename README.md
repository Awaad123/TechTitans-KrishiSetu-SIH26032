# KrishiSetu

**Team:** TechTitans  
**Smart India Hackathon 2026**  
**Problem Statement:** SIH26032

KrishiSetu is a responsive web prototype that helps farmers reserve procurement slots, receive digital tokens, follow queue progress, and track procurement and payment status. Procurement officers use a separate dashboard to manage centres, slots, farmer arrivals, weighing, pricing, and status updates.

## Live prototype

https://f1cb131d-fba2-4370-9f67-76f0d0aadd5f-00-y2re91skerni.pike.repl.co/

## Main features

- Farmer registration and role-based sign-in
- Procurement-centre and slot selection
- Capacity checks and duplicate-booking protection
- Digital token and queue-position display
- Farmer booking, procurement, and payment-status tracking
- Officer dashboard for centre, slot, queue, and farmer management
- Mobile-friendly heritage-inspired interface
- Seeded demo records for prototype evaluation

## Demo accounts

| Role | Username | Password |
| --- | --- | --- |
| Farmer | `farmer@krishisetu.in` | `farmer123` |
| Procurement officer | `admin@krishisetu.in` | `admin123` |

These credentials are only seeded prototype data and must not be used in production.

## Technology

- Frontend: React, TypeScript, Vite, Tailwind CSS, TanStack Query and Wouter
- Backend: Node.js, Express and TypeScript
- API: REST endpoints with OpenAPI-generated clients and Zod validation
- Prototype storage: in-memory data seeded for demonstration
- Planned production storage: PostgreSQL with secure password hashing, HTTPS, role-based permissions, audit logs and backups

## Project structure

- `artifacts/krishisetu` - farmer and procurement-officer web interface
- `artifacts/api-server` - Express API and prototype data workflow
- `lib/api-spec` - OpenAPI contract
- `lib/api-client-react` - generated React API client
- `lib/api-zod` - generated validation schemas
- `lib/db` - database package prepared for future persistent storage

## Run the Prototype

The current prototype is deployed on Replit. Open the live prototype link above to test the farmer and procurement-officer workflows.

## Run the checks locally

Requirements: Node.js 24 and pnpm.

```bash
pnpm install
pnpm run typecheck
pnpm run build
```

The frontend and API require the `PORT` values and routing configuration supplied by the Replit workflows when running the complete prototype.

## Prototype limitations

- Data is stored in memory and resets when the API restarts.
- Payment is represented as a tracked status; the prototype does not transfer money.
- Demo passwords are stored as plain text only for the internal-hackathon prototype.
- Production deployment requires persistent storage, password hashing, HTTPS, access controls, logging and backups.

## Team

Developed by **TechTitans, IIT Dharwad** for the SIH 2026 Internal Hackathon.
