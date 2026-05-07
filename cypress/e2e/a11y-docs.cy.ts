// cypress/e2e/a11y-docs.cy.ts
import 'cypress-axe'
import { pages } from '../support/generated-pages'

describe('Accessibility on all root HTML pages', () => {
  pages.forEach((page) => {
    it(`checks ${page}`, () => {
      cy.visit(page)
      cy.injectAxe()
      cy.checkA11y(null, {
        runOnly: {
          type: 'tag',
          values: ['wcag21a', 'wcag21aa'],
        },
      })
    })
  })
})