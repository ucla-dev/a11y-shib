import { pages } from '../support/generated-pages'

const FOCUSABLE_SELECTOR =
  'a[href], area[href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), ' +
  'textarea:not([disabled]), button:not([disabled]), iframe, [tabindex]:not([tabindex="-1"]), ' +
  '[contenteditable]:not([contenteditable="false"])'

// The demo-nav ("Style Guide" etc.) is dev-only chrome already covered by its
// own focus-visibility check in keyboard-interaction-a11y.cy.ts and excluded
// from axe scans elsewhere in this suite; excluded here too to avoid testing
// it twice.
const DEMO_NAV_EXCLUSION = '.demo-nav *'

function isTransparent(color: string) {
  if (!color || color === 'transparent') return true
  const rgba = color.match(/rgba?\(([^)]+)\)/)
  if (!rgba) return false
  const parts = rgba[1].split(',').map((p) => p.trim())
  const alpha = parts.length === 4 ? parseFloat(parts[3]) : 1
  return alpha === 0
}

function describeElement($el: JQuery<HTMLElement>, index: number) {
  const tag = $el.prop('tagName').toLowerCase()
  const text = $el.text().replace(/\s+/g, ' ').trim().slice(0, 40)
  const id = $el.attr('id')
  const label = [tag, id ? `#${id}` : '', text ? `"${text}"` : ''].filter(Boolean).join(' ')
  return `${label || tag} (focusable element #${index})`
}

// WCAG 2.4.11 (Focus Not Obscured, Minimum) only requires that the focused
// element isn't ENTIRELY hidden by other content (e.g. this site's fixed
// footer) — partial overlap is still compliant. So we sample the element's
// corners as well as its center and only call it obscured if every sampled
// point is covered by something else.
function isEntirelyObscured(el: HTMLElement) {
  const rect = el.getBoundingClientRect()
  const inset = 2
  const xs = [rect.left + inset, rect.left + rect.width / 2, rect.right - inset]
  const ys = [rect.top + inset, rect.top + rect.height / 2, rect.bottom - inset]
  const points = xs.flatMap((x) => ys.map((y) => [x, y] as const))

  return !points.some(([x, y]) => {
    const topElement = el.ownerDocument.elementFromPoint(x, y)
    return topElement !== null && (el.contains(topElement) || topElement.contains(el))
  })
}

describe('Focus visibility on every interactive element (WCAG 2.4.7 Focus Visible, 2.4.11 Focus Not Obscured)', () => {
  pages.forEach((page) => {
    it(`shows a visible, non-transparent focus indicator on every interactive element on ${page}`, () => {
      cy.visit(page)

      cy.document().then((doc) => {
        const elements = Cypress.$(doc.body).find(FOCUSABLE_SELECTOR).not(DEMO_NAV_EXCLUSION)
        expect(elements.length, 'page should have at least one focusable element to check').to.be.greaterThan(0)

        cy.wrap(elements.toArray()).each((el, index) => {
          const $el = el as unknown as JQuery<HTMLElement>
          const rawEl = $el[0]
          const label = describeElement($el, index)

          cy.wrap($el).then(($e) => $e.trigger('focus'))

          cy.focused().should(($focused) => {
            expect($focused[0], `${label} should actually receive focus`).to.equal(rawEl)

            const styles = getComputedStyle($focused[0])
            const outlineWidth = parseFloat(styles.outlineWidth)
            const hasVisibleOutline =
              styles.outlineStyle !== 'none' && outlineWidth > 0 && !isTransparent(styles.outlineColor)

            const hasVisibleBoxShadow = styles.boxShadow !== 'none' && !isTransparent(styles.boxShadow)

            expect(
              hasVisibleOutline || hasVisibleBoxShadow,
              `${label} should show a visible, non-transparent outline or box-shadow when focused ` +
                `(got outline: ${styles.outlineStyle} ${styles.outlineWidth} ${styles.outlineColor}, ` +
                `box-shadow: ${styles.boxShadow})`
            ).to.be.true
          })

          cy.focused().should(($focused) => {
            const rect = $focused[0].getBoundingClientRect()
            expect(rect.width, `${label} should have a non-zero width while focused`).to.be.greaterThan(0)
            expect(rect.height, `${label} should have a non-zero height while focused`).to.be.greaterThan(0)
          })

          // If something (e.g. this site's fixed footer) happens to be
          // covering the focused element completely, nudge the viewport and
          // check again — a sighted keyboard user in that spot would just
          // scroll to see it, and the browser's focus-triggered autoscroll
          // doesn't know to steer clear of fixed/sticky overlays. Only a
          // control that's STILL entirely hidden after scrolling is a real
          // 2.4.11 violation.
          cy.focused().then(($focused) => {
            if (isEntirelyObscured($focused[0])) {
              cy.window().then((win) => win.scrollBy(0, 150))
            }
          })

          cy.focused().should(($focused) => {
            expect(
              !isEntirelyObscured($focused[0]),
              `${label} should not be entirely hidden behind another element when focused, even after scrolling`
            ).to.be.true
          })
        })
      })
    })
  })
})
