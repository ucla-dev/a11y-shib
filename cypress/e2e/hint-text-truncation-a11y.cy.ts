// The Logon ID / Password hint text (rendered via .error-message, e.g.
// "Passwords are at least 6 characters long...") only shows up populated
// and visible on the failed-login page — on the clean login page it's
// present but empty and hidden until a real validation error fills it in.
const PAGE_WITH_VISIBLE_HINT_TEXT = '/logon-form-after-failed-login.html'
const HINT_SELECTORS = ['#ucla-logon-id-error', '#ucla-logon-password-error'] as const

// scrollHeight/scrollWidth exceeding clientHeight/clientWidth is the direct,
// mechanism-agnostic signature of clipped content — it happens whether the
// culprit is a fixed height + overflow:hidden, a max-height, or a
// single-line white-space:nowrap + text-overflow:ellipsis. An unconstrained
// block only grows to fit its content, so this mismatch only shows up when
// something is actually cutting text off.
function expectNotTruncated(selector: string) {
  cy.get(selector).should(($el) => {
    const el = $el[0]

    expect(el.textContent?.trim(), `${selector} should have visible hint text to check`).to.not.equal('')

    expect(
      el.scrollHeight,
      `${selector} content is taller than its box — some of its text is being clipped vertically`
    ).to.be.at.most(el.clientHeight + 1)

    expect(
      el.scrollWidth,
      `${selector} content is wider than its box — some of its text is being clipped horizontally`
    ).to.be.at.most(el.clientWidth + 1)
  })
}

describe('Hint/instruction text under credential fields is never clipped', () => {
  it('shows the full hint text at a 320px narrow viewport (WCAG 1.4.10 Reflow)', () => {
    cy.viewport(320, 640)
    cy.visit(PAGE_WITH_VISIBLE_HINT_TEXT)

    HINT_SELECTORS.forEach(expectNotTruncated)
  })

  it('shows the full hint text at 200% browser zoom (WCAG 1.4.4 Resize Text)', () => {
    cy.visit(PAGE_WITH_VISIBLE_HINT_TEXT, {
      onBeforeLoad(win) {
        win.document.documentElement.style.zoom = '2'
      },
    })

    HINT_SELECTORS.forEach(expectNotTruncated)
  })
})
