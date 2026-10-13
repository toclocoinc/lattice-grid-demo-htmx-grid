import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage(); const log=[]; page.on('pageerror', e => log.push(e.message)); page.on('console', m => log.push(m.text().slice(0,160)));
await page.goto(process.argv[2], { waitUntil: 'networkidle2', timeout: 60000 });
await page.waitForFunction(() => window.__done === true, { timeout: 60000 });
console.log(await page.evaluate(() => window.__out)); if (log.length) console.log('LOG', log.slice(0,5).join(' | '));
await browser.close();
