import puppeteer from 'puppeteer-core';
const [url, out] = process.argv.slice(2);
const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage(); await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 2 });
const log = []; page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning' || m.text().includes('[lattice]')) log.push(m.text().slice(0, 160)); }); page.on('pageerror', (e) => log.push('pageerror ' + e.message));
await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 }); await new Promise((r) => setTimeout(r, 1500));
await page.screenshot({ path: out }); console.log('svg count', await page.evaluate(() => document.querySelectorAll('#g svg').length)); console.log(log.join(' | ') || 'console clean');
await browser.close();
