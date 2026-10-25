// Label legibility for every flavour, in both themes, at two sizes: the desktop auto scale and 1x (phones, small windows), where
// strokes are thinnest. Saves the button alone to qa/out/leg-<flavour>-<scale>.png; qa/contrast.py measures them.
//   TAG=-before node qa/legibility.mjs && python3 qa/contrast.py
import { launch, sleep } from './chrome.mjs';
const W = 1280, H = 800, TAG = process.env.TAG || '';
const page = await launch({ width: W, height: H });
await page.size(W, H, { dpr: 2 });
for (const theme of ['light', 'dark']) {
  for (const scale of ['auto', '1']) {
    for (const f of ['pumpkin', 'slime', 'blood', 'plum']) {
      await page.goto(`/?flavor=${f}&theme=${theme}${scale === '1' ? '&scale=1' : ''}`, { settle: 2600 });
      const r = await page.run(() => { const b = JellyButton.element.getBoundingClientRect(); return { x: b.left, y: b.top, width: b.width, height: b.height }; });
      await page.shot(`qa/out/leg-${theme}-${f}-${scale}${TAG}.png`, r);
    }
  }
  await page.shot(`qa/out/theme-${theme}${TAG}.png`);
}
if (page.errors.length) console.log(page.errors.slice(0, 2));
await page.close();
