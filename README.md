# SSO Login HTML Accessibility Checks

This project is a collection of static HTML pages plus Cypress accessibility checks powered by `axe-core` and `cypress-axe`.

## Tech requirements

- **Node.js**: Cypress 15.14.2 requires Node `^20.1.0 || ^22.0.0 || >=24.0.0`.
  - This project has been run successfully with **Node v20.19.1**.
- **npm**
- **Python 3** for the local static file server used by the test scripts
- **A Chromium-family browser** (the default `electron` browser, or Chrome/Edge). The keyboard-interaction spec uses `cypress-real-events`, which fires native OS-level input events over the Chrome DevTools Protocol — this does not work in Firefox.

## Install

From the project root:

```bash
npm install
```

That installs the dev dependencies used by the test setup:

- `cypress`
- `cypress-axe`
- `cypress-real-events` — fires real, trusted keyboard/mouse events (native `Tab`, `Enter`, clicks) via CDP, needed to test actual keyboard operability rather than just static markup
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

There are three spec files, and each one covers a different slice of WCAG 2.1 A/AA. All three run against every root-level `.html` page (the list in `cypress/support/generated-pages.ts`), except where noted.

### `cypress/e2e/a11y-docs.cy.ts` — automated rule scan

Runs `axe-core` against the full rendered page with the `wcag21a` and `wcag21aa` rule tags. This is broad but shallow: it catches structural/markup-level problems — missing alt text, invalid ARIA, insufficient color contrast, missing form labels, bad heading order, missing landmarks, duplicate IDs, etc. — on every page in one pass, but it only ever inspects static DOM/CSS state. It can't tell you whether a control is actually reachable or operable by keyboard.

### `cypress/e2e/link-state-a11y.cy.ts` — link and form-state checks

Fills the gaps axe doesn't check by design:

- every visible link has an accessible name (visible text, `aria-label`, or `title`) and a non-color visual affordance (underline), so links aren't identified by color alone (`1.4.1 Use of Color`)
- the login form's labels, `required`/`aria-required` attributes, and hidden error containers are correctly wired on the base login page
- the failed-login page's `aria-invalid` and `aria-describedby` attributes correctly point at visible, `role="alert"` error messages
- `a:focus-visible` keyboard-focus styling is actually present in `css/links.css` (outline width and offset), not just assumed

### `cypress/e2e/keyboard-interaction-a11y.cy.ts` — real keyboard/focus interaction

This is the one that actually drives the browser with native input (via `cypress-real-events`) instead of just inspecting markup, because several WCAG success criteria can only be verified by actually operating the page:

- **Skip link (`2.4.1` Bypass Blocks)**: the skip link is genuinely the first focusable element in DOM order on every page, and activating it (native focus + a real `Enter` keypress) moves focus to `#main-content` — not just that the link exists in the HTML.
- **Focus visibility (`2.4.7` Focus Visible)**: form fields, the submit button, and the demo-nav toggle show a real visible outline/box-shadow when focused, not just links (the previous spec only checked `<a>`).
- **Keyboard-only form flow (`2.1.1` Keyboard, `2.4.3` Focus Order)**: tabbing through the login form (Logon ID → Password → Sign In → the footer links) actually follows visual reading order, on both the base and failed-login pages.
- **Demo-nav keyboard toggle (`2.1.1` Keyboard)**: the `<details>/<summary>` demo navigation opens and closes with `Enter` from the keyboard, not just a mouse click.
- **Reflow (`1.4.10` Reflow)**: every page renders at a 320px viewport with no horizontal scrolling.

**Why real events, not simulated ones:** Cypress's default `.click()`/`.type()` fire synthetic (`event.isTrusted === false`) events from JavaScript. Real browsers (and real users) don't work that way — native focus order, `:focus-visible` matching, and `<details>` toggling all depend on genuinely-trusted input. Testing keyboard operability by only asserting on `tabindex` or `aria-*` attributes in the DOM would miss real regressions (a CSS change that visually hides a focused element, a z-index change that makes something unclickable, an event handler that calls `preventDefault()` on `Enter`, etc.).

The tests currently ignore `.demo-nav` for axe/link-affordance purposes (it's a demo-only navigation aid, not user-facing product content), but its keyboard operability is still tested directly since it's real, un-hidden, tabbable markup on every page.

### Does this cover all the accessibility concerns for these screens?

For the two screens that currently have real interactive content — the login form (`index.html`) and the failed-login variant — yes, these three specs together cover the WCAG 2.1 A/AA concerns that apply to static markup, page structure, and keyboard/focus operability. Most other root pages are still stub content ("This is a stub page for...") with no real form fields or custom widgets yet, so there's nothing further to test on them until they're built out — rerunning this same suite once they have real content is how you'd extend coverage, not new test types.

**What this suite does *not* cover — accessible form validation.** Both forms currently have `novalidate` and `action="#"`, and the "invalid" state on the failed-login page is hardcoded HTML (`aria-invalid="true"`, a visible error message) rather than the output of anything the form actually does at submit time. That means none of the following is tested, because none of it exists yet:

- moving focus to the first invalid field (or an error summary) when a real submit attempt fails
- announcing validation errors to screen readers as they appear, via a live region, without needing a full page reload
- preventing/handling a submit while fields are still invalid, and re-validating on correction
- distinguishing "field is empty" from "field is the wrong format" with real-time or on-blur feedback

This is the single biggest remaining gap and the natural next step to round out this demo: once the forms have real client-side validation logic, add a spec that submits invalid data through the actual validation path and asserts on the resulting focus movement and live-region announcements — that's a fundamentally different (and currently untestable) class of check from what's here today.

## Notes

- The accessibility checks are automated coverage, not a full WCAG 2.1 certification. Manual review (screen reader testing, cognitive load, real color-contrast measurement beyond axe's computed check) is still recommended.
- If you add or remove root-level `.html` files, rerun the tests so the generated page list stays current.
