import assert from "node:assert/strict";
import { test } from "node:test";
import { clinicToday, isBookingDate } from "../lib/patient-bookings.ts";

test("clinic date follows the clinic time zone", () => {
  assert.equal(clinicToday(new Date("2026-11-16T20:00:00Z")), "2026-11-17");
});

test("booking dates must be real ISO calendar dates", () => {
  assert.equal(isBookingDate("2024-02-29"), true);
  assert.equal(isBookingDate("2026-02-29"), false);
  assert.equal(isBookingDate("2026-13-01"), false);
  assert.equal(isBookingDate("2026-1-01"), false);
  assert.equal(isBookingDate(""), false);
});
