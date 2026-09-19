import 'cypress-axe'
import 'cypress-real-events'
import { pages } from '../support/generated-pages'

const FORM_PAGES = ['/index.html', '/logon-form-after-failed-login.html'] as const

const FOCUSABLE_SELECTOR =
  'a[href], area[href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), ' +
  'textarea:not([disabled]), button:not([disabled]), iframe, [tabindex]:not([tabindex="-1"]), ' +
  '[contenteditable]:not([contenteditable="false"])'

// Cypress's built-in .focus() only allows a hardcoded set of tags and
// rejects <summary>, even though browsers do let it receive focus. Calling
// the native DOM focus() directly sidesteps that check.
function nativeFocus(selector: string) {
  cy.get(selector).then(($el) => $el.trigger('focus'))
}

function expectVisibleFocusIndicator(selector: string) {
  nativeFocus(selector)
  cy.focused().should(($el) => {
    const styles = getComputedStyle($el[0])
    const hasOutline = styles.outlineStyle !== 'none' && parseFloat(styles.outlineWidth) > 0
    const hasBoxShadow = styles.boxShadow !== 'none'

    expect(
      hasOutline || hasBoxShadow,
      `"${selector}" should show a visible focus indicator (outline or box-shadow) when focused`
    ).to.be.true
  })
}

describe('Skip link (WCAG 2.4.1 Bypass Blocks)', () => {
  pages.forEach((page) => {
    // Note: this deliberately checks DOM order rather than simulating a real
    // click-then-Tab. A real mouse click biases which element Chromium's
    // native Tab lands on next based on the click's on-screen position (a
    // "closest to click" heuristic), which has nothing to do with how a
    // keyboard-only or screen-reader user actually reaches the page — they
    // never click first. DOM order is what genuinely determines their first
    // Tab stop.
    it(`is the first focusable element in DOM order on ${page}`, () => {
      cy.visit(page)

      cy.document().then((doc) => {
        const focusable = Array.from(doc.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
        expect(focusable.length, 'page should have at least one focusable element').to.be.greaterThan(0)
        expect(
          focusable[0],
          'the skip link should be the very first element a keyboard user tabs to'
        ).to.have.class('skip-link')
      })
    })

    it(`moves focus to main content when activated on ${page}`, () => {
      cy.visit(page)

      cy.get('.skip-link').focus()
      cy.realPress('Enter')
      cy.focused().should('have.id', 'main-content')
    })
  })
})

describe('Focus-visible on non-link controls', () => {
  FORM_PAGES.forEach((page) => {
    it(`shows a visible focus indicator on form fields and the submit button on ${page}`, () => {
      cy.visit(page)

      expectVisibleFocusIndicator('#ucla-logon-id')
      expectVisibleFocusIndicator('#ucla-logon-password')
      expectVisibleFocusIndicator('button[type="submit"]')
    })
  })

  pages.forEach((page) => {
    it(`shows a visible focus indicator on the demo-nav toggle on ${page}`, () => {
      cy.visit(page)
      expectVisibleFocusIndicator('.demo-nav summary')
    })
  })
})

describe('Keyboard-only form flow', () => {
  FORM_PAGES.forEach((page) => {
    it(`tabs through fields, the submit button, and links in visual order on ${page}`, () => {
      cy.visit(page)

      cy.get('#ucla-logon-id').focus()
      cy.focused().should('have.id', 'ucla-logon-id')

      cy.realPress('Tab')
      cy.focused().should('have.id', 'ucla-logon-password')

      cy.realPress('Tab')
      cy.focused().should('have.attr', 'type', 'submit')

      cy.realPress('Tab')
      cy.focused().should('contain.text', 'UCLA Login ID')

      cy.realPress('Tab')
      cy.focused().should('contain.text', 'Password')

      cy.realPress('Tab')
      cy.focused().should('contain.text', 'Need a UCLA Logon ID')
    })
  })
})

describe('Demo-nav details/summary keyboard toggle', () => {
  pages.forEach((page) => {
    it(`opens and closes with the keyboard on ${page}`, () => {
      cy.visit(page)

      cy.get('.demo-nav details').should('not.have.attr', 'open')

      nativeFocus('.demo-nav summary')
      cy.realPress('Enter')
      cy.get('.demo-nav details').should('have.attr', 'open')
      cy.get('.demo-nav summary').should('be.visible')

      cy.realPress('Enter')
      cy.get('.demo-nav details').should('not.have.attr', 'open')
    })
  })
})

describe('Reflow at 320px (WCAG 1.4.10 Reflow)', () => {
  pages.forEach((page) => {
    it(`has no horizontal scrolling at a 320px viewport on ${page}`, () => {
      cy.viewport(320, 640)
      cy.visit(page)

      cy.document().then((doc) => {
        const scrollWidth = doc.documentElement.scrollWidth
        expect(
          scrollWidth,
          `document scrollWidth (${scrollWidth}px) should not exceed the 320px viewport`
        ).to.be.at.most(321)
      })
    })
  })
})
