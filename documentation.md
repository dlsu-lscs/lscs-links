# LSCS Links API Documentation

This document explains how to use all available routes, how they relate to one another, and the data models used by the API.

- Base server: configured in `src/app.ts` (uses Express)
- Route mounts:
  - `/auth` → Authentication endpoints
  - `/admin` → Authenticated link management
  - `/analytics` → Authenticated analytics queries
  - `/` → Public shortlink redirects

## Authentication and RBAC

The API uses JWT Bearer authentication for all non-public endpoints.

- Obtain a backend JWT via `POST /auth/login` (see route details below).
- Send the token on subsequent requests using:
  - Header: `Authorization: Bearer <jwt>`
- The backend validates the token in `authMiddleware` and attaches `req.member` with the decoded payload.

RBAC (role-based access control) is enforced in two places and now uses `position_id` values (e.g., `EVP`, `PRES`, `VP`, `AVP`):

- `src/lib/permissions.ts` for read/modify checks:
  - `EVP` or `PRES` → full read/modify access
  - `VP` → can modify links within their own committee
  - Others → can only modify links they created
  - Read access: `EVP`/`PRES` can read all; others can read links in their own committee
    - Note: Personal links (`committee_id = null`) do not pass `canRead` unless the member also has `committee_id = null`. They are still listed for the creator in `GET /admin/links`.
- `src/controllers/admin.controller.ts` for “pinned” link rules:
  - Only `position_id` in {`EVP`, `PRES`, `VP`} can set `pinned = true` during create/update
  - Pinned links must have a non-null `committee_id`

---

## Routes

### Auth

POST /auth/login
- Body: `{ "token": string }` where `token` is a Google OAuth access token
- Flow:
  1. Validates token against Google Tokeninfo
  2. Looks up the LSCS member via Core API
  3. Returns a backend JWT (valid for 7 days) with RBAC payload
- Response:
  - 200: `{ status: 'success', jwtToken: string }`
  - 400/401/500: `{ status: 'error', message|error: string }`
- Required env:
  - `GOOGLE_CLIENT_ID`, `LSCS_API_KEY`, `JWT_SECRET`

Decoded JWT payload (as issued):
- `email: string`
- `sub: string` (Google user id)
- `committee_id?: string | null`
- `committee_name?: string` (present in token though not used in types)
- `position_id: string` (e.g., `EVP`, `PRES`, `VP`, `AVP`)

---

### Admin (Authenticated)

POST /admin/create
- Purpose: Create a shortlink
- Auth: required
- Body (CreateLinksRequest):
  - `shortlink: string` (required, unique, max 100 chars)
  - `longlink: string` (required, max 2500 chars)
  - `pinned?: boolean` (default false)
  - `committee_id?: string | null`
- Rules:
  - Only `EVP`, `PRES`, or `VP` can set `pinned: true`
  - If `pinned` is true → `committee_id` must be non-null
  - Committee assignment on create:
    - `EVP`/`PRES`: can assign any `committee_id` or `null` (personal link)
    - `VP`/`AVP`: forced to their own `committee_id`
    - Others: forced to `committee_id = null` (personal link)
- Response:
  - 201: `{ status: 'ok', link: Link }`

GET /admin/links
- Purpose: List links with RBAC filtering and pagination
- Auth: required
- Query: `page?: number = 1`, `limit?: number = 10`
- RBAC filtering:
  - `EVP`/`PRES`: see all committee links (`committee_id != null`)
  - Others: see their committee’s links, plus their own personal links (`committee_id = null` and `created_by = your email`)
- Sorting: pinned first (`pinned desc`), then newest (`created_at desc`)
- Response:
  - 200: `{ status: 'ok', total, page, totalPages, data: Link[] }`

GET /admin/link/:id
- Purpose: Read a single link by ID
- Auth: required
- RBAC: Uses `canRead(member, committee_id)`
- Response:
  - 200: `{ status: 'ok', link: Link }`
 - Note: Because `canRead` checks only committee match (or `EVP`/`PRES`), personal links (`committee_id = null`) may not be readable by their creator unless their `committee_id` is also `null`. They are still visible in `GET /admin/links` for the creator.

PUT /admin/links/:id
- Purpose: Update a link
- Auth: required
- Body (partial): `{ shortlink?, longlink?, pinned?, committee_id?, created_at? }`
- RBAC: Uses `canModify(member, link)`
- Additional rules:
  - Only `EVP`, `PRES`, or `VP` can set `pinned: true`
  - `pinned: true` requires a non-null `committee_id`
  - Committee assignment on update follows the same role rules as create
- Response:
  - 200: `{ status: 'ok', link: Link }`

