describe('Instagram Analyzer', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('displays the application title', () => {
    cy.contains('Instagram Analyzer').should('be.visible');
  });

  it('validates input field requirements', () => {
    cy.get('button[type="submit"]').click();
    cy.contains('Required').should('be.visible');
  });

  it('validates Instagram handle format', () => {
    cy.get('input').type('invalid username!');
    cy.get('button[type="submit"]').click();
    cy.contains('Invalid Instagram handle format').should('be.visible');
  });

  it('allows valid Instagram handle format', () => {
    // Intercept API call
    cy.intercept('POST', '/api/analyze', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          profile: {
            username: 'instagram',
            fullName: 'Instagram',
            followersCount: 500000000,
            followingCount: 200,
            postsCount: 7000,
            isVerified: true
          },
          posts: [],
          engagementMetrics: {
            engagementRate: 4.5,
            postingFrequency: 5,
            averageLikes: 1000000,
            averageComments: 50000
          },
          timestamp: new Date().toISOString()
        }
      }
    }).as('analyzeProfile');

    cy.get('input').type('instagram');
    cy.get('button[type="submit"]').click();
    
    cy.contains('Analyzing...').should('be.visible');
    cy.wait('@analyzeProfile');
    
    cy.contains('@instagram').should('be.visible');
  });

  it('handles API errors correctly', () => {
    cy.intercept('POST', '/api/analyze', {
      statusCode: 500,
      body: {
        success: false,
        error: 'Server error',
        message: 'Something went wrong'
      }
    }).as('analyzeError');

    cy.get('input').type('instagram');
    cy.get('button[type="submit"]').click();
    cy.wait('@analyzeError');
    
    cy.contains('Something went wrong').should('be.visible');
  });
});