import puppeteer from 'puppeteer-core';
const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage(); await page.goto(process.argv[2], { waitUntil: 'networkidle2', timeout: 60000 });
await new Promise(r => setTimeout(r, 1500));
console.log(await page.evaluate(() => { const c = document.querySelectorAll('.lat-cell'); return `cells ${c.length} | first: ${c[0]?.outerHTML.slice(0, 300)} | row: ${c[0]?.parentElement.outerHTML.slice(0, 200)}`; }));
await browser.close();
