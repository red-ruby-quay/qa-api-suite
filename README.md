# QA API Suite — Restful Booker

API test suite built with Playwright's request context, TypeScript, and Zod schema validation. Covers authentication, full CRUD lifecycle, partial updates, negative cases, and response-contract validation.

## What this repo demonstrates

- **API testing without a browser** using `APIRequestContext`
- **Typed API client** that centralizes endpoints and auth headers
- **Contract validation** with Zod, catching schema drift early
- **Full lifecycle test**: create, read, update, delete, verify deletion
- **Negative coverage**: invalid credentials, missing token, missing resource
- **CI/CD**: GitHub Actions runs the suite on every push and pull request

## Stack

- Playwright Test (API mode)
- TypeScript
- Zod
- GitHub Actions

## Structure

```
src/
  api/BookingClient.ts     Typed client for auth and booking endpoints
  schemas/booking.ts       Zod schemas and inferred types
tests/
  auth.spec.ts             Token issuance and rejection
  booking.spec.ts          CRUD, partial update, 403, 404, contract
```

## Run locally

```bash
npm install
npm test
```

The target is the public Restful Booker demo API. It is shared and occasionally reset, so the suite generates unique data per run and retries once locally.

## Coverage

| Area | Scenarios |
|---|---|
| Auth | valid token, invalid credentials |
| Booking | create, get, full update, partial update, delete, verify 404 |
| Authorization | update without token returns 403 |
| Contract | Zod schema validation of create/get responses |

## Design notes

- `BookingClient` keeps HTTP details out of tests and makes auth headers consistent.
- `Date.now()` in test data prevents collisions on the shared demo database.
- Schema checks use `safeParse` or `expect(...).not.toThrow()` so failures point to the exact field.
- The suite has no browser dependency, so CI runs in seconds.

## Author

Rihan Yosral — QA Automation Engineer · https://github.com/red-ruby-quay
