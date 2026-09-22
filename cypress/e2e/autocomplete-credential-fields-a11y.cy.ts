export {}

const FORM_PAGES = ['/index.html', '/logon-form-after-failed-login.html'] as const

describe('Credential fields declare their purpose for autofill (WCAG 1.3.5 Identify Input Purpose)', () => {
  FORM_PAGES.forEach((page) => {
    it(`declares autocomplete on the Logon ID and Password fields on ${page}`, () => {
      cy.visit(page)

      cy.get('#ucla-logon-id').should('have.attr', 'autocomplete', 'username')
      cy.get('#ucla-logon-password').should('have.attr', 'autocomplete', 'current-password')
    })
  })
})
