import assert from 'assert';
import cp from 'child_process';
import fs from 'fs';

import dateFormat, { masks } from 'dateformat';

let days = new Map([
    ['sun', 0],
    ['mon', 1],
    ['tue', 2],
    ['wed', 3],
    ['thu', 4],
    ['fri', 5],
    ['sat', 6]
]);
let days_ = new Map([...days].map(([k, v]) => [v, k]));

function file(date) {
    let iso = dateFormat(date, masks.isoDate);
    let f = `${days_.get(date.getDay())}-${iso}.pdf`;
    return f;
}

afterEach(() => {
    cp.execSync('rm -f *.pdf');
});

describe('nyt-crossword', function () {
    this.timeout(0);
    this.slow(7000);

    it('No arg', () => {
        let f = file(new Date());
        cp.execSync('npx nyt-crossword');
        assert.ok(fs.existsSync(f));
    });

    it('1 date', () => {
        let f = file(new Date('2022-10-24'));
        cp.execSync('npx nyt-crossword 2022-10-24');
        assert.ok(fs.existsSync(f));
    });

    it('2 dates', () => {
        let a = file(new Date('2022-10-23'));
        let b = file(new Date('2022-10-24'));
        cp.execSync('npx nyt-crossword 2022-10-23 2022-10-24');
        assert.ok(fs.existsSync(a));
        assert.ok(fs.existsSync(b));
    });

    it('2 dates, --day', () => {
        let a = file(new Date('2022-10-23'));
        let b = file(new Date('2022-10-24'));
        cp.execSync('npx nyt-crossword --day sun 2022-10-23 2022-10-24');
        assert.ok(fs.existsSync(a));
        assert.ok(!fs.existsSync(b));
    });

    it('Future date', () => {
        assert.doesNotThrow(() => {
            cp.execSync('npx nyt-crossword 2050-01-01');
        });
    });
})
