const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://robot-lab-five.vercel.app',
    supportFile: 'cypress/support/e2e.js',
    video: false,
  },
})
