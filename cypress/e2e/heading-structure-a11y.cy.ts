import { pages } from '../support/generated-pages'

describe('Headings identify and precede the main content (WCAG 2.4.6 Headings and Labels)', () => {
  pages.forEach((page) => {
    it(`has a level-1 heading inside <main>, appearing before any form, on ${page}`, () => {
      cy.visit(page)

      cy.document().then((doc) => {
        const allHeadings = Array.from(doc.querySelectorAll('h1, h2, h3, h4, h5, h6'))
        expect(allHeadings.length, 'page should have at least one heading').to.be.greaterThan(0)

        const main = doc.querySelector('main#main-content')
        expect(main, 'page should have a main landmark (main#main-content)').to.exist

        const firstHeading = allHeadings[0]

        // A screen reader user navigating by headings lands on the FIRST
        // heading in the document, wherever it is. If that heading sits in
        // a sidebar/secondary region instead of the main content, heading
        // navigation skips right past the thing the page is actually for.
        expect(
          main!.contains(firstHeading),
          'the first heading on the page should be inside <main>, not off in a sidebar or other secondary region'
        ).to.be.true

        expect(
          firstHeading.tagName.toLowerCase(),
          'the first heading on the page should be a level-1 heading (<h1>) identifying the main content'
        ).to.equal('h1')

        const form = doc.querySelector('form')
        if (form) {
          const comparison = firstHeading.compareDocumentPosition(form)
          const headingComesBeforeForm = Boolean(comparison & Node.DOCUMENT_POSITION_FOLLOWING)

          expect(
            headingComesBeforeForm,
            'the main heading should come before the <form> in DOM order, so heading-navigation users land ' +
              'above the form and know what it is before reaching it, not after'
          ).to.be.true
        }
      })
    })
  })
})
