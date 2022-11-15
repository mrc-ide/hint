import type { PlaywrightTestConfig } from '@playwright/test';
import dotenv from 'dotenv';

// Dotenv reads from default ".env".
dotenv.config();

const config: PlaywrightTestConfig = {
    globalSetup: require.resolve("./src/tests/e2e/loginSetup"),
    testMatch: '*.etest.ts',
    timeout: 30000,
    expect: {
        /**
         * Maximum time expect() should wait for the condition to be met.
         * For example in `await expect(locator).toHaveText();`
         */
        timeout: 5000
    },
    fullyParallel: true,
    retries: process.env.CI ? 1 : 0,
    workers: process.env.CI ? 1 : undefined,
    use: {
        actionTimeout: 0,
        baseURL: process.env.CI ? 'http://hint:8080' : 'http://localhost:8080',
        trace: 'on-first-retry',
        /**
         *  StorageState.json stores signed-in state as configured in tests/e2e/loginSetup.ts.
         *  This ensures test suites can reuse the login state and not having to re-login
         *  for each test.
         *
         */
        storageState: 'storageState.json'
    }
};

export default config;
