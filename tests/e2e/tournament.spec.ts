describe('Tournament Flow', () => {
  beforeEach(() => {
    cy.login('testuser@example.com', 'password123');
  });

  it('should create and join a tournament', () => {
    // Navigate to tournaments
    cy.get('[data-testid="tournaments-tab"]').click();
    cy.get('[data-testid="create-tournament"]').click();

    // Fill tournament details
    cy.get('[data-testid="tournament-title"]').type('Test Tournament');
    cy.get('[data-testid="game-type"]').select('Fortnite');
    cy.get('[data-testid="entry-fee"]').type('100');
    cy.get('[data-testid="max-participants"]').type('4');
    cy.get('[data-testid="create-button"]').click();

    // Verify tournament created
    cy.get('[data-testid="tournament-list"]')
      .should('contain', 'Test Tournament');

    // Join tournament
    cy.get('[data-testid="join-tournament"]').first().click();
    cy.get('[data-testid="confirm-join"]').click();

    // Verify joined
    cy.get('[data-testid="tournament-status"]')
      .should('contain', 'Joined');
  });
});