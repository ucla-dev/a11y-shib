# SSO Login HTML Accessibility Checks

This project is a collection of static HTML pages plus Cypress accessibility checks powered by `axe-core` and `cypress-axe`.

## Tech requirements

- **Node.js**: Cypress 15.14.2 requires Node `^20.1.0 || ^22.0.0 || >=24.0.0`.
  - This project has been run successfully with **Node v20.19.1**.
- **npm**
- **Python 3** for the local static file server used by the test scripts

## Install

From the project root:

```bash
npm install
```

That installs the dev dependencies used by the test setup:

- `cypress`
- `cypress-axe`
- `axe-core`
- `typescript`
- `concurrently`
- `wait-on`

## Project structure

- Root-level `.html` files are the pages under test.
- `cypress/` contains the Cypress support files and specs.
- `scripts/generate-a11y-pages.mjs` generates the list of root HTML pages used by the spec.

## Available scripts

### Run the accessibility tests in the Cypress browser UI

```bash
npm run test
```

This command:

1. generates the page list,
2. starts a local static server on `http://localhost:8080`,
3. waits for the server to be available,
4. opens Cypress in the browser UI.

### Run the accessibility tests headlessly

```bash
npm run test:a11y
```

This command:

1. generates the page list,
2. runs Cypress headlessly against the local server.

### Start only the local static server

```bash
npm run serve:docs
```

This serves the project root at `http://localhost:8080`.

### Open Cypress only

```bash
npm run cy:open
```

Use this if the server is already running.

## What the tests do

The Cypress suite runs accessibility checks across the root HTML files with:

- `axe-core`
- WCAG 2.1 A and AA rule tags (`wcag21a`, `wcag21aa`)
- additional link and form-state checks for common accessibility patterns

The tests currently ignore `.demo-nav` so demo navigation does not fail the suite.

## Notes

- The accessibility checks are automated coverage, not a full WCAG 2.1 certification.
- Some issues, such as `1.4.1 Use of Color`, still need manual review or custom checks.
- If you add or remove root-level `.html` files, rerun the tests so the generated page list stays current.
