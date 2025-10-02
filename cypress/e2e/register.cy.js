describe("Register Test with API", () => {
  const baseUrl = "https://robot-lab-five.vercel.app/";
  const capturedFixture = "intercepted_post_data.json";
  const generatedFixture10 = "register_10_emails.json";
  const replayResultsFile = "register_10_results.json";

  it("should capture register API and replay 10 times", () => {
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
    cy.get(".nav-btn-register").click();
    cy.screenshot("register-page");

    // --- Register รอบแรก ใช้ข้อมูลจริงของคุณ ---
    cy.get("#firstName").type("Pea");
    cy.get("#lastName").type("Test");
    cy.get("#email").type(`pea123@gmail.com`);
    cy.get("#password").type("password1234");
    cy.get("form > button").click({ force: true });

    cy.wait("@anyApiPost").then(() => {
      cy.screenshot("register-first-submit");
    });

    // --- บันทึก captured POST request ---
    cy.then(() => {
      cy.writeFile(`cypress/fixtures/${capturedFixture}`, interceptedData, { log: true });
    });

    // --- Replay API 10 Email ใหม่ (sequential) ---
    cy.then(() => {
      cy.fixture(capturedFixture).then((data) => {
        if (!Array.isArray(data) || data.length === 0) return;

        const template = data[0].requestBody;
        const url = data[0].url;
        const payloads = [];

        for (let i = 1; i <= 10; i++) {
          const payload = { ...template };
          payload.firstName = "Pea";
          payload.lastName = "Test";
          payload.email = `pea123_${i}@example.com`;
          payload.password = "password1234";
          payloads.push(payload);
        }

        cy.writeFile(`cypress/fixtures/${generatedFixture10}`, payloads, { log: true });

        const results = [];
        const sendRequest = (idx) => {
          if (idx >= payloads.length) {
            cy.writeFile(`cypress/fixtures/${replayResultsFile}`, results, { log: true });
            return;
          }

          const payload = payloads[idx];
          cy.request({
            method: "POST",
            url,
            body: payload,
            failOnStatusCode: false,
          }).then((res) => {
            const record = {
              iteration: idx + 1,
              request: { url, method: "POST", body: payload },
              response: { status: res.status, body: res.body },
              timestamp: Date.now(),
            };
            results.push(record);
            cy.log(`Iteration ${idx + 1} - status: ${res.status}`);
            cy.log(JSON.stringify(res.body, null, 2));
            cy.screenshot(`register-replay-${idx + 1}-status-${res.status}`);

            sendRequest(idx + 1);
          });
        };

        sendRequest(0);
      });
    });
  });
});
