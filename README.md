# Clinic frontend

## Run locally

Start the backend on `http://localhost:8080`, then start the app:

```sh
npm install
npm run dev
```

Production builds use `https://clinic-backend-w9g6.onrender.com` by default.
Set the server-side `API_URL` to override the backend in either environment.
For compatibility, `NEXT_PUBLIC_API_URL` can also override the development
backend; it is ignored in production. Restart the frontend after changing
environment variables.

The app currently provides:

- `/login` — sign in to the clinic dashboard.
- `/dashboard` — the post-login destination; redirects to the live queue.
- `/dashboard/sessions` — create/edit Morning and Evening sessions and manage booking status.
- `/dashboard/queue` — manage and monitor the selected session's patient queue.
- `/dashboard/patients` — view patient bookings by date.
- `/dashboard/patient-display` — staff-authenticated, read-only queue display for patients.
- `/c/demo-dental` — today's sessions, booking availability, and booked capacity.
- `/c/demo-dental/bookings` — today's clinic booking list.
- `/t/{bookingId}` — a booking's token and queue details.

For new bookings, the confirmation page saves the patient name and appointment
date and session times from the booking response in the booking browser. These
details and the downloadable text token are unavailable on other devices or for
older bookings; the token number and queue information still come from the API.
The downloaded file contains the patient name and should be kept private.
Saved appointment details are not updated if a session changes, and the text
file is not proof of booking; staff should verify it against the queue.

The login route sends credentials to `POST /api/auth/login` on the backend
using `{ "email": "...", "password": "..." }`. The backend should return a
`token` field containing the JWT; the frontend stores it in an HTTP-only,
SameSite=Lax cookie.

Session management uses `GET /api/public/clinics/demo-dental/sessions` to
load current sessions, `POST /api/clinics/demo-dental/sessions` to create one,
`PUT /api/clinics/demo-dental/sessions/{MORNING|EVENING}` to edit one, and
`PATCH /api/clinics/demo-dental/sessions/{MORNING|EVENING}/status` with a
`bookingStatus` of `OPEN`, `PAUSED`, or `CLOSED` to update booking availability.
Management requests forward the JWT as a bearer token on the server.

The patient list uses `GET /api/staff/bookings?date=YYYY-MM-DD` with the staff
JWT. It defaults to today's date in the clinic's Asia/Kolkata time zone.
The patient history and live queue display the `address` returned in each
staff booking; missing addresses are shown as a dash.

The queue page reads clinic bookings and refreshes every 10 seconds. Queue
actions use `POST /api/clinics/demo-dental/sessions/{MORNING|EVENING}/call-next`
and `/undo`, and update individual bookings with
`PATCH /api/clinics/demo-dental/bookings/{bookingId}/status` using a `status`
of `SERVING`, `SKIPPED`, `WAITING`, or `NO_SHOW`. Walk-ins use the existing
`POST /api/public/bookings` request shape. The queue-management endpoints should
require the JWT; the proxy forwards it from the HTTP-only cookie.

Open the patient display on a staff-signed-in shared screen from the dashboard navigation.
Choose "Open waiting room screen" to show the queue without staff navigation.
Use the session selector on that screen to show all sessions, Morning, or Evening.
It refreshes every 10 seconds and receives only patient names, tokens, masked
phone numbers, sessions, and statuses from the frontend server. Phone numbers
show only the first two and last four digits; numbers with eight or fewer
digits are fully masked. The Indian country code is omitted before masking.
This is a kiosk view, not a public
link: the signed-in browser still has staff access to the underlying APIs, so
the screen and browser should be secured against patient interaction.
