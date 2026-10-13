import puppeteer from 'puppeteer-core';
const url = process.argv[2];
const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] });
for (const [w, h] of [[1440, 800], [1280, 700], [1920, 1080]]) {
  const page = await browser.newPage(); await page.setViewport({ width: w, height: h });
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  const btn = await page.$('button'); if (btn) await btn.click();
  await new Promise((r) => setTimeout(r, 4000));
  const m = await page.evaluate(() => {
    const host = document.getElementById('grid'); const body = host.querySelector('.lat-body-viewport') || host.querySelector('.lat-body');
    const cell = host.querySelector('.lat-cell'); const row = host.querySelector('.lat-row');
    const r = (e) => e ? { w: Math.round(e.getBoundingClientRect().width), h: Math.round(e.getBoundingClientRect().height), sw: e.scrollWidth, sh: e.scrollHeight } : null;
    return { doc: { sw: document.documentElement.scrollWidth, sh: document.documentElement.scrollHeight, vw: innerWidth, vh: innerHeight }, host: r(host), body: r(body), cell: r(cell), row: r(row), cols: host.querySelectorAll('.lat-row')[0]?.querySelectorAll('.lat-cell').length, rows: host.querySelectorAll('.lat-row').length };
  });
  console.log(`${w}x${h}`, JSON.stringify(m));
  await page.close();
}
await browser.close();
