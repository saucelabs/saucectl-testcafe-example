# INT-31: TestCafe Timeout Bug Reproduction

Demonstrates a TestCafe bug where **all 7 timeout mechanisms are bypassed** when a page gets stuck during navigation.

## The Bug

When a page has a parser-blocking resource that never finishes loading (e.g., a `<script>` tag whose server never responds), `DOMContentLoaded` never fires. TestCafe's driver command queue waits for the browser to signal "page ready" with **no timeout on that wait**. This freezes all configured timeouts:

| Timeout | Why It Doesn't Fire |
|---------|-------------------|
| `pageRequestTimeout` | Page HTML was already received |
| `pageLoadTimeout` | Countdown starts after DOMContentLoaded — never reached |
| `ajaxRequestTimeout` | Only covers XHR/fetch, not page-level resources |
| `selectorTimeout` | TestCafe hasn't reached the next test action |
| `assertionTimeout` | Same as selectorTimeout |
| `testExecutionTimeout` | Frozen waiting for page readiness |
| `runExecutionTimeout` | Same |

## How It Works

- `server.js` — HTTP server with three endpoints:
  - `/login` — Normal page that loads fine
  - `/dashboard` — Page with a `<script src="/never-loads">` that blocks the HTML parser
  - `/never-loads` — Accepts the connection but never sends a response body

- `tests/timeout-hang.test.js` — TestCafe test that logs in, navigates to `/dashboard`, and hangs

## Running Locally

### 1. Start the test server

```bash
node server.js
```

### 2. Run with TestCafe directly

```bash
npx testcafe chrome:headless tests/timeout-hang.test.js \
  --page-load-timeout 15000 \
  --page-request-timeout 15000 \
  --ajax-request-timeout 15000 \
  --selector-timeout 10000 \
  --assertion-timeout 10000
```

The test will hang indefinitely despite all timeouts being set to 15 seconds.

### 3. Run with saucectl (on Sauce Labs)

```bash
cd examples/timeout-repro
saucectl run
```

The `.sauce/config.yml` has `testExecutionTimeout: 30000` (30s) and all other timeouts set to 15s. The test will hang past all of them.

## Expected vs Actual

- **Expected:** `testExecutionTimeout` (30s) or `pageLoadTimeout` (15s) should terminate the test
- **Actual:** Test hangs indefinitely — all timeouts are bypassed

This confirms the issue is in TestCafe's driver command queue, not in Sauce Labs infrastructure.
