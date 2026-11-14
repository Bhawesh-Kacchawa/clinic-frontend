# Clinic frontend

## Run locally

Set `NEXT_PUBLIC_API_URL` to the backend origin (for example,
`http://localhost:8080`), then start the app:

```sh
npm install
npm run dev
```

The app currently provides:

- `/c/demo-dental` — today's sessions and booking availability.
- `/c/demo-dental/bookings` — today's clinic booking list.
- `/t/{bookingId}` — a booking's token and queue details.
