describe('@collab-ui/core', function() {
  it('snapshot of activity-button', function() {
    cy.visit(`${Cypress.env('BASE_URL')}/activity-button`)
      .get('.cui-button__container--small')
      .should('be.visible')
      .percySnapshot();
  });
});
