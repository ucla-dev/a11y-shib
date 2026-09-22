import { pages } from '../support/generated-pages'

const FORM_PAGES = ['/index.html', '/logon-form-after-failed-login.html'] as const

// The `zoom` CSS property is a Chromium-specific, non-standard property, but
// unlike `transform: scale()` it actually re-triggers layout the same way a
// user's native browser zoom does, so it's the closest thing Cypress (running
// on Chromium/Electron) can do to a real 200% browser zoom.
function visitZoomed(page: string, level = 2) {
  cy.visit(page, {
    onBeforeLoad(win) {
      win.document.documentElement.style.zoom = String(level)
    },
  })
}

// At 200% zoom a button whose hit target is obscured or pushed off under
// another element is a real loss of functionality, even if the button
// itself still reports as ":visible" (Cypress's visibility check doesn't
// account for being covered by a sibling or clipped by the viewport).
function expectClickable(selector: string) {
  cy.get(selector).should('be.visible')
  cy.get(selector).then(($el) => {
    const rect = $el[0].getBoundingClientRect()
    const win = $el[0].ownerDocument.defaultView!

    expect(rect.width, `${selector} should have a non-zero width at 200% zoom`).to.be.greaterThan(0)
    expect(rect.height, `${selector} should have a non-zero height at 200% zoom`).to.be.greaterThan(0)

    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    expect(
      centerX,
      `${selector} center should be within the horizontal viewport at 200% zoom`
    ).to.be.within(0, win.innerWidth)
    expect(
      centerY,
      `${selector} center should be within the vertical viewport at 200% zoom`
    ).to.be.within(0, win.innerHeight)

    const topElement = $el[0].ownerDocument.elementFromPoint(centerX, centerY)
    expect(
      $el[0].contains(topElement) || topElement === $el[0],
      `${selector} should not be obscured by another element at its own center point`
    ).to.be.true
  })
}

describe('Browser zoom at 200% (WCAG 2.1 SC 1.4.4 Resize Text)', () => {
  pages.forEach((page) => {
    it(`keeps content usable at 200% zoom on ${page}`, () => {
      visitZoomed(page)

      cy.get('main#main-content').should('be.visible')

      cy.get('main#main-content').then(($main) => {
        const rect = $main[0].getBoundingClientRect()
        expect(rect.width, 'main content should still render with real width at 200% zoom').to.be.greaterThan(0)
      })
    })

    it(`keeps the skip link visible and functional on focus at 200% zoom on ${page}`, () => {
      visitZoomed(page)

      cy.get('.skip-link').then(($el) => $el.trigger('focus'))
      cy.focused().should('have.class', 'skip-link').and('be.visible')
      cy.focused().should(($el) => {
        const styles = getComputedStyle($el[0])
        expect(styles.clipPath, 'skip link should be unclipped on focus at 200% zoom').to.equal('none')
      })
    })
  })

  FORM_PAGES.forEach((page) => {
    it(`keeps the login form usable at 200% zoom on ${page}`, () => {
      visitZoomed(page)

      expectClickable('#ucla-logon-id')
      expectClickable('#ucla-logon-password')
      expectClickable('button[type="submit"]')
    })
  })
})
