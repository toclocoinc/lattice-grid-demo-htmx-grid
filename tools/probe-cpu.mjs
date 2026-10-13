import puppeteer from 'puppeteer-core';
const [url, out] = process.argv.slice(2);
const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage(); await page.setViewport({ width: 1600, height: 900 });
const client = await page.target().createCDPSession();
await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
await page.waitForFunction(() => window.__ready === true, { timeout: 60000 });
await client.send('Profiler.enable'); await client.send('Profiler.setSamplingInterval', { interval: 200 });
await client.send('Profiler.start');
await page.evaluate(() => window.__run());
await page.waitForFunction(() => window.__done === true, { timeout: 60000 });
const { profile } = await client.send('Profiler.stop');
// self time per function
const nodes = new Map(profile.nodes.map((n) => [n.id, n]));
const self = new Map(); const dt = profile.timeDeltas; let total = 0;
for (let i = 0; i < profile.samples.length; i++) { const n = nodes.get(profile.samples[i]); const d = dt[i] || 0; total += d; const f = n.callFrame; const k = `${f.functionName || '(anon)'} ${f.url.split('/').pop()}:${f.lineNumber + 1}`; self.set(k, (self.get(k) || 0) + d); }
const top = [...self.entries()].sort((a, b) => b[1] - a[1]).slice(0, 22);
console.log(`profile ${(total / 1000).toFixed(0)} ms total`);
for (const [k, v] of top) console.log(`${(v / 1000).toFixed(1).padStart(7)} ms  ${(100 * v / total).toFixed(0).padStart(3)}%  ${k}`);
await browser.close();
