import puppeteer from 'puppeteer-core';
const url = process.argv[2];
const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080 });
const log = [];
page.on('console', (m) => log.push(`[${m.type()}] ${m.text().slice(0, 160)}`));
page.on('pageerror', (e) => log.push(`[pageerror] ${e.message}`));
await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
// click a run/start button if present, then wait for results
const btn = await page.$('button');
if (btn) await btn.click();
await new Promise((r) => setTimeout(r, 45000));
const text = await page.evaluate(() => document.body.innerText.replace(/\n{2,}/g, '\n').slice(0, 1500));
console.log(text);
console.log(log.slice(0, 12).join('\n'));
await browser.close();
