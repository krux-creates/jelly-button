// 3x close-ups for polishing: the right end at rest, and the whole jelly under a strong pull.
//   TAG=-before node qa/close.mjs
import { launch, sleep } from './chrome.mjs';
const W = 1280, H = 800, cx = W / 2, cy = H / 2, TAG = process.env.TAG || '';
const page = await launch({ width: W, height: H });
await page.size(W, H, { dpr: 3 });
await page.goto('/', { settle: 3000 });
const r = await page.run(() => { const b = window.JellyButton.element.getBoundingClientRect(); return { l: b.left, t: b.top, w: b.width, h: b.height }; });
await page.shot(`qa/out/close-end${TAG}.png`, { x: r.l + r.w - 110, y: r.t - 14, width: 130, height: r.h + 28 });
await page.shot(`qa/out/close-all${TAG}.png`, { x: r.l - 14, y: r.t - 14, width: r.w + 28, height: r.h + 28 });
// strong pull: park beside the lower right, let the strings latch, then drag away slowly
await page.move(cx + 200, cy + 110, { from: [cx + 520, cy + 330], steps: 20 });
await sleep(1500);
// drag away in small hops, a frame at each, so one of them catches the strings at full stretch
for (let i = 1; i <= 5; i++) {
  await page.move(cx + 200 + i * 14, cy + 110 + i * 10, { from: [cx + 200 + (i - 1) * 14, cy + 110 + (i - 1) * 10], steps: 6, ms: 25 });
  const n = await page.run(() => window.JellyButton._debug.strands.filter((s) => s.state === 'attached').length);
  await page.shot(`qa/out/close-pull${i}${TAG}.png`, { x: r.l - 14, y: r.t - 14, width: r.w + 160, height: r.h + 170 });
  console.log('pull frame', i, 'attached strings', n);
}
if (page.errors.length) console.log(page.errors.slice(0, 3));
await page.close();
