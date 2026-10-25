// Strings out, every flavour, both themes: the jelly reaching for the pointer. Writes qa/out/str-<theme>-<flavour>.png
import { launch, sleep } from './chrome.mjs';
const W = 1280, H = 800;
const page = await launch({ width: W, height: H });
await page.size(W, H, { dpr: 2 });
for (const theme of ['light', 'dark']) for (const f of ['pumpkin', 'slime', 'blood', 'plum']) {
  await page.goto(`/?flavor=${f}&theme=${theme}`, { settle: 2200 });
  const b = await page.run(() => { const r = JellyButton.element.getBoundingClientRect(); return { l: r.left, t: r.top, w: r.width, h: r.height }; });
  await page.move(b.l + b.w * 0.55, b.t + b.h + 110, { from: [b.l + b.w * 0.55 + 200, b.t + b.h + 360], steps: 20 });
  await sleep(1400);
  await page.shot(`qa/out/str-${theme}-${f}.png`, { x: b.l + b.w * 0.55 - 160, y: b.t - 10, width: 320, height: b.h + 170 });
  await page.move(20, 20, { steps: 1 });
}
if (page.errors.length) console.log(page.errors.slice(0, 2));
await page.close();
