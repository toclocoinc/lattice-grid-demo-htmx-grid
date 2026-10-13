import puppeteer from 'puppeteer-core';
const url = process.argv[2];
const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage(); await page.setViewport({ width: 1600, height: 900 });
await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
const btn = await page.$('button'); if (btn) await btn.click();
await new Promise((r) => setTimeout(r, 6000));
await page.keyboard.press('Enter'); await new Promise((r) => setTimeout(r, 1500));
await page.keyboard.press('Enter'); await new Promise((r) => setTimeout(r, 1500));
const readings = [];
for (let i = 0; i < 6; i++) { await page.keyboard.down('ArrowLeft'); await new Promise((r) => setTimeout(r, 1500)); await page.keyboard.up('ArrowLeft'); readings.push(await page.evaluate(() => (document.querySelector('.overlay, #overlay, [data-overlay]') || document.body).innerText.match(/fps:[^\n]*/)?.[0])); }
console.log(readings.join(' | '));
await browser.close();
