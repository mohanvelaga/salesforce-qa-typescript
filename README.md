# Salesforce QA Automation Framework

A TypeScript-based QA automation framework using Playwright for UI testing and a reusable REST API client for Salesforce API testing.

> **Test scope:** The tests currently included in this repository run locally using mocked responses or local HTML fixtures. Live Salesforce login, CRUD operations, and role-based permissions have not been validated against a Salesforce org.

## Technology Stack

- TypeScript
- Playwright Test
- Node.js and npm
- Salesforce REST API client
- GitHub Actions CI
- k6 performance-test scaffold

## Project Structure

```text
.
├── .github/
│   └── workflows/
│       └── qa.yml
├── performance/
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
│   └── ui/
├── .env.example
├── .gitignore
├── package.json
├── playwright.config.ts
└── tsconfig.json
```

## Prerequisites

- Node.js and npm
- Git
- A Salesforce sandbox or authorized test org for live integration testing
- k6, if running performance tests

## Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/mohanvelaga/salesforce-qa-typescript.git
cd salesforce-qa-typescript
npm ci
npx playwright install chromium
```

## Run Tests

Run the complete Playwright test suite:

```bash
npx playwright test
```

Run TypeScript validation:

```bash
npx tsc --noEmit
```

List discovered tests:

```bash
npx playwright test --list
```

Open the HTML report after a test run:

```bash
npx playwright show-report
```

The current local suite includes framework smoke coverage, local UI fixture tests, and mocked Salesforce API client tests.

## Salesforce Configuration

Copy `.env.example` to `.env` and configure the values for an authorized Salesforce test org.

Example:

```dotenv
SF_UI_URL=https://your-test-domain.my.salesforce.com
SF_INSTANCE_URL=https://your-test-domain.my.salesforce.com
SF_API_VERSION=v60.0
SF_ACCESS_TOKEN=
RUN_SALESFORCE_TESTS=false
```

Use the API version supported by your Salesforce org. The example version is illustrative.

**Security:**
- Never commit `.env` or access tokens.
- Use a dedicated, least-privileged test account.
- Prefer securely managed OAuth credentials and short-lived tokens for integration environments.
- Do not use production credentials for automation experiments.

The current API client expects a pre-obtained access token. OAuth authentication and token refresh are not implemented in this version.

## Framework Design

### API Client

`src/api/SalesforceClient.ts` provides methods for:

- Creating records
- Retrieving records
- Updating records
- Deleting records
- Executing SOQL queries

These methods have local mocked tests. Successful mocked responses do not prove that a live Salesforce org accepts the requests or that the user has the required permissions.

### Page Object Model

The page objects separate UI actions from test logic:

- `SalesforceLoginPage.ts`
- `ContactPage.ts`

The selectors are initial examples and must be verified against the target Salesforce Lightning UI. Login behavior may also depend on SSO, MFA, and org-specific authentication policies.

### Test Reporting and Stability

Playwright is configured to generate HTML and JUnit reports, retain traces on failure, and capture screenshots and videos according to the configured settings.

### CI/CD

The GitHub Actions workflow at `.github/workflows/qa.yml` installs dependencies, installs Chromium, runs the TypeScript check and Playwright tests, and uploads available reports as artifacts.

## Performance Testing

The `performance/salesforce-api.js` file is a performance-test scaffold. Before using it, verify the script, configure an authorized test endpoint and authentication, and run a small test against a non-production environment.

Do not treat the presence of this file as evidence that load testing has passed.

## Current Limitations

The following work remains before this can be considered a validated end-to-end Salesforce automation suite:

- Execute tests against a real Salesforce sandbox.
- Confirm the actual object model and required fields for the employee lifecycle.
- Validate create, retrieve, update, and delete against real Salesforce records.
- Test permissions using users with deliberately different permission sets.
- Validate Salesforce UI selectors against the target org.
- Verify and execute the k6 script.
- Configure secure authentication for CI integration tests.

## CI Status

GitHub Actions is configured for pushes, pull requests, and manual runs. Check the [Actions page](https://github.com/mohanvelaga/salesforce-qa-typescript/actions) for the latest run status.

## Repository

https://github.com/mohanvelaga/salesforce-qa-typescript
