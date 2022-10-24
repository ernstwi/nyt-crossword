#!/usr/bin/env node

import fs from 'fs';
import https from 'https';

import dateFormat from 'dateformat';
import puppeteer from 'puppeteer';

// -----------------------------------------------------------------------------

let days = new Map([
    ['sun', 0],
    ['mon', 1],
    ['tue', 2],
    ['wed', 3],
    ['thu', 4],
    ['fri', 5],
    ['sat', 6]
]);

let arg = {
    start: null,
    end: null,
    day: null
};

let argv = process.argv.slice(2);

for (let i = 0; i < argv.length; i++) {
    if (argv[i] === `--day`) {
        i++;
        let day = argv[i];
        if (!days.has(day)) usage(1);
        arg.day = days.get(day);
        continue;
    }

    let date = new Date(argv[i]);

    //  > If called with an invalid date string ... [Date constructor] returns a Date
    //  object whose toString() method returns the literal string "Invalid Date".
    if (date === 'Invalid Date') usage(1);

    if (arg.start === null) arg.start = date;
    else arg.end = date;
}

if (arg.end !== null && arg.end < arg.start) usage(1);

console.log(arg);
process.exit(0);

// -----------------------------------------------------------------------------

if (!fs.existsSync('cookies.json')) await getCookies();
let cookies = JSON.parse(fs.readFileSync('cookies.json'));

let pdf = await request(
    crossword(new Date(2022, 9, 1)),
    cookies.map(c => `${c.name}=${c.value}`)
);

fs.writeFileSync('out.pdf', pdf, { encoding: 'binary' });

// ---- Helpers ----------------------------------------------------------------

function usage(status) {
    console.log(
        `${
            JSON.parse(fs.readFileSync('package.json')).name
        } [--day (mon|tue|wed|thu|fri|sat|sun>)] <start> [<end>]`
    );
    process.exit(status);
}

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
