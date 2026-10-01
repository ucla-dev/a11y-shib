import { defineConfig } from 'cypress'

export default defineConfig({
  experimentalRunAllSpecs: true,
  e2e: {
    baseUrl: 'http://localhost:8080',
  },
})