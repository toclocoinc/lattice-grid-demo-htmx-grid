import puppeteer from 'puppeteer-core';
const [url, res, paint] = process.argv.slice(2);
const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage(); await page.setViewport({ width: 1440, height: 800 });
await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
const btn = await page.$('button'); if (btn) await btn.click();
await new Promise((r) => setTimeout(r, 5000));
if (res) { await page.click(`[data-res="${res}"]`); await new Promise((r) => setTimeout(r, 3000)); }
if (paint) { await page.click(`[data-paint="${paint}"]`); await new Promise((r) => setTimeout(r, 3000)); }
await page.keyboard.press('Enter'); await new Promise((r) => setTimeout(r, 1500)); await page.keyboard.press('Enter'); await new Promise((r) => setTimeout(r, 2000));
await page.evaluate(() => { Object.assign(window.__stats, { frames: 0, pipeMs: 0, applyMs: 0, gapMs: 0, lastEnd: 0 }); });
await page.keyboard.down('ArrowLeft'); await new Promise((r) => setTimeout(r, 8000)); await page.keyboard.up('ArrowLeft');
const s = await page.evaluate(() => window.__stats);
const f = s.frames || 1;
console.log(`${res || 'default'}: ${s.frames} frames in 8 s = ${(s.frames / 8).toFixed(1)} fps; per frame: pipeline ${(s.pipeMs / f).toFixed(1)} ms, grid apply ${(s.applyMs / f).toFixed(1)} ms, everything else (engine + browser) ${(s.gapMs / f).toFixed(1)} ms`);
await browser.close();
