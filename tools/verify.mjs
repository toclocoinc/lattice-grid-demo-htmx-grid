// Real-Chrome check of the six steps: built on load, an edit posted with hx-post,
// an out-of-band row update, a sort, a team swap, Back, and no console errors or [lattice] warnings.
//   npm run serve                    (in another terminal)
//   CHROME=/usr/bin/google-chrome node tools/verify.mjs [http://localhost:8000/lattice-grid-demo-htmx-grid/ [width height]]
import puppeteer from 'puppeteer-core';

const url = process.argv[2] || 'http://localhost:8000/lattice-grid-demo-htmx-grid/';
const [width, height] = [Number(process.argv[3] || 1440), Number(process.argv[4] || 900)];
const sleep = (ms) => new Promise((r) => { setTimeout(r, ms); });
const browser = await puppeteer.launch({ executablePath: process.env.CHROME || (process.platform === 'darwin' ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : '/usr/bin/google-chrome'), headless: true, args: ['--no-sandbox'] });
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
  if (process.env.SHOTS) await page.screenshot({ path: `${process.env.SHOTS}-${width}-full.png`, fullPage: true });
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

  // Long titles: the cell clips the text, and the full text stays in the accessible name.
  const long = await page.evaluate(() => {
    const full = 'Fix the sign-up drop-off on mobile Safari when the password manager fills the form';
    const c = [...document.querySelectorAll('#grid-view [role=gridcell]')].find((e) => e.textContent === full);
    const t = c.querySelector('.lat-cell-text');
    const cs = getComputedStyle(t);
    return { full, clipped: t.scrollWidth > t.clientWidth, textOverflow: cs.textOverflow, overflow: cs.overflow, whiteSpace: cs.whiteSpace, title: c.getAttribute('title') };
  });
  check(long.clipped && long.textOverflow === 'ellipsis' && long.overflow === 'hidden' && long.whiteSpace === 'nowrap', `long title: text element overflows and draws an ellipsis (${JSON.stringify(long)})`);
  const snap = await page.accessibility.snapshot({ interestingOnly: false });
  const named = (n) => (n.role === 'gridcell' && n.name === long.full) || (n.children || []).some(named);
  check(named(snap), 'long title: the full text is the cell accessible name');
  // The cell's full value must also be in its title attribute (tooltip).
  check(long.title === long.full, `long title: title attribute carries the full value (${long.title})`);

  // Out-of-band: one row (the sixth of the view) is patched by value, nothing else changes.
  await page.evaluate(() => { document.querySelector('#grid-view [role=grid]').dataset.probe = 'same'; });
  await page.click('button.action');
  await sleep(1200);
  const row6 = await page.evaluate(() => [...document.querySelectorAll('#grid-view [role=row]')].find((r) => r.textContent.startsWith('T-106'))?.textContent);
  if (process.env.SHOTS) await page.screenshot({ path: `${process.env.SHOTS}-${width}-oob.png` });
  check(row6 === 'T-106Segment the trial usersAna LopezGrowthTodo3', `out of band: row 6 patched by value (${row6})`);
  const other = await page.evaluate(() => [...document.querySelectorAll('#grid-view [role=row]')].find((r) => r.textContent.startsWith('T-105'))?.textContent);
  check(other === 'T-105Landing page for the webinarEva LindqvistGrowthTodo8', `out of band: another row untouched (${other})`);
  const stray = await page.evaluate(() => {
    const w = document.createTreeWalker(document.querySelector('#grid-view'), NodeFilter.SHOW_TEXT);
    const out = [];
    for (let n = w.nextNode(); n; n = w.nextNode()) if (n.textContent.trim() && !n.parentElement.closest('[role=grid]') && !n.parentElement.closest('.filters')) out.push(n.textContent.trim());
    return out;
  });
  check(stray.length === 0, `out of band: no stray text under the grid (${stray.join(' / ')})`);
  check(await page.evaluate(() => document.querySelectorAll('#grid-view [role=grid][data-probe=same]').length === 1), 'out of band: the same grid is kept, not rebuilt');
  check((await page.$eval('#request-log', (e) => e.textContent)).includes('GET /htmx-demo/grid/teammate → 200'), 'out of band: the request log shows the request');

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

  // The URL's own filter: opened fresh or reloaded, the page shows that team, built once, with its button pressed.
  const base = new URL(url).origin + new URL(url).pathname;
  const state = () => page2.evaluate(() => ({
    pressed: [...document.querySelectorAll('#grid-view .filters button[aria-pressed=true]')].map((b) => b.textContent),
    grids: document.querySelectorAll('#grid-view [role=grid]').length,
    tables: document.querySelectorAll('#grid-view table').length,
    teams: [...new Set([...document.querySelectorAll('#grid-view [role=row]')].map((r) => r.textContent).filter((t) => /^T-\d+/.test(t)).map((t) => t.match(/(Growth|Platform|Design|Support)/)?.[1]))].sort().join(','),
  }));
  const settle = async () => { await page2.waitForFunction(() => document.querySelectorAll('#grid-view [role=row]').length > 3, { timeout: 30000 }); await sleep(1500); };
  const expect = async (want, what) => {
    const s = await state();
    check(s.pressed.length === 1 && s.pressed[0] === (want || 'All teams') && s.grids === 1 && s.tables === 0 && (want ? s.teams === want : s.teams.split(',').length >= 2), `${what}: ${want || 'All teams'} pressed and built (${JSON.stringify(s)})`);
  };
  const page2 = await browser.newPage();
  await page2.setViewport({ width, height });
  const problems2 = [];
  page2.on('console', (m) => { if (m.type() === 'error' || m.text().includes('[lattice]')) problems2.push(m.text()); });
  page2.on('pageerror', (e) => problems2.push(e.message));
  await page2.goto(base); await settle();
  await expect('', 'open bare URL');
  for (const t of ['Growth', 'Platform', 'Design', 'Support']) {
    await page2.goto(`${base}?team=${t}`); await settle();
    await expect(t, `open ?team=${t}`);
    await page2.reload(); await settle();
    await expect(t, `reload ?team=${t}`);
  }
  await page2.goto(base); await settle();
  await page2.click('button[hx-get*="team=Design"]'); await sleep(1500);
  await page2.reload(); await settle();
  check(page2.url().includes('team=Design'), `click then Refresh keeps the URL (${page2.url()})`);
  await expect('Design', 'click then Refresh');
  await page2.goBack(); await sleep(2500);
  check(!page2.url().includes('team=Design'), `Back after Refresh leaves the Design URL (${page2.url()})`);
  await expect('', 'Back after Refresh');
  // htmx must start on a fast cached load: after a Growth click, 10 plain reloads (cache kept) all build it.
  await page2.goto(base); await settle();
  await page2.click('button[hx-get*="team=Growth"]'); await sleep(1500);
  let built = 0;
  for (let i = 1; i <= 10; i += 1) {
    await page2.reload();
    try { await page2.waitForFunction(() => [...document.querySelectorAll('#grid-view [role=row]')].some((r) => /^T-\d+/.test(r.textContent)), { timeout: 8000 }); } catch { /* counted below */ }
    const s = await state();
    if (process.env.DEBUG_RELOAD) console.log(i, JSON.stringify(s), page2.url());
    if (s.pressed.length === 1 && s.pressed[0] === 'Growth' && s.grids === 1 && s.tables === 0 && s.teams === 'Growth') built += 1;
  }
  check(built === 10, `10 cached reloads after a Growth click: ${built}/10 built with Growth pressed`);
  await page2.goto(page2.url()); await settle();
  await expect('Growth', 'navigate to the same URL again');
  await page2.reload(); await settle();
  await expect('Growth', 'reload after navigating again');
  check(problems2.length === 0, `reload checks: no console errors or [lattice] warnings ${problems2.join(' / ')}`);
} finally {
  await browser.close();
}
process.exit(failed ? 1 : 0);
