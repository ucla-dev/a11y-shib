import { pages } from '../support/generated-pages'

// Every title on this site is styled via a "heading" family of CSS classes
// (heading, heading-1, heading-2--red, heading-1--primary, etc.). If that
// class ever ends up on a non-heading element — a <div> or <p> made to
// *look* like a heading — screen reader users navigating by heading
// structure skip right past it, even though sighted users see it as a
// section title. This matches class tokens like "heading", "heading-2", or
// "heading-1--primary", but not unrelated tokens that merely contain the
// word (e.g. a hypothetical "subheading-note").
const HEADING_CLASS_TOKEN = /^heading(-\d+)?(--[a-z0-9-]+)?$/i

describe('Elements styled as headings are real headings (WCAG 1.3.1 Info and Relationships)', () => {
  pages.forEach((page) => {
    it(`only uses <h1>-<h6> tags for heading-styled text on ${page}`, () => {
      cy.visit(page)

      cy.document().then((doc) => {
        // className is a plain string on HTML elements but an SVGAnimatedString
        // on SVG elements (this site's inline UCLA logo has classed <path>s),
        // so classList is used instead — it works consistently on both.
        const candidates = Array.from(doc.querySelectorAll<HTMLElement>('[class]')).filter((el) =>
          Array.from(el.classList).some((token) => HEADING_CLASS_TOKEN.test(token))
        )

        expect(candidates.length, 'page should have at least one heading-styled element').to.be.greaterThan(0)

        candidates.forEach((el) => {
          const text = el.textContent?.replace(/\s+/g, ' ').trim().slice(0, 50)
          const classAttr = el.getAttribute('class')
          expect(
            el.tagName,
            `element styled as a heading ("${text}", class="${classAttr}") should be a real <h1>-<h6> ` +
              `element, not a ${el.tagName.toLowerCase()} — otherwise screen reader users navigating by heading ` +
              `structure skip right past it`
          ).to.match(/^H[1-6]$/)
        })
      })
    })
  })
})
