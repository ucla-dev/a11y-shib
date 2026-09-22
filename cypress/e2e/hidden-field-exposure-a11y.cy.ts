import { pages } from '../support/generated-pages'

const FORM_CONTROL_SELECTOR = 'input:not([type="hidden"]), textarea, select, [contenteditable]:not([contenteditable="false"])'

// The demo-nav is dev-only chrome excluded from a11y scans elsewhere in this
// suite.
const DEMO_NAV_EXCLUSION = '.demo-nav *'

// A control is legitimately unreachable by assistive tech only if it's
// disabled, explicitly aria-hidden, or removed from rendering (display:none /
// visibility:hidden) on itself or an ancestor. Anything else stays in the
// accessibility tree and can be tabbed/swiped to.
function isExcludedFromAccessibilityTree(el: HTMLElement) {
  if (el.hasAttribute('disabled')) return true
  if (el.getAttribute('aria-hidden') === 'true') return true
  if (el.closest('[hidden], [aria-hidden="true"]')) return true

  let node: HTMLElement | null = el
  while (node) {
    const styles = getComputedStyle(node)
    if (styles.display === 'none' || styles.visibility === 'hidden') return true
    node = node.parentElement
  }

  return false
}

function describeElement(el: HTMLElement, index: number) {
  const tag = el.tagName.toLowerCase()
  const type = el instanceof HTMLInputElement ? el.type : ''
  const name = el.getAttribute('name') || el.id
  const label = [tag, type ? `[type="${type}"]` : '', name ? `"${name}"` : ''].filter(Boolean).join(' ')
  return `${label || tag} (form control #${index})`
}

describe('No invisible-but-interactive form fields', () => {
  pages.forEach((page) => {
    it(`ensures every reachable form control on ${page} is actually visible to sighted users`, () => {
      cy.visit(page)

      cy.document().then((doc) => {
        const controls = Cypress.$(doc.body).find(FORM_CONTROL_SELECTOR).not(DEMO_NAV_EXCLUSION)

        controls.each((index, el) => {
          // Legitimately hidden from assistive tech (disabled, aria-hidden,
          // display:none, visibility:hidden) — nothing for a screen reader
          // user to stumble into, so it's fine for it to also be invisible.
          if (isExcludedFromAccessibilityTree(el)) return

          const label = describeElement(el, index)
          const rect = el.getBoundingClientRect()
          const styles = getComputedStyle(el)
          const opacity = parseFloat(styles.opacity)

          const hasRealSize = rect.width > 1 && rect.height > 1
          const isOnScreen = rect.right > 0 && rect.bottom > 0
          const isOpaque = Number.isNaN(opacity) || opacity > 0.05

          expect(
            hasRealSize && isOnScreen && isOpaque,
            `${label} is reachable by assistive tech (it's not disabled, aria-hidden, or display:none/` +
              `visibility:hidden) but is visually imperceptible — size ${rect.width}x${rect.height}, ` +
              `position (${rect.left}, ${rect.top}), opacity ${styles.opacity}. A screen reader user could land ` +
              `on an editable field sighted users never see, which is confusing and a real WCAG 4.1.2 concern. ` +
              `If this control should be hidden, also give it the "hidden" attribute, aria-hidden="true", or ` +
              `disable it — not just CSS that hides it visually.`
          ).to.be.true
        })
      })
    })
  })
})
