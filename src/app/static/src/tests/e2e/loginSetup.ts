import { chromium, FullConfig } from '@playwright/test';

async function loginSetup(config: FullConfig) {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto('http://localhost:8080');
    await page.getByLabel('Username (email address)').fill('test.user@example.com');
    await page.getByLabel('Password').fill('password');
    await page.getByText('Log In').click();
    // Save signed-in state to 'storageState.json'.
    await page.context().storageState({ path: 'storageState.json' });
    await browser.close();
}

export default loginSetup;