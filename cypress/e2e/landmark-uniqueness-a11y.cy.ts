import 'cypress-axe'
import { pages } from '../support/generated-pages'

const axeExclude = ['.demo-nav']

// When a page has more than one landmark of the same type (two <aside>s /
// role="complementary" regions, two <nav>s, etc.) and none of them have a
// distinguishing accessible name, a screen reader user navigating by
// landmarks hears the same generic label twice and can't tell which one is
// which. axe-core's "landmark-unique" rule checks exactly this: every
// landmark must be identifiable by its role + accessible name combination
// being unique on the page.
describe('Landmark regions of the same type have unique accessible names', () => {
  pages.forEach((page) => {
    it(`ensures same-type landmarks are distinguishable by name on ${page}`, () => {
      cy.visit(page)
      cy.injectAxe()
      cy.checkA11y(null, { runOnly: { type: 'rule', values: ['landmark-unique'] } }, null, axeExclude)
    })
  })
})
