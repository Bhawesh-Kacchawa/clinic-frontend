import assert from "node:assert/strict";
import { test } from "node:test";
import {
  clinicToday,
  formatClinicDate,
  formatPatientAddress,
  isBookingDate,
  isTokenAppointment,
  tokenText,
  truncatePatientAddress,
} from "../lib/patient-bookings.ts";

test("clinic date follows the clinic time zone", () => {
  assert.equal(clinicToday(new Date("2026-11-16T20:00:00Z")), "2026-11-17");
});

test("clinic date is displayed as DD-MM-YYYY", () => {
  assert.equal(formatClinicDate("2026-11-17"), "17-11-2026");
});

test("patient addresses wrap after at most 20 characters", () => {
  assert.equal(formatPatientAddress("12345678901234567890"), "12345678901234567890");
  assert.equal(formatPatientAddress("123456789012345678901"), "12345678901234567890\n1");
  assert.equal(formatPatientAddress("🏠".repeat(21)), `${"🏠".repeat(20)}\n🏠`);
  assert.equal(formatPatientAddress("1234567890\n123456789012345678901"), "1234567890\n12345678901234567890\n1");
});

test("queue addresses are truncated only when longer than 15 characters", () => {
  assert.equal(truncatePatientAddress("Short address"), "Short address");
  assert.equal(truncatePatientAddress("123456789012345"), "123456789012345");
  assert.equal(truncatePatientAddress("1234567890123456"), "123456789012345...");
  assert.equal(truncatePatientAddress("🏠".repeat(16)), `${"🏠".repeat(15)}...`);
});

test("booking dates must be real ISO calendar dates", () => {
  assert.equal(isBookingDate("2024-02-29"), true);
  assert.equal(isBookingDate("2026-02-29"), false);
  assert.equal(isBookingDate("2026-13-01"), false);
  assert.equal(isBookingDate("2026-1-01"), false);
  assert.equal(isBookingDate(""), false);
});

test("appointment token includes the booked date, patient and session times", () => {
  const appointment = {
    patientName: "Patient",
    sessionName: "EVENING",
    date: "2026-11-19",
    startTime: "17:00:00",
    endTime: "21:00:00",
  };
  assert.equal(isTokenAppointment(appointment), true);
  assert.equal(tokenText("booking-id", 2, appointment), [
    "Appointment token",
    "Token number: 2",
    "Patient: Patient",
    "Date: 19-11-2026",
    "Session: EVENING",
    "Time: 17:00 - 21:00",
    "Booking reference: booking-id",
  ].join("\n"));
});

test("incomplete or invalid appointment details cannot be used for a token", () => {
  const appointment = {
    patientName: "Patient",
    sessionName: "MORNING",
    date: "2026-11-19",
    startTime: "09:00:00",
    endTime: "13:00:00",
  };
  assert.equal(isTokenAppointment({ ...appointment, date: "2026-02-29" }), false);
  assert.equal(isTokenAppointment({ ...appointment, startTime: "25:00" }), false);
  assert.equal(isTokenAppointment({ ...appointment, patientName: "" }), false);
  assert.equal(isTokenAppointment(null), false);
});
