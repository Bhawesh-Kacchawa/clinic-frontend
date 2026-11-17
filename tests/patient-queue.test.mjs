import assert from "node:assert/strict";
import { test } from "node:test";
import { maskPhone, toPatientQueue } from "../lib/patient-queue.ts";

test("masks formatted numbers and never reveals short numbers", () => {
  assert.equal(maskPhone("+91 98765 43210"), "9198****3210");
  assert.equal(maskPhone("123456789"), "1234*6789");
  assert.equal(maskPhone("12345678"), "****");
  assert.equal(maskPhone("1234"), "****");
  assert.equal(maskPhone(), "—");
});

test("patient queue contains only display fields", () => {
  assert.deepEqual(toPatientQueue([{
    bookingId: "private-id",
    patientName: "Patient",
    tokenNo: 12,
    phone: "9876543210",
    reason: "private reason",
    session: { type: "Morning" },
    status: "no-show",
  }]), [{
    patientName: "Patient",
    token: 12,
    phone: "9876**3210",
    session: "MORNING",
    status: "NO_SHOW",
  }]);
});
