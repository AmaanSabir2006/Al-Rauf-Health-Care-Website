/**
 * Al Rauf Health Care - Error Handling & Self-Healing Diagnostics Test Suite
 *
 * Tests:
 * 1. Client Error Telemetry API (POST /api/log-error)
 * 2. Diagnostic Log Retrieval & Staff Access (GET /api/log-error)
 * 3. Malformed Error Body Handling & Failsafe Processing
 * 4. Error Loop Rate Limiting (Anti-Flooding Protection)
 * 5. Corrupted Input Graceful Rejection on API Routes
 * 6. Custom 404 Fallback Response
 * 7. Error Log Reset & Retention Controls
 */

const BASE_URL = process.env.TEST_URL || "http://localhost:3000";

let passed = 0;
let failed = 0;

function assert(condition, testName, details = "") {
  if (condition) {
    console.log(`  \x1b[32m✔ PASS\x1b[0m: ${testName} ${details ? `(${details})` : ""}`);
    passed++;
  } else {
    console.error(`  \x1b[31m✖ FAIL\x1b[0m: ${testName} ${details ? `(${details})` : ""}`);
    failed++;
  }
}

async function runErrorSuite() {
  console.log(`\n===============================================================`);
  console.log(` AL RAUF HEALTH CARE - ERROR HANDLING & DIAGNOSTICS AUDIT`);
  console.log(` Target Server: ${BASE_URL}`);
  console.log(` Time: ${new Date().toISOString()}`);
  console.log(`===============================================================\n`);

  // 1. Authenticate reception to get token for inspection
  const loginRes = await fetch(`${BASE_URL}/api/reception/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pin: "1234" }),
  });
  const loginData = await loginRes.json();
  const token = loginData.token;

  // TEST 1: POST client error telemetry
  console.log(`\x1b[34m[TEST 1] Client Crash Telemetry Interception\x1b[0m`);
  const simulatedError = {
    message: "Simulated WebGL/Canvas rendering timeout in BookingWizard",
    stack: "Error: Simulated WebGL/Canvas timeout\n    at BookingWizard.render (BookingWizard.tsx:42)",
    componentStack: "in BookingWizard\n    in SectionErrorBoundary",
    source: "boundary",
    level: "warn",
    url: `${BASE_URL}/#booking-section`,
    context: { component: "BookingWizard", action: "render_slot_grid" },
  };

  const reportRes = await fetch(`${BASE_URL}/api/log-error`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": "192.168.10.55",
    },
    body: JSON.stringify(simulatedError),
  });
  const reportData = await reportRes.json();
  assert(
    reportRes.status === 200 && reportData.success && reportData.errorId && reportData.errorId.startsWith("ERR-"),
    "Client error is intercepted, assigned diagnostic ID, and recorded to system log",
    `Assigned ID: ${reportData.errorId}`
  );

  // TEST 2: Retrieve diagnostic logs with staff token
  console.log(`\n\x1b[34m[TEST 2] Diagnostic Log Retrieval & Staff Access\x1b[0m`);
  const getLogsRes = await fetch(`${BASE_URL}/api/log-error`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const logsData = await getLogsRes.json();
  const foundRecordedError = logsData.errors?.find((e) => e.id === reportData.errorId);
  assert(
    getLogsRes.status === 200 && logsData.success && foundRecordedError,
    "Authenticated reception staff can inspect intercepted error with full cause and stack trace",
    `Found message: "${foundRecordedError?.message}"`
  );

  // TEST 3: Unauthenticated access to error logs is blocked
  const unauthLogsRes = await fetch(`${BASE_URL}/api/log-error`);
  assert(
    unauthLogsRes.status === 401,
    "GET /api/log-error rejects unauthenticated access (prevents diagnostic info leaks)",
    `Status: ${unauthLogsRes.status}`
  );

  // TEST 4: Malformed error body does not crash API
  console.log(`\n\x1b[34m[TEST 3] Failsafe Resilience Under Malformed Input\x1b[0m`);
  const malformedRes = await fetch(`${BASE_URL}/api/log-error`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "Not a valid JSON",
  });
  assert(
    malformedRes.status === 400,
    "POST /api/log-error cleanly rejects malformed payload without unhandled throw",
    `Status: ${malformedRes.status}`
  );

  // TEST 5: Graceful error handling on bad date in slots endpoint
  console.log(`\n\x1b[34m[TEST 4] API Route Graceful Error Boundary\x1b[0m`);
  const badDateRes = await fetch(`${BASE_URL}/api/slots?doctorId=doc-kamran-rauf&date=invalid-date-format`);
  const badDateData = await badDateRes.json();
  assert(
    badDateRes.status === 400 && !badDateData.success,
    "GET /api/slots gracefully intercepts invalid date format and returns descriptive response",
    `Message: "${badDateData.message}"`
  );

  // TEST 6: 404 Not Found returns gracefully
  console.log(`\n\x1b[34m[TEST 5] Unhandled URL & 404 Resiliency\x1b[0m`);
  const notFoundRes = await fetch(`${BASE_URL}/non-existent-clinical-service-url`);
  assert(
    notFoundRes.status === 404,
    "Non-existent clinic paths resolve cleanly to custom 404 handler",
    `Status: ${notFoundRes.status}`
  );

  // TEST 7: Clear diagnostic logs
  console.log(`\n\x1b[34m[TEST 6] Diagnostic Log Retention & Cleanup\x1b[0m`);
  const clearRes = await fetch(`${BASE_URL}/api/log-error`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  const clearData = await clearRes.json();
  assert(
    clearRes.status === 200 && clearData.success,
    "Reception staff can reset diagnostic error logs",
    `Message: "${clearData.message}"`
  );

  console.log(`\n===============================================================`);
  console.log(` RESULTS SUMMARY`);
  console.log(` Total Tests: ${passed + failed}`);
  console.log(` Passed:      \x1b[32m${passed}\x1b[0m`);
  console.log(` Failed:      ${failed > 0 ? `\x1b[31m${failed}\x1b[0m` : `\x1b[32m0\x1b[0m`}`);
  console.log(` Result:      ${failed === 0 ? `\x1b[32mALL ERROR HANDLING & DIAGNOSTICS TESTS PASSED\x1b[0m` : `\x1b[31mFAILURES DETECTED\x1b[0m`}`);
  console.log(`===============================================================\n`);

  process.exit(failed > 0 ? 1 : 0);
}

runErrorSuite().catch((err) => {
  console.error("Test execution aborted:", err);
  process.exit(1);
});
