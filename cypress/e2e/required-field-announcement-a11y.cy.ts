export {}

const FORM_PAGES = ['/index.html', '/logon-form-after-failed-login.html'] as const

// A required field that only looks required visually (an asterisk, red
// label, etc.) but doesn't say so programmatically won't be announced as
// required by a screen reader — the user only finds out after submitting
// and hitting a validation error. The native `required` attribute alone is
// enough in most modern browser/AT pairings, but `aria-required="true"` is
// the explicit, broadly-supported signal, so we require both.
function expectAnnouncedAsRequired(selector: string) {
  cy.get(selector).should(($el) => {
    expect($el, `${selector} should have the native "required" attribute`).to.have.attr('required')
    expect($el, `${selector} should have aria-required="true" so screen readers announce it as required`).to.have.attr(
      'aria-required',
      'true'
    )
  })
}

describe('Required fields are announced as required (WCAG 3.3.2 Labels or Instructions)', () => {
  FORM_PAGES.forEach((page) => {
    it(`flags the Logon ID and Password fields as required on ${page}`, () => {
      cy.visit(page)

      expectAnnouncedAsRequired('#ucla-logon-id')
      expectAnnouncedAsRequired('#ucla-logon-password')
    })
  })
})
