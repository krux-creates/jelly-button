// Real-time screencast of a press-and-release, so the wobble is judged as it plays, not from spring values.
// Saves every frame Chrome paints to qa/out/film/ with its timestamp in the name.
//   CHROME_ARGS="--disable-gpu-vsync --disable-frame-rate-limit" node qa/film.mjs
import { launch, sleep } from './chrome.mjs';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
const W = 1280, H = 800, cx = W / 2, cy = H / 2, DIR = 'qa/out/film/';
rmSync(DIR, { recursive: true, force: true }); mkdirSync(DIR, { recursive: true });
const page = await launch({ width: W, height: H });
await page.size(W, H, { dpr: 1 });
await page.goto('/', { settle: 2500 });
const r = await page.run(() => { const b = JellyButton.element.getBoundingClientRect(); return [b.left, b.top, b.width, b.height]; });
const x = r[0] + r[2] * 0.22, y = r[1] + r[3] * 0.5;
await page.move(x, y, { from: [x - 260, y - 160], steps: 12 });
await sleep(700);
const frames = [];
let t0 = 0;
const done = new Promise((resolve) => {
  const onFrame = async (msg) => {
    if (msg.method !== 'Page.screencastFrame') return;
    const { data, sessionId, metadata } = msg.params;
    if (!t0) t0 = metadata.timestamp;
    frames.push([Math.round((metadata.timestamp - t0) * 1000), data]);
    page.send('Page.screencastFrameAck', { sessionId }).catch(() => {});
    if (metadata.timestamp - t0 > 1.6) resolve();
  };
  page.onEvent = onFrame;
});
// the driver only hands unsolicited events to registered handlers; borrow once() in a loop instead
(async () => { for (;;) { const p = await page.once('Page.screencastFrame').catch(() => null); if (!p) break; await page.onEvent({ method: 'Page.screencastFrame', params: p }); if (frames.length && frames.at(-1)[0] > 1600) break; } })();
await page.send('Page.startScreencast', { format: 'png', everyNthFrame: 1 });
await sleep(150);
await page.mouse('mousePressed', x, y);
await sleep(260);
await page.mouse('mouseReleased', x, y);
await Promise.race([done, sleep(4000)]);
await page.send('Page.stopScreencast');
for (const [ms, data] of frames) writeFileSync(`${DIR}${String(ms).padStart(5, '0')}.png`, Buffer.from(data, 'base64'));
console.log('frames', frames.length, 'span ms', frames.at(-1)?.[0], 'mean gap ms', frames.length > 1 ? Math.round(frames.at(-1)[0] / (frames.length - 1)) : null, 'crop', r.map(Math.round));
await page.close();
