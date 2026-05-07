import 'cypress-axe'
import { pages } from '../support/generated-pages'

const axeOptions = {
  runOnly: {
    type: 'tag' as const,
    values: ['wcag21a', 'wcag21aa'],
  },
}

const axeExclude = ['.demo-nav']

function expectLinkHasNonColorAffordance($el: JQuery<HTMLAnchorElement>) {
  const styles = getComputedStyle($el[0])

  expect(
    styles.textDecorationLine,
    `link "${$el.text().trim()}" should be underlined or otherwise visibly distinct`
  ).to.include('underline')
}

function expectAccessibleLinkName($el: JQuery<HTMLAnchorElement>) {
  const text = $el.text().replace(/\s+/g, ' ').trim()
  const ariaLabel = ($el.attr('aria-label') || '').trim()
  const title = ($el.attr('title') || '').trim()

  expect(text || ariaLabel || title, 'link has visible text or an accessible name').to.not.equal('')
}

function assertRequiredField(selector: string) {
  cy.get(selector).should(($el) => {
    expect($el).to.have.attr('required')
    expect($el).to.have.attr('aria-required', 'true')
  })
}

function assertInvalidField(selector: string, errorId: string) {
  cy.get(selector).should(($el) => {
    expect($el).to.have.attr('aria-invalid', 'true')
    expect($el).to.have.attr('aria-describedby', errorId)
  })
}

describe('A11y links and states', () => {
  pages.forEach((page) => {
    it(`checks links on ${page}`, () => {
      cy.visit(page)
      cy.injectAxe()
      cy.checkA11y(null, axeOptions, null, axeExclude)

      cy.get('body')
        .find('a[href]')
        .not('.demo-nav a')
        .then(($links) => {
          const visibleLinks = $links.filter(':visible')

          if (!visibleLinks.length) return

          visibleLinks.each((_i, el) => {
            const $a = Cypress.$(el) as JQuery<HTMLAnchorElement>
            const href = $a.attr('href') || ''

            if (href === '#' || href.startsWith('javascript:')) return

            expectAccessibleLinkName($a)
            expectLinkHasNonColorAffordance($a)
          })
        })
    })
  })

  it('checks form labels, required state, and hidden error state on the login page', () => {
    cy.visit('/index.html')
    cy.injectAxe()
    cy.checkA11y(null, axeOptions, null, axeExclude)

    cy.get('label[for="ucla-logon-id"]').should('contain.text', 'UCLA Logon ID')
    cy.get('label[for="ucla-logon-password"]').should('contain.text', 'UCLA Logon Password')

    assertRequiredField('#ucla-logon-id')
    assertRequiredField('#ucla-logon-password')

    cy.get('#ucla-logon-id-error').should('be.hidden')
    cy.get('#ucla-logon-password-error').should('be.hidden')
  })

  it('checks invalid and alert states on the failed-login page', () => {
    cy.visit('/logon-form-after-failed-login.html')
    cy.injectAxe()
    cy.checkA11y(null, axeOptions, null, axeExclude)

    assertInvalidField('#ucla-logon-id', 'ucla-logon-id-error')
    assertInvalidField('#ucla-logon-password', 'ucla-logon-password-error')

    cy.get('#ucla-logon-id-error')
      .should('be.visible')
      .and('have.attr', 'role', 'alert')
      .and('have.attr', 'aria-live', 'polite')
      .and('not.be.empty')

    cy.get('#ucla-logon-password-error')
      .should('be.visible')
      .and('have.attr', 'role', 'alert')
      .and('have.attr', 'aria-live', 'polite')
      .and('not.be.empty')
  })

  it('has visible keyboard focus rules for links', () => {
    cy.readFile('css/links.css').should((css) => {
      expect(css).to.include('a:focus-visible')
      expect(css).to.include('outline: 2px solid')
      expect(css).to.include('outline-offset: 3px')
    })
  })
})