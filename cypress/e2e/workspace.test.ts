import { AppElements as ae } from "../support/elements/app-elements";

context("Test the overall app", () => {
  beforeEach(() => {
    cy.visit("");
  });

  it("renders the app", () => {
    ae.getApp().should("exist");
  });

  it("renders the navigation tabs", () => {
    ae.getNavTabs().should("have.length", 3);
  });
});
