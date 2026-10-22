# Salesforce QA Automation Framework

A TypeScript-based QA automation framework using Playwright for UI testing and a reusable REST API client for Salesforce API testing. The project demonstrates Page Object Model (POM), API CRUD testing, simulated role-based authorization, CI/CD integration, test reporting, and k6 performance testing.

> **Test scope:** The current automated tests run against mocked API responses, in-memory data, or local HTML fixtures. They have not been validated against a live Salesforce org. Role-based authorization and employee lifecycle tests are simulations, not proof of actual Salesforce permissions or end-to-end behavior.

## Technology Stack

- TypeScript
- Playwright Test
- Node.js and npm
- Salesforce REST API client
- GitHub Actions
- k6 performance testing

## Project Structure

```text
.
├── .github/
│   └── workflows/
│       └── qa.yml
├── performance/
│   ├── employee-api.js
│   ├── k6-summary.json
│   ├── mock-server.js
│   └── salesforce-api.js
├── src/
│   ├── api/
│   │   └── SalesforceClient.ts
│   ├── config/
│   │   └── env.ts
│   └── pages/
│       ├── ContactPage.ts
│       └── SalesforceLoginPage.ts
├── tests/
│   ├── api/
│   │   ├── employee-lifecycle-simulation.spec.ts
│   │   ├── salesforce-api-errors.spec.ts
│   │   ├── salesforce-mock-api.spec.ts
│   │   ├── salesforce-record-lifecycle.spec.ts
│   │   └── salesforce-role-permissions.spec.ts
│   └── ui/
│       ├── contact-pom.spec.ts
│       ├── framework-smoke.spec.ts
│       └── salesforce-login-pom.spec.ts
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── playwright.config.ts
└── tsconfig.json
```

*The structure above describes the intended project layout. Confirm that each listed file exists in the repository before submission.*

## Prerequisites

- Node.js and npm
- Git
- k6 for performance tests
- A Salesforce sandbox or authorized test org for future live integration testing

## Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/mohanvelaga/salesforce-qa-typescript.git
cd salesforce-qa-typescript
npm ci
npx playwright install chromium
```

Install k6 separately by following the official [k6 installation guide](https://grafana.com/docs/k6/latest/set-up/install-k6/).

## Running the Tests

### Full Playwright suite

```bash
npx playwright test
```

### TypeScript validation

```bash
npx tsc --noEmit
```

Or use the configured npm script:

```bash
npm run typecheck
```

### Run API tests

```bash
npm run test:api
```

### Run UI tests

```bash
npm run test:ui
```

### Run smoke tests

```bash
npm run test:smoke
```

### Run role-permission tests

```bash
npm run test:roles
```

The role test uses simulated authorization responses. Ensure the test title includes the `@roles` tag for this command to select it.

### List discovered tests

```bash
npx playwright test --list
```

### View the HTML report

```bash
npx playwright show-report
```

## Salesforce Configuration

Copy `.env.example` to `.env` and configure it for an authorized Salesforce test org when one is available.

Example configuration:

```dotenv
SF_UI_URL=https://your-test-domain.my.salesforce.com
SF_INSTANCE_URL=https://your-test-domain.my.salesforce.com
SF_API_VERSION=v60.0
SF_ACCESS_TOKEN=
RUN_SALESFORCE_TESTS=false
```

The API version shown is illustrative; use a version supported by your org.

The current API client expects a pre-obtained Salesforce access token. OAuth authentication and token refresh are not implemented in this version. Live integration tests have not been run because a Salesforce test org is not available.

### Security

- Never commit `.env` files, access tokens, or credentials.
- Use a dedicated, least-privileged test account for integration testing.
- Store secrets in GitHub Actions Secrets or another approved secret manager.
- Prefer securely managed OAuth credentials and short-lived tokens.
- Do not use production credentials for automation experiments.

## Framework Design

### API Client

`src/api/SalesforceClient.ts` provides reusable methods for:

- Creating records
- Retrieving records
- Updating records
- Deleting records
- Executing SOQL queries

The client is tested with mocked HTTP responses, including successful CRUD operations and error handling. These tests verify client behavior but do not prove that a live Salesforce org accepts the requests.

### Page Object Model

The page objects separate UI actions from test logic:

- `SalesforceLoginPage.ts`
- `ContactPage.ts`

The current UI tests use local HTML fixtures. Selectors and login behavior must be validated against the target Salesforce Lightning UI. SSO, MFA, and org-specific authentication policies may also affect live testing.

### Employee Lifecycle Simulation

`tests/api/employee-lifecycle-simulation.spec.ts` demonstrates a simulated workflow covering:

1. Authentication simulation
2. Employee creation
3. Role-based authorization checks
4. Employee update
5. Record verification
6. Employee deletion

The workflow uses in-memory data. It does not call Salesforce APIs or validate actual Salesforce profiles and permission sets.

### Role-Based Authorization Simulation

`tests/api/salesforce-role-permissions.spec.ts` verifies how the API client handles mocked authorized and forbidden responses. Real permission validation requires users with appropriately configured Salesforce profiles or permission sets.

## Test Stability and Flaky-Test Strategy

### Detection

- Review failed tests and retry outcomes in Playwright reports.
- Inspect traces, screenshots, and videos captured on failure.
- Identify tests that pass only on retry and investigate the underlying cause.
- Review CI failures for timing issues, shared state, and environment-specific behavior.

### Mitigation

- Prefer Playwright locator-based auto-waiting and web-first assertions.
- Avoid fixed sleeps and arbitrary timing assumptions.
- Keep tests independent and isolate test data.
- Restore mocked global state in `finally` blocks.
- Avoid shared mutable state when tests run in parallel.
- Use retries to collect diagnostic evidence, not to conceal flaky behavior.
- Fix the root cause of intermittent failures and rerun the affected tests.

### Playwright Configuration

The current configuration includes:

- Parallel execution through `fullyParallel`
- Two retries in CI
- An eight-second assertion timeout
- A 30-second test timeout
- Screenshots on failure
- Video and trace retention on failure
- HTML and JUnit reporters

## Test Tags

Use consistent tags in test titles to select relevant test groups:

- `@smoke` — quick framework sanity checks
- `@api` — API client tests
- `@ui` — browser and page-object tests
- `@roles` — simulated role-permission tests
- `@simulation` — mock or in-memory scenarios

Example:

```typescript
test('authorized user is denied when restricted @api @roles @simulation', async () => {
  // Test implementation
});
```

Run tests by tag:

```bash
npx playwright test --grep "@smoke"
npx playwright test --grep "@api"
npx playwright test --grep "@ui"
npx playwright test --grep "@roles"
npx playwright test --grep "@simulation"
```

Ensure each test title contains the appropriate tag before using these filters. The `test:roles` npm script specifically searches for `@roles`.

## CI/CD Integration

The GitHub Actions workflow is located at `.github/workflows/qa.yml`.

The configured workflow installs dependencies, installs Chromium, runs TypeScript validation and Playwright tests, and uploads available test reports as artifacts.

View workflow runs:

[GitHub Actions](https://github.com/mohanvelaga/salesforce-qa-typescript/actions)

Verify that the latest workflow run succeeds and that the expected artifacts are present. Artifacts may include:

- Playwright HTML report
- JUnit XML report
- Test result files
- Screenshots, videos, and traces generated during failures

## Performance Testing with k6

Two types of performance-test scripts are included:

- `performance/employee-api.js` — tests mock login and employee-creation endpoints.
- `performance/salesforce-api.js` — a health-endpoint performance-test scaffold.

### Run the mock API performance test

Start the mock server in one terminal:

```bash
node performance/mock-server.js
```

Leave the server running. In another terminal, execute:

```bash
k6 run --summary-export performance/k6-summary.json performance/employee-api.js
```

The mock API test checks:

- Login returns HTTP 200 and a mock token.
- Employee creation returns HTTP 201 and an employee ID.
- HTTP failure rate stays below 1%.
- The 95th-percentile response time for each endpoint remains below 1,000 ms.

The generated summary is written to `performance/k6-summary.json`.

### Performance-test limitations

The recorded results are from a local mock server. They are not Salesforce API performance measurements. Local response times are not representative of Salesforce network latency, authentication, server processing, or platform limits.

Run performance tests against an authorized non-production environment only after configuring the relevant endpoints, authentication, and safe load limits.

## Current Limitations and Future Improvements

The following work remains before this framework can be considered a validated Salesforce end-to-end automation suite:

- Execute integration tests against an authorized Salesforce sandbox.
- Confirm the actual object model and required fields for the employee lifecycle.
- Validate record creation, retrieval, update, and deletion against real Salesforce records.
- Validate actual permissions using users with different Salesforce profiles or permission sets.
- Verify page selectors and authentication behavior against the target org.
- Implement and securely configure OAuth authentication and token management.
- Configure secure CI secrets for live integration tests.
- Verify the k6 scenarios against approved non-production endpoints.
- Confirm GitHub Actions artifacts and test reports are available after workflow runs.

## Key Design Decisions

- **TypeScript:** adds static type checking and improves maintainability.
- **Page Object Model:** separates page interactions from test logic.
- **Reusable API client:** centralizes REST API operations.
- **Mocked API tests:** allow repeatable client tests without Salesforce credentials.
- **Environment configuration:** keeps URLs and credentials out of source code.
- **Playwright reporting and diagnostics:** provide reports and failure evidence.
- **CI parallelization and retries:** support faster feedback and investigation of intermittent failures.
- **k6 thresholds:** provide explicit performance acceptance criteria for the mock scenarios.

## Repository

[https://github.com/mohanvelaga/salesforce-qa-typescript](https://github.com/mohanvelaga/salesforce-qa-typescript)
