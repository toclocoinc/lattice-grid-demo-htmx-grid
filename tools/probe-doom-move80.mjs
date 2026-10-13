import puppeteer from 'puppeteer-core';
const url = process.argv[2];
const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage(); await page.setViewport({ width: 1440, height: 800 });
await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
const btn = await page.$('button'); if (btn) await btn.click();
await new Promise((r) => setTimeout(r, 5000));
await page.click('[data-res="80x50"]'); await new Promise((r) => setTimeout(r, 2000));
await page.keyboard.press('Enter'); await new Promise((r) => setTimeout(r, 1500)); await page.keyboard.press('Enter'); await new Promise((r) => setTimeout(r, 2000));
const readings = [];
for (let i = 0; i < 8; i++) { await page.keyboard.down('ArrowLeft'); await new Promise((r) => setTimeout(r, 1500)); await page.keyboard.up('ArrowLeft'); readings.push(await page.evaluate(() => document.getElementById('overlay').innerText)); }
console.log(readings.join(' | '));
await browser.close();
