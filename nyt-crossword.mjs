#!/usr/bin/env node

import puppeteer from 'puppeteer';

let login =
    'https://myaccount.nytimes.com/auth/enter-email?redirect_uri=https%3A%2F%2Fwww.nytimes.com%2Fcrosswords%2Farchive%2Fdaily&response_type=cookie&client_id=games&application=crosswords&asset=navigation-bar';

(async () => {
    let browser = await puppeteer.launch({
        headless: false
    });
    let page = await browser.newPage();
    await page.goto(login);
    await page.waitForFunction(
        "window.location.pathname == '/crosswords/archive/daily'",
        {
            timeout: 0
        }
    );
})();
