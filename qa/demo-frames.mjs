// Play media/demo.mp4 in real time and capture frames at a few moments (the dev server has no range requests, so
// seeking does not work) → qa/out/demo-<s>.png
import { launch, sleep } from './chrome.mjs';
const page = await launch({ width: 960, height: 540 });
await page.goto('/media/demo.mp4', { settle: 1200 });
await page.run(() => { const v = document.querySelector('video'); v.muted = true; v.controls = false; return v.play(); });
const t0 = Date.now();
for (const t of [0.8, 3.6, 6.2, 9.0, 12.0, 15.5, 19.5]) {
  await sleep(Math.max(0, t * 1000 - (Date.now() - t0)));
  console.log('at', t, 'video time', await page.run(() => document.querySelector('video').currentTime.toFixed(2)));
  await page.shot(`qa/out/demo-${String(t).replace('.', '_')}.png`);
}
await page.close();
