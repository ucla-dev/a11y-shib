export {}

describe('Buttons have a clear, offset focus indicator', () => {
  it('has visible keyboard focus rules for buttons', () => {
    cy.readFile('css/buttons.css').should((css) => {
      expect(css).to.include('button:focus-visible')
      expect(css).to.include('outline: 2px solid')
      expect(css).to.include('outline-offset: 3px')
    })
  })
})
