export {}

const FORM_PAGES = ['/index.html', '/logon-form-after-failed-login.html'] as const

describe('Logon ID field receives focus automatically on page load', () => {
  FORM_PAGES.forEach((page) => {
    it(`auto-focuses #ucla-logon-id on load, so keyboard users don't need an extra Tab press, on ${page}`, () => {
      cy.visit(page)

      // Assert the markup declares it, not just that the browser happened to
      // land there — autofocus is the one thing here that can't be verified
      // by inspecting document.activeElement, since Cypress's own harness
      // (an iframe) can suppress the browser's native autofocus behavior
      // even when the attribute is correctly present in the DOM.
      cy.get('#ucla-logon-id').should('have.attr', 'autofocus')

      // Only one field on the page should claim it — two autofocus fields is
      // undefined/inconsistent behavior across browsers.
      cy.get('[autofocus]').should('have.length', 1)
    })
  })
})
