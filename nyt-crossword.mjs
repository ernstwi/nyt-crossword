#!/usr/bin/env node

import fs from 'fs';
import https from 'https';

import dateFormat from 'dateformat';
import puppeteer from 'puppeteer';

if (!fs.existsSync('cookies.json')) await getCookies();
let cookies = JSON.parse(fs.readFileSync('cookies.json'));

let pdf = await request(
    crossword(new Date(2022, 9, 1)),
    cookies.map(c => `${c.name}=${c.value}`)
);

fs.writeFileSync('out.pdf', pdf, { encoding: 'binary' });

// ---- Helpers ----------------------------------------------------------------

function request(url, cookies) {
    return new Promise((resolve, reject) => {
        let req = https.request(url, {}, function (res) {
            if (res.statusCode < 200 || res.statusCode >= 300) {
                return reject(new Error(res.statusCode));
            }
            let data = '';
            res.setEncoding('binary');
            res.on('data', chunk => {
                data += chunk;
            });
            res.on('end', () => resolve(data));
        });
        req.on('error', err => reject(err));
        req.setHeader('Cookie', cookies);
        req.end();
    });
}

function crossword(date) {
    return [
        'https://www.nytimes.com/svc/crosswords/v2/puzzle/print/',
        dateFormat(date, 'mmmddyy'),
        '.pdf'
    ].join('');
}

async function getCookies() {
    let login = 'https://myaccount.nytimes.com/auth/enter-email';
    let browser = await puppeteer.launch({
        headless: false
    });
    let page = await browser.newPage();
    await page.goto(login);
    await page.waitForFunction(
        "window.location == 'https://www.nytimes.com/?login=email&auth=login-email'",
        {
            timeout: 0
        }
    );
    fs.writeFileSync('cookies.json', JSON.stringify(await page.cookies()));
    await browser.close();
}