DELETE /admin/links/:id
- Purpose: Delete a link
- Auth: required
- RBAC: Uses `canModify(member, link)`
- Response:
  - 200: `{ status: 'ok', message: 'Link deleted successfully' }`

---

### Public redirects

GET /:shortlink
- Purpose: Resolve and redirect a shortlink
- Auth: not required (public)
- Behavior:
  - Returns `204 No Content` for empty/invalid or `favicon.ico`
  - Looks up `shortlink` in the Link model
  - If found: records analytics, then `302` redirects to `longlink`
  - If not found: serves `public/404.html`
  - On error: serves `public/error.html`

Analytics captured on click:
- Handler: `analyticsMiddleware.onClick(req.path, type)` with `type` default `'link'`
- Stored record (see Models): `link` will be the path such as `/<shortlink>`

---

### Analytics (Authenticated)

GET /analytics/:shortLink
- Purpose: Fetch analytics entries for a specific shortlink
- Auth: required
- Query: `type?: string`
- Query internally built as:
  - `link = "/" + shortLink`
  - `type` is included if provided
- Response:
  - 200: `{ status: 'ok', count: Analytics[] }`
    - Note: Property is named `count` but actually returns an array of matching analytics documents, not a numeric count.
  - 400: `{ status: 'error', message: '[ERROR] Invalid Request' }`

---

## How routes interact

- Authentication: `POST /auth/login` issues a JWT. All `/admin` and `/analytics` endpoints require `Authorization: Bearer <jwt>`.
- Link management: `/admin` endpoints create, read, update, and delete `Link` documents. RBAC rules govern who can see and modify which links.
- Redirect flow: public `GET /:shortlink` resolves the `Link` document and redirects. Each successful redirect logs an analytics record via `analyticsMiddleware`.
- Analytics queries: `/analytics/:shortLink` reads back the analytics records matching the path of a given shortlink.

---

## Models

### Link
Source: `src/models/link.model.ts`

- Fields
  - `shortlink: string` (required, unique, maxlength: 100)
  - `committee_id: string | null` (default `null`)
  - `longlink: string` (required, maxlength: 2500)
  - `created_at: Date` (default `Date.now`)
  - `created_by: string` (required)
  - `pinned: boolean` (default `false`)
    - Validation: A personal link (i.e., `committee_id = null`) cannot be pinned

- Example
```json
{
  "_id": "66f...",
  "shortlink": "gbb2025",
  "longlink": "https://example.com/events/green-blooded-2025",
  "committee_id": "cmt-ops", // or null for personal
  "created_at": "2025-10-17T08:41:00.000Z",
  "created_by": "member@dlsu-lscs.org",
  "pinned": true
}
```

- Notes
  - In the schema, `committee_id`/`created_by` use `max_length` instead of `maxlength` (Mongoose option). If you intend to enforce max length, rename to `maxlength`.

### Analytics
Source: `src/models/analytics.model.ts`

- Fields
  - `link: string` (required) → the path logged by the redirect endpoint (e.g., `/gbb2025`)
  - `type: string` (required)
  - `accessed_at: Date` (default `Date.now`)

- Example
```json
{
  "_id": "66f...",
  "link": "/gbb2025",
  "type": "link",
  "accessed_at": "2025-10-17T08:41:05.000Z"
}
```

- Notes
  - `analyticsMiddleware.onClick` currently sets `type` to the boolean result of `(type == 'link')`. Since the schema expects a string, this will be coerced to `'true'` or `'false'`. If you want semantic values like `'link'`/`'page'`, update the middleware to pass the original string.

### MemberPayload (JWT)
Source: `src/types/models.types.ts` and `src/controllers/user.controller.ts`

- Shape (effective, from token issuer):
  - `email: string`
  - `sub: string`
  - `committee_id?: string | null`
  - `committee_name?: string`
  - `position_id: string`

- Used by middleware to populate `req.member` for RBAC decisions.

---

## Error handling and edge cases

- `GET /:shortlink` returns HTTP 204 for missing shortlink or `favicon.ico` requests.
- `GET /analytics/:shortLink` returns `{ status: 'ok', count: Analytics[] }` — name suggests a number, but is an array.
- Pinned links must have a non-null `committee_id` (validated at model and controller levels).
- Role naming mismatch (abbreviations vs full titles) can cause unexpected authorization behavior.

---

## Suggested improvements (optional)

- Fix `analyticsMiddleware.onClick` to store a descriptive string for `type`.
- Use `maxlength` instead of `max_length` in Mongoose schemas.
- Consider using a numeric `count` for analytics alongside returning the array.
- Ensure `MemberPayload` type includes all fields actually present in the JWT (e.g., `committee_name`).
