import assert from 'assert';
import cp from 'child_process';
import fs from 'fs';

import dateFormat, { masks } from 'dateformat';

function file(date) {
    return dateFormat(date, 'ddd-yyyy-mm-dd".pdf"').toLowerCase();
}

function iso(date) {
    return dateFormat(date, masks.isoDate);
}

teardown(() => {
    cp.execSync('rm -f *.pdf');
});

suite('nyt-crossword', function () {
    this.timeout(0);
    this.slow(7000);

    test('No arg', () => {
        let f = file(new Date());
        let o = cp.execSync('npx nyt-crossword').toString();
        let d = new Date();
        assert.strictEqual(o, `${iso(d)}... \x1B[32m${file(d)}\x1B[0m\n`);
        assert.ok(fs.existsSync(f));
    });

    test('1 date', () => {
        let f = file(new Date('2022-10-24'));
        let o = cp.execSync('npx nyt-crossword 2022-10-24').toString();
        assert.strictEqual(
            o,
            '2022-10-24... \x1B[32mmon-2022-10-24.pdf\x1B[0m\n'
        );
        assert.ok(fs.existsSync(f));
    });

    test('2 dates', () => {
        let a = file(new Date('2022-10-23'));
        let b = file(new Date('2022-10-24'));
        let o = cp
            .execSync('npx nyt-crossword 2022-10-23 2022-10-24')
            .toString();
        assert.strictEqual(
            o,
            [
                '2022-10-23... \x1B[32msun-2022-10-23.pdf\x1B[0m\n',
                '2022-10-24... \x1B[32mmon-2022-10-24.pdf\x1B[0m\n'
            ].join('')
        );
        assert.ok(fs.existsSync(a));
        assert.ok(fs.existsSync(b));
    });

    test('2 dates, --day', () => {
        let a = file(new Date('2022-10-23'));
        let b = file(new Date('2022-10-24'));
        let o = cp
            .execSync('npx nyt-crossword --day sun 2022-10-23 2022-10-24')
            .toString();
        assert.strictEqual(
            o,
            '2022-10-23... \x1B[32msun-2022-10-23.pdf\x1B[0m\n'
        );
        assert.ok(fs.existsSync(a));
        assert.ok(!fs.existsSync(b));
    });

    test('1 date, --latex', () => {
        let f = file(new Date('2022-10-24'));
        let o = cp.execSync('npx nyt-crossword 2022-10-24 --latex').toString();
        assert.strictEqual(
            o,
            '2022-10-24... \x1B[32mmon-2022-10-24.pdf\x1B[0m\n'
        );
        assert.ok(fs.existsSync(f));
    });

    test('Future date', () => {
        assert.doesNotThrow(() => {
            let o = cp.execSync('npx nyt-crossword 2050-01-01').toString();
            assert.ok(
                [
                    '2050-01-01... \x1B[31mError: 401\x1B[0m\n',
                    '2050-01-01... \x1B[31mError: 500\x1B[0m\n'
                ].includes(o)
            );
        });
    });
});
