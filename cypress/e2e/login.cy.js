describe("Login Test with API", () => {
  const baseUrl = "https://robot-lab-five.vercel.app/";

  it("should login success and fail", () => {
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

    cy.visit(baseUrl);
    cy.get(".logo").should("have.text", "Lobot Framework Lab");

    // --- Login สำเร็จ ---
    cy.get(".nav-btn-login").click();
    cy.get("#loginEmail").type("pea123@gmail.com");
    cy.get("#loginPassword").type("password1234");
    cy.get("form > button").click({ force: true });

    cy.wait("@anyApiPost");
    cy.get(".message")
      .should("have.text", "Login successful! Welcome, Pea!");
    cy.screenshot("login-success");

    // --- Login ล้มเหลว ---
    cy.visit(baseUrl);
    cy.get(".nav-btn-login").click();
    cy.get("#loginEmail").type("wrongemail@example.com");
    cy.get("#loginPassword").type("wrongpass");
    cy.get("form > button").click({ force: true });

    cy.wait("@anyApiPost");
    cy.get(".message")
      .should("contain.text", "Invalid credentials");
    cy.screenshot("login-fail");

    // บันทึก intercepted POST request เป็นไฟล์ JSON
    cy.then(() => {
      cy.writeFile(
        "cypress/fixtures/intercepted_post_data.json",
        interceptedData,
        { log: true }
      );
    });
  });
});
