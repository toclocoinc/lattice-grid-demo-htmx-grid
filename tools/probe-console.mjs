import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage(); await page.setViewport({ width: 1600, height: 900 });
const logs = []; page.on('console', (m) => { const t = m.text(); if (t.startsWith('[trace]')) logs.push(t.slice(0, 300)); });
await page.goto(process.argv[2], { waitUntil: 'networkidle2', timeout: 60000 });
await page.waitForFunction(() => document.title === 'done', { timeout: 120000 });
console.log(logs.join('\n')); await browser.close();
