#!/usr/bin/env node

import fs from 'fs';
import https from 'https';
import path from 'path';

import dateFormat from 'dateformat';
import puppeteer from 'puppeteer';

// ---- Setup and arg parsing --------------------------------------------------

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
    if (argv[i] === '--help' || argv[i] === '-h') usage(0);

    if (argv[i] === '--day') {
        i++;
        let day = argv[i];
        if (!days.has(day)) usage(1);
        arg.day = days.get(day);
        continue;
    }

    let date = new Date(argv[i]);

    //  > If called with an invalid date string ... [Date constructor] returns a Date
    //  object whose toString() method returns the literal string "Invalid Date".
    if (date.toString() === 'Invalid Date') usage(1);

    if (arg.start === null) arg.start = date;
    else arg.end = date;
}

if (arg.start === null) arg.start = new Date();
if (arg.end === null) arg.end = new Date(arg.start);
if (arg.end < arg.start) usage(1);

// ---- Download ---------------------------------------------------------------

let cookiesFile = new URL('cookies.json', import.meta.url);
if (!fs.existsSync(cookiesFile))
    fs.writeFileSync(
        cookiesFile,
        JSON.stringify((await getCookies()).map(c => `${c.name}=${c.value}`))
    );
let cookies = JSON.parse(fs.readFileSync(cookiesFile));

for (let date = arg.start; date <= arg.end; date.setDate(date.getDate() + 1)) {
    if (arg.day !== null && date.getDay() !== arg.day) continue;

    let iso = dateFormat(date, 'yyyy-mm-dd');
    let file = dateFormat(date, 'ddd-yyyy-mm-dd".pdf"').toLowerCase();

    process.stdout.write(`${iso}... `);

    try {
        let pdf = await fetchPdf(crosswordUrl(date), cookies);
        fs.writeFileSync(file, pdf, {
            encoding: 'binary'
        });
        process.stdout.write(color(file, 32));
    } catch (err) {
        process.stdout.write(color(err, 31));
    }
    process.stdout.write('\n');
}

// ---- Helpers ----------------------------------------------------------------

function color(str, code) {
    return `\x1b[${code}m${str}\x1b[0m`;
}

function usage(status) {
    let msg = `${
        JSON.parse(fs.readFileSync(new URL('package.json', import.meta.url)))
            .name
    } [--day (mon|tue|wed|thu|fri|sat|sun)] [<start> [<end>]]`;
    if (status === 1) console.error(color(msg, 31));
    else console.log(msg);
    process.exit(status);
}

function fetchPdf(url, cookies) {
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

function crosswordUrl(date) {
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
    let res = await page.cookies();
    await browser.close();
    return res;
}
