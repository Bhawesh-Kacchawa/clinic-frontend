import assert from "node:assert/strict";
import { test } from "node:test";
import { toSessionAvailability } from "../lib/sessions.ts";

test("session availability includes booked and total capacity", () => {
  const response = {
    serverTime: "2026-11-26T09:00:00Z",
    sessions: [
      {
        id: "1",
        type: "MORNING",
        startTime: "09:00:00",
        endTime: "13:00:00",
        maxAppointments: 10,
        bookedCount: 4,
        bookingStatus: "OPEN",
      },
    ],
  };

  const [session] = toSessionAvailability(response);
  assert.equal(session.bookedCount, 4);
  assert.equal(session.maxAppointments, 10);
  assert.equal(session.slotsLeft, 6);
  assert.equal(session.status, "open");

  response.sessions[0].bookedCount = 12;
  const [fullSession] = toSessionAvailability(response);
  assert.equal(fullSession.bookedCount, 12);
  assert.equal(fullSession.maxAppointments, 10);
  assert.equal(fullSession.slotsLeft, 0);
  assert.equal(fullSession.status, "full");
});
