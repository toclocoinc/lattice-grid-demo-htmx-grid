// Real-Chrome check of the five steps: built on load, an edit posted with hx-post,
// a sort, a team swap, Back, and no console errors or [lattice] warnings.
//   npm run serve                    (in another terminal)
//   CHROME=/usr/bin/google-chrome node tools/verify.mjs [http://localhost:8000/lattice-grid-demo-htmx-grid/ [width height]]
import puppeteer from 'puppeteer-core';

const url = process.argv[2] || 'http://localhost:8000/lattice-grid-demo-htmx-grid/';
const [width, height] = [Number(process.argv[3] || 1440), Number(process.argv[4] || 900)];
const sleep = (ms) => new Promise((r) => { setTimeout(r, ms); });
const browser = await puppeteer.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] });
let failed = 0;
const check = (ok, what) => { if (!ok) failed += 1; console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}`); };
// The grid draws only the rows in view, so read the refs of the rows it has drawn.
const text = () => [...document.querySelectorAll('#grid-view [role=row]')].map((r) => r.textContent).join('|');
const refs = () => [...document.querySelectorAll('#grid-view [role=row]')].map((r) => r.textContent.slice(0, 5)).filter((t) => /^T-\d+$/.test(t)).join(',');

try {
  const page = await browser.newPage();
  await page.setViewport({ width, height });
  const problems = [];
  page.on('console', (m) => { if (m.type() === 'error' || m.text().includes('[lattice]')) problems.push(m.text()); });
  page.on('pageerror', (e) => problems.push(e.message));
  await page.goto(url);
  await page.waitForFunction(() => document.querySelectorAll('#grid-view [role=row]').length > 3, { timeout: 30000 });
  await sleep(1000);
  const fill = await page.evaluate(() => { const h = { width: document.querySelector('#tasks').clientWidth }; const c = [...document.querySelectorAll('#grid-view [role=columnheader]')].map((e) => e.getBoundingClientRect()); return { host: h.width, cols: Math.max(...c.map((r) => r.right)) - Math.min(...c.map((r) => r.left)) }; });
  check(Math.abs(fill.host - fill.cols) <= 4, `grid fills the host (host ${fill.host}px, columns ${fill.cols}px)`);
  check((await page.evaluate(text)).includes('Audit the checkout funnel'), 'built on load from the server task table');
  check(await page.evaluate(() => !document.querySelector('#grid-view table')), 'the table was replaced by the grid');

  const cell = await page.evaluateHandle(() => [...document.querySelectorAll('#grid-view [role=gridcell]')].find((c) => c.textContent === 'Audit the checkout funnel'));
  await cell.asElement().click({ count: 2 });
  await sleep(300);
  await page.keyboard.down('Control'); await page.keyboard.press('KeyA'); await page.keyboard.up('Control');
  await page.keyboard.type('Audit the checkout and cart funnel');
  await page.keyboard.press('Enter');
  await sleep(1200);
  if (process.env.SHOTS) await page.screenshot({ path: `${process.env.SHOTS}-${width}-edit.png` });
  check((await page.$eval('#save-log', (e) => e.textContent)).includes('T-101'), 'edit: the server confirmed the saved cell');

  await page.evaluate(() => [...document.querySelectorAll('#grid-view [role=columnheader]')].find((h) => h.textContent.includes('Points')).click());
  await sleep(500);
  const sorted = await page.evaluate(refs);
  check(sorted.startsWith('T-107,T-111'), `sort: Points ascending (${sorted.slice(0, 40)})`);
  await page.click('button[hx-get*="team=Platform"]');
  await sleep(1500);
  const platform = await page.evaluate(refs);
  check(platform.includes('T-2') && !platform.includes('T-1'), `swap: the other team is built (${platform.slice(0, 40)})`);
  check(new URL(page.url()).pathname === new URL(url).pathname && page.url().includes('team=Platform'), `swap: history URL is the full page path (${page.url()})`);
  await page.goBack();
  await sleep(2000);
  const back = await page.evaluate(refs);
  check(await page.evaluate(() => document.querySelectorAll('#grid-view [role=grid]').length) === 1, 'Back: the grid is drawn once');
  check(back === sorted, 'Back: the earlier view and its sort return');
  await page.goForward();
  await sleep(2000);
  const fwd = await page.evaluate(refs);
  check(fwd === platform && page.url().includes('team=Platform'), 'Forward: the team swap returns');
  check(problems.length === 0, `no console errors or [lattice] warnings ${problems.join(' / ')}`);
} finally {
  await browser.close();
}
process.exit(failed ? 1 : 0);
