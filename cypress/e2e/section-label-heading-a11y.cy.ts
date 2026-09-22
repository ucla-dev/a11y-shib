import { pages } from '../support/generated-pages'

// A common way a "section label" ends up not being a heading: someone
// wraps the whole paragraph in <strong>/<b> instead of using a real
// <h2>-<h6> — e.g. <p><strong>Please Note:</strong></p> or
// <p><strong>Are you a member of UCLA Health Sciences?</strong></p>. It
// *looks* like a section title to sighted users, but screen readers
// navigating by heading structure skip right past it because it's just
// emphasized body text. This only flags a <p> whose ENTIRE text content
// lives inside a single bold child — not incidental bold text used inline
// within a sentence (e.g. "<p>This is a stub page for <strong>X</strong>.</p>"
// or a "<strong>Label:</strong> value" pair inside a list item), since those
// are legitimate uses of emphasis rather than a heading standing in for body
// copy.
describe('Bold paragraphs aren\'t standing in for section headings', () => {
  pages.forEach((page) => {
    it(`doesn't use a bold-only paragraph as a fake section heading on ${page}`, () => {
      cy.visit(page)

      cy.document().then((doc) => {
        const paragraphs = Array.from(doc.querySelectorAll<HTMLParagraphElement>('p'))

        paragraphs.forEach((p) => {
          const elementChildren = Array.from(p.children)
          const isSingleBoldChild =
            elementChildren.length === 1 && /^(strong|b)$/i.test(elementChildren[0].tagName)

          if (!isSingleBoldChild) return

          const paragraphText = (p.textContent || '').replace(/\s+/g, ' ').trim()
          const boldText = (elementChildren[0].textContent || '').replace(/\s+/g, ' ').trim()

          // The bold element accounts for essentially the whole paragraph
          // (allowing for trailing punctuation Cypress/HTML authors often
          // leave outside the <strong>, like a period or colon).
          const isBoldOnlyParagraph = boldText.length > 0 && paragraphText.replace(/[.:!?]*$/, '') === boldText

          if (!isBoldOnlyParagraph) return

          expect.fail(
            `<p><strong>${boldText}</strong></p> reads as a section title but is only bold body text, so ` +
              `screen readers navigating by heading structure skip past it. Use a real <h2>-<h6> instead.`
          )
        })
      })
    })
  })
})
