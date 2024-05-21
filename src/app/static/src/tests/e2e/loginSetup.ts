import {chromium, FullConfig} from '@playwright/test';
import {baseURL} from "../../../playwright.config";

async function loginSetup(_config: FullConfig) {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    await page.goto(baseURL);
    await page.getByPlaceholder('Email').fill('test.user@example.com');
    await page.getByPlaceholder('Password').fill('password');
    await page.getByText('Log In').click();
    // Save signed-in state to 'storageState.json'.
    await page.context().storageState({ path: 'storageState.json' });
    await browser.close();
}

export default loginSetup;
