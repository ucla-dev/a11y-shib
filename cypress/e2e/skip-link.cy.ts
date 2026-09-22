import 'cypress-real-events'
import { pages } from '../support/generated-pages'

// Cypress's built-in .focus() only allows a hardcoded set of tags. The skip
// link is an <a>, which is allowed, but we use the native trigger everywhere
// here for consistency with how focus is asserted elsewhere in this suite.
function focusSkipLink() {
  cy.get('.skip-link').then(($el) => $el.trigger('focus'))
}

describe('Skip to main content link', () => {
  pages.forEach((page) => {
    describe(page, () => {
      beforeEach(() => {
        cy.visit(page)
      })

      it('exists exactly once and points at #main-content', () => {
        cy.get('a.skip-link').should('have.length', 1).and('have.attr', 'href', '#main-content')
      })

      it('has an accessible name describing its destination', () => {
        cy.get('.skip-link').should('contain.text', 'Skip to main content')
      })

      it('targets a real, focusable element on the page', () => {
        cy.get('#main-content').should('exist').and('have.attr', 'tabindex', '-1')
      })

      it('is visually hidden until it receives focus', () => {
        // The link's box is wider than 1px in practice (box-sizing: border-box
        // means padding/border push the rendered box past the nominal 1px
        // width), so what actually hides it is clip-path, not layout size.
        cy.get('.skip-link').should(($el) => {
          const styles = getComputedStyle($el[0])

          expect(styles.clipPath, 'skip link should be clipped from view when not focused').to.not.equal('none')
        })
      })

      it('becomes visible when focused', () => {
        focusSkipLink()
        cy.focused().should('have.class', 'skip-link')
        cy.focused().should(($el) => {
          const styles = getComputedStyle($el[0])

          expect(styles.clipPath, 'skip link should no longer be clipped once focused').to.equal('none')
        })
      })

      it('shows a visible focus indicator', () => {
        focusSkipLink()
        cy.focused().should(($el) => {
          const styles = getComputedStyle($el[0])
          const hasOutline = styles.outlineStyle !== 'none' && parseFloat(styles.outlineWidth) > 0
          const hasVisibleBorder = styles.borderStyle !== 'none' && parseFloat(styles.borderWidth) > 0

          expect(
            hasOutline || hasVisibleBorder,
            'skip link should show a visible outline or border when focused'
          ).to.be.true
        })
      })

      it('is the very first element a keyboard user tabs to', () => {
        cy.realPress('Tab')
        cy.focused().should('have.class', 'skip-link')
      })

      it('moves focus to #main-content when activated with the keyboard', () => {
        focusSkipLink()
        cy.realPress('Enter')
        cy.focused().should('have.id', 'main-content')
      })

      it('moves focus to #main-content when clicked', () => {
        cy.get('.skip-link').click({ force: true })
        cy.focused().should('have.id', 'main-content')
      })

      it('updates the URL hash to #main-content after activation', () => {
        cy.get('.skip-link').click({ force: true })
        cy.location('hash').should('eq', '#main-content')
      })
    })
  })
})
