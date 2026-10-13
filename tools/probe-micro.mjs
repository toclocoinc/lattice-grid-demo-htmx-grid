import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage(); await page.setViewport({ width: 1920, height: 1080 });
const log = []; page.on('pageerror', (e) => log.push(e.message)); page.on('console', (m) => { if (m.type() === 'error') log.push(m.text().slice(0, 160)); });
await page.goto(process.argv[2], { waitUntil: 'networkidle2', timeout: 60000 });
await page.waitForFunction(() => document.title === 'done', { timeout: 180000 });
console.log((await page.evaluate(() => window.__out)).join('\n')); console.log(log.join('\n') || '(no errors)');
await browser.close();
