// Venom (original, qa/ref/venom.html at the same scale) and Jelly in identical states: rest, strings reaching,
// pressed, and a 3x close-up. Writes qa/out/cmp-<state>-<venom|jelly>.png
import { launch, sleep } from './chrome.mjs';
const W = 1280, H = 800;
const pages = [['venom', '/qa/ref/venom.html?scale=1.4'], ['jelly', '/']];
for (const [name, url] of pages) {
  const page = await launch({ width: W, height: H });
  await page.size(W, H, { dpr: 2 });
  await page.goto(url, { settle: 2600 });
  const r = await page.run(() => { const b = document.querySelector('.venom, .jelly').getBoundingClientRect(); return { l: b.left, t: b.top, w: b.width, h: b.height }; });
  const cx = r.l + r.w / 2, cy = r.t + r.h / 2;
  const frame = { x: cx - 330, y: cy - 150, width: 660, height: 330 };
  console.log(name, 'button', Math.round(r.w), 'x', Math.round(r.h));
  await page.shot(`qa/out/cmp-rest-${name}.png`, frame);
  // strings reach from the lower right and wrap the pointer
  await page.move(r.l + r.w + 40, r.t + r.h + 55, { from: [r.l + r.w + 380, r.t + r.h + 300], steps: 24 });
  await sleep(1500);
  await page.shot(`qa/out/cmp-reach-${name}.png`, frame);
  // hover over the left third, then press and hold
  await page.move(r.l + r.w * 0.3, cy, { from: [r.l + r.w + 40, r.t + r.h + 55], steps: 20 });
  await sleep(700);
  await page.mouse('mousePressed', r.l + r.w * 0.3, cy);
  await sleep(250);
  await page.shot(`qa/out/cmp-press-${name}.png`, frame);
  await page.mouse('mouseReleased', r.l + r.w * 0.3, cy);
  await page.move(40, 40, { steps: 1 });
  await sleep(1500);
  await page.size(W, H, { dpr: 3 });
  await sleep(500);
  await page.shot(`qa/out/cmp-close-${name}.png`, { x: r.l - 12, y: r.t - 12, width: r.w + 24, height: r.h + 24 });
  console.log(name, 'errors', page.errors.slice(0, 2));
  await page.close();
}
