import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage(); await page.setViewport({ width: 1920, height: 1080 });
const log = []; page.on('pageerror', e => log.push(e.message));
await page.goto(process.argv[2], { waitUntil: 'networkidle2', timeout: 60000 });
await page.waitForFunction(() => document.title === 'done', { timeout: 120000 });
console.log((await page.evaluate(() => window.__out)).join('\n')); if (log.length) console.log('ERR', log.join(' | '));
await browser.close();
