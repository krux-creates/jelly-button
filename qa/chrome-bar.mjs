// The bottom bar: flavour chips and the Tune chip side by side, closed and open, measured for matching size.
import { launch, sleep } from './chrome.mjs';
const W = 1280, H = 800;
const page = await launch({ width: W, height: H });
await page.size(W, H, { dpr: 2 });
await page.goto('/', { settle: 2000 });
const m = await page.run(() => {
  const box = (el) => { const r = el.getBoundingClientRect(), cs = getComputedStyle(el); return { h: Math.round(r.height), pad: cs.padding, font: cs.fontSize, gap: cs.gap, bottom: Math.round(innerHeight - r.bottom) }; };
  return { chip: box(document.querySelector('[data-flavor="slime"]')), tune: box(document.getElementById('tuneToggle')),
    icon: Math.round(document.querySelector('#tuneToggle svg').getBoundingClientRect().width), bead: Math.round(document.querySelector('.flavors i').getBoundingClientRect().width) };
});
console.log(JSON.stringify(m));
await page.shot('qa/out/bar-left.png', { x: 0, y: H - 50, width: 360, height: 50 });
await page.shot('qa/out/bar-right.png', { x: W - 200, y: H - 50, width: 200, height: 50 });
await page.click('#tuneToggle'); await sleep(300);
await page.move(W / 2, H / 2 - 300, { steps: 1 }); await sleep(200);
await page.shot('qa/out/bar-right-open.png', { x: W - 200, y: H - 50, width: 200, height: 50 });
console.log('errors', page.errors.slice(0, 2));
await page.close();
