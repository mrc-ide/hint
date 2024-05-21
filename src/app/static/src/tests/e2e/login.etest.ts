import {expect, test} from '@playwright/test';

test.describe("login test", () => {

    test('can login to root page', async ({page}) => {
        await page.goto('/');
        await expect(page).toHaveTitle("Naomi");
        await expect(page.locator('a[href="/logout"]')).toHaveCount(1)
        await page.waitForSelector("#projects-content")
        await expect(page.locator("#projects-content #projects-title h1")).toHaveText("Projects");
    });
})
