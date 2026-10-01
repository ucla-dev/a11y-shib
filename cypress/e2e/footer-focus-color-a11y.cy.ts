import { pages } from '../support/generated-pages'

// .footer a:visited and .footer a:hover dim the text color (#ddd / #ccc) off
// the base white. Those rules have the same CSS specificity as the focus
// rules, so without an explicit `color` on :focus/:focus-visible, a visited
// or hovered-then-focused footer link would keep that dimmer color while
// focused, even though the white outline still shows up fine.
describe('Footer links stay white text when focused', () => {
  pages.forEach((page) => {
    it(`shows white text on a focused footer link on ${page}`, () => {
      cy.visit(page)

      cy.get('.footer a')
        .first()
        .then(($el) => $el.trigger('focus'))

      cy.focused().should(($el) => {
        const color = getComputedStyle($el[0]).color
        expect(color, 'focused footer link text should be white (rgb(255, 255, 255))').to.equal('rgb(255, 255, 255)')
      })
    })
  })
})
