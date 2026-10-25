// Both themes side by side in the same states: the jelly at rest per flavour (eye colours), strings reaching, the
// Tune card and the chips. Writes qa/out/th-<theme>-*.png
import { launch, sleep } from './chrome.mjs';
const W = 1280, H = 800;
const page = await launch({ width: W, height: H });
await page.size(W, H, { dpr: 2 });
for (const theme of ['light', 'dark']) {
  for (const f of ['pumpkin', 'slime', 'blood', 'plum']) {
    await page.goto(`/?flavor=${f}&theme=${theme}`, { settle: 2400 });
    const r = await page.run(() => { const b = JellyButton.element.getBoundingClientRect(); return { x: b.left - 40, y: b.top - 30, width: b.width + 80, height: b.height + 60 }; });
    await page.shot(`qa/out/th-${theme}-${f}.png`, r);
  }
  await page.goto(`/?flavor=pumpkin&theme=${theme}`, { settle: 2400 });
  const b = await page.run(() => { const r = JellyButton.element.getBoundingClientRect(); return { l: r.left, t: r.top, w: r.width, h: r.height }; });
  await page.move(b.l + b.w + 40, b.t + b.h + 55, { from: [b.l + b.w + 380, b.t + b.h + 300], steps: 24 });
  await sleep(1500);
  await page.shot(`qa/out/th-${theme}-reach.png`, { x: b.l - 120, y: b.t - 90, width: b.w + 300, height: b.h + 230 });
  await page.move(W / 2, 60, { steps: 1 });
  await page.click('#tuneToggle'); await sleep(400);
  await page.move(W / 2, 60, { steps: 1 }); await sleep(200);
  await page.shot(`qa/out/th-${theme}-page.png`);
  await page.key('Escape');
}
// the chip and D switch themes and remember the choice
await page.goto('/?flavor=pumpkin', { settle: 1500 });
const before = await page.run(() => document.documentElement.dataset.theme);
await page.click('#themeToggle'); await sleep(300);
const after = await page.run(() => ({ theme: document.documentElement.dataset.theme, pressed: document.getElementById('themeToggle').getAttribute('aria-pressed'), saved: localStorage.getItem('jelly-theme') }));
await page.key('d'); await sleep(300);
const afterKey = await page.run(() => document.documentElement.dataset.theme);
console.log('switch', before, '→ chip', JSON.stringify(after), '→ D', afterKey);
console.log('errors', page.errors.slice(0, 2));
await page.close();
