import { defineConfig, devices } from '@playwright/test';

const isCI = Boolean(process.env.CI);

export default defineConfig({
  testDir: './specs',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  reporter: isCI ? [['html', { open: 'never' }], ['github']] : 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'npm run start -w @duper/api',
      url: 'http://localhost:3000/api/health',
      reuseExistingServer: !isCI,
      env: { NODE_ENV: 'test', ALLOW_SIMULATION: 'true' },
    },
    {
      command: 'npm run dev -w @duper/web',
      url: 'http://localhost:5173',
      reuseExistingServer: !isCI,
    },
  ],
});
