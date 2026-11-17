# Clinic frontend

## Run locally

Set `NEXT_PUBLIC_API_URL` to the backend origin (for example,
`http://localhost:8080`), then start the app:

```sh
npm install
npm run dev
```

The app currently provides:

- `/login` — sign in to the clinic dashboard.
- `/dashboard` — protected by an HTTP-only authentication cookie.
- `/dashboard/sessions` — create/edit Morning and Evening sessions and manage booking status.
- `/dashboard/queue` — manage and monitor the selected session's patient queue.
- `/dashboard/patient-display` — staff-authenticated, read-only queue display for patients.
- `/c/demo-dental` — today's sessions and booking availability.
- `/c/demo-dental/bookings` — today's clinic booking list.
- `/t/{bookingId}` — a booking's token and queue details.

The login route sends credentials to `POST /api/auth/login` on the backend
using `{ "email": "...", "password": "..." }`. The backend should return a
`token` field containing the JWT; the frontend stores it in an HTTP-only,
SameSite=Lax cookie. Set `API_URL` on the server to the backend origin when
possible; `NEXT_PUBLIC_API_URL` is used as a fallback.

Session management uses `GET /api/public/clinics/demo-dental/sessions` to
load current sessions, `POST /api/clinics/demo-dental/sessions` to create one,
`PUT /api/clinics/demo-dental/sessions/{MORNING|EVENING}` to edit one, and
`PATCH /api/clinics/demo-dental/sessions/{MORNING|EVENING}/status` with a
`bookingStatus` of `OPEN`, `PAUSED`, or `CLOSED` to update booking availability.
Management requests forward the JWT as a bearer token on the server.

The queue page reads clinic bookings and refreshes every 10 seconds. Queue
actions use `POST /api/clinics/demo-dental/sessions/{MORNING|EVENING}/call-next`
and `/undo`, and update individual bookings with
`PATCH /api/clinics/demo-dental/bookings/{bookingId}/status` using a `status`
of `SERVING`, `SKIPPED`, `WAITING`, or `NO_SHOW`. Walk-ins use the existing
`POST /api/public/bookings` request shape. The queue-management endpoints should
require the JWT; the proxy forwards it from the HTTP-only cookie.

Open the patient display on a staff-signed-in shared screen from the queue page.
It refreshes every 10 seconds and receives only patient names, tokens, masked
phone numbers, sessions, and statuses from the frontend server. Phone numbers
with eight or fewer digits are fully masked. This is a kiosk view, not a public
link: the signed-in browser still has staff access to the underlying APIs, so
the screen and browser should be secured against patient interaction.
