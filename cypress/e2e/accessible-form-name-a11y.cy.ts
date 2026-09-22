export {}

const FORM_PAGES = ['/index.html', '/logon-form-after-failed-login.html'] as const

// A <form> with no accessible name is announced by screen readers as just
// "form" — useless when a page has (or could grow) more than one, and it
// also means the form doesn't show up as anything meaningful in a landmarks
// list. Unlike a <fieldset>, a <form> gets no name from its visible content,
// so it must come from aria-label, aria-labelledby, or title.
function expectAccessibleFormName(selector: string) {
  cy.get(selector).should(($form) => {
    const ariaLabel = ($form.attr('aria-label') || '').trim()
    const labelledbyIds = ($form.attr('aria-labelledby') || '').trim().split(/\s+/).filter(Boolean)
    const labelledbyText = labelledbyIds
      .map((id) => $form[0].ownerDocument.getElementById(id)?.textContent || '')
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()
    const title = ($form.attr('title') || '').trim()

    expect(
      ariaLabel || labelledbyText || title,
      'form should have an accessible name (aria-label, aria-labelledby, or title) so screen readers ' +
        'announce more than just "form"'
    ).to.not.equal('')
  })
}

describe('Accessible form name (WCAG 1.3.1 Info and Relationships / 4.1.2 Name, Role, Value)', () => {
  FORM_PAGES.forEach((page) => {
    it(`has an accessible name on the login form on ${page}`, () => {
      cy.visit(page)
      expectAccessibleFormName('form.login-form')
    })
  })
})
