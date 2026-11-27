import assert from "node:assert/strict";
import { test } from "node:test";
import { getBackendUrl } from "../lib/backend-url.ts";

test("backend URL follows environment and server override", () => {
  const original = {
    NODE_ENV: process.env.NODE_ENV,
    API_URL: process.env.API_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  };
  try {
    delete process.env.API_URL;
    delete process.env.NEXT_PUBLIC_API_URL;
    process.env.NODE_ENV = "development";
    assert.equal(getBackendUrl(), "http://localhost:8080");

    process.env.NEXT_PUBLIC_API_URL = "http://localhost:9999";
    assert.equal(getBackendUrl(), "http://localhost:9999");

    process.env.NODE_ENV = "production";
    assert.equal(getBackendUrl(), "https://clinic-backend-w9g6.onrender.com");

    process.env.API_URL = "https://backend.example.test";
    assert.equal(getBackendUrl(), "https://backend.example.test");
  } finally {
    for (const [key, value] of Object.entries(original)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});
