// The rendered cursor and its shadow, 3x close-ups: out in the open, approaching the jelly, over it, and caught.
//   TAG=-before node qa/cursor.mjs
import { launch, sleep } from './chrome.mjs';
const W = 1280, H = 800, TAG = process.env.TAG || '';
const page = await launch({ width: W, height: H });
await page.size(W, H, { dpr: 3 });
await page.goto('/', { settle: 2500 });
const r = await page.run(() => { const b = JellyButton.element.getBoundingClientRect(); return { l: b.left, t: b.top, w: b.width, h: b.height }; });
const spots = [
  ['open', 240, 180],
  ['approach', r.l + r.w + 120, r.t + r.h + 70],
  ['over', r.l + r.w * 0.5, r.t + r.h * 0.45],
  ['caught', r.l + r.w + 40, r.t + r.h + 45],
];
let last = [W - 60, H - 60];
for (const [tag, x, y] of spots) {
  await page.move(x, y, { from: last, steps: 14 });
  last = [x, y];
  await sleep(tag === 'caught' ? 1500 : 900);
  const st = await page.run(() => { const d = JellyButton._debug; return { handOn: d.hand.on, morph: +d.hand.m.toFixed(2) }; });
  console.log(tag, JSON.stringify(st));
  await page.shot(`qa/out/cursor-${tag}${TAG}.png`, { x: x - 70, y: y - 50, width: 170, height: 140 });
}
if (page.errors.length) console.log(page.errors.slice(0, 3));
await page.close();
