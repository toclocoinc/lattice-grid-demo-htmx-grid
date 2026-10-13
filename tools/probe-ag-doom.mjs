import puppeteer from 'puppeteer-core';
const url = process.argv[2];
const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage(); await page.setViewport({ width: 1440, height: 800 });
const errs = []; page.on('pageerror', (e) => errs.push(e.message)); page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 140)); });
await page.goto(url, { waitUntil: 'networkidle2', timeout: 90000 });
await page.click('#startBtn'); await new Promise((r) => setTimeout(r, 8000));
await page.keyboard.press('Enter'); await new Promise((r) => setTimeout(r, 1500)); await page.keyboard.press('Enter'); await new Promise((r) => setTimeout(r, 2000));
const readings = [];
for (let i = 0; i < 5; i++) { await page.keyboard.down('ArrowLeft'); await new Promise((r) => setTimeout(r, 1500)); await page.keyboard.up('ArrowLeft'); readings.push(await page.evaluate(() => document.getElementById('status').innerText)); }
const cells = await page.evaluate(() => document.querySelectorAll('.ag-cell').length);
console.log('cells in DOM', cells); console.log(readings.join(' | ')); console.log(errs.slice(0, 4).join('\n') || '(no errors)');
await browser.close();
