describe('InstaAnalytics', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.contains('Bem-vindo de volta', { timeout: 10000 }).should('be.visible');
  });

  it('displays the login page title', () => {
    cy.contains('Bem-vindo de volta').should('be.visible');
  });

  it('validates login form - required fields prevent submit', () => {
    cy.get('form').within(() => {
      cy.get('button[type="submit"]').click();
    });
    cy.url().should('include', '/login');
  });

  it('accepts input in email and password fields', () => {
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('password123');
    cy.get('input[type="email"]').should('have.value', 'test@example.com');
  });

  it('displays login form with email and password fields', () => {
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
  });
});
