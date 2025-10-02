describe("test", () => {
  it("should login Fail", () => {
    const interceptedData = [];

    cy.intercept("POST", "https://robot-lab.onrender.com/api/**", (req) => {
      req.continue((res) => {
        interceptedData.push({
          url: req.url,
          method: req.method,
          requestBody: req.body,
          responseBody: res.body,
          statusCode: res.statusCode,
        });
      });
    }).as("anyApiPost");

    cy.visit("https://robot-lab-five.vercel.app/");
    cy.get(".logo").should("have.text", "Lobot Framework Lab");
    cy.wait(3000);
    cy.get(".nav-btn-login").click();
    cy.wait(2000);
    cy.get("#loginEmail").type("pea123@gmail.com");
    cy.wait(2000);
    cy.get("#loginPassword").type("password1234");
    cy.wait(2000);
    cy.get("form > button").click({ force: true });

    cy.wait("@anyApiPost"); 

    cy.get(".message")
      .invoke("text")
      .then((text) => {
        cy.log(text);
      });

    cy.get(".message").should("have.text", "Login successful! Welcome, Pea!");

    cy.then(() => {
      cy.writeFile(
        "cypress/fixtures/intercepted_post_data.json",
        interceptedData,
        { log: true }
      );
    });
  });
});
