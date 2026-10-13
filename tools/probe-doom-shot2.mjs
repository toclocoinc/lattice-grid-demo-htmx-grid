import puppeteer from 'puppeteer-core';
const [url, res, paint, out] = process.argv.slice(2);
const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage(); await page.setViewport({ width: 1600, height: 900 });
await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
const start = await page.$('button#start'); if (start) await start.click();
await new Promise((r) => setTimeout(r, 5000));
if (res) { await page.click(`[data-res="${res}"]`); await new Promise((r) => setTimeout(r, 3000)); }
if (paint) { await page.click(`[data-paint="${paint}"]`); await new Promise((r) => setTimeout(r, 3000)); }
await page.keyboard.press('Enter'); await new Promise((r) => setTimeout(r, 1500)); await page.keyboard.press('Enter'); await new Promise((r) => setTimeout(r, 2500));
await page.keyboard.down('ArrowLeft'); await new Promise((r) => setTimeout(r, 1200)); await page.keyboard.up('ArrowLeft'); await new Promise((r) => setTimeout(r, 300));
await page.screenshot({ path: out });
console.log(await page.evaluate(() => document.getElementById('overlay').textContent));
await browser.close();
