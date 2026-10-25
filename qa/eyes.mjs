// Eyes only follow a nearby cursor: far away they rest looking straight out; within reach they track it.
import { launch, sleep } from './chrome.mjs';
const W = 1280, H = 800, cx = W / 2, cy = H / 2;
const page = await launch({ width: W, height: H });
await page.size(W, H, { dpr: 2 });
await page.goto('/', { settle: 2500 });
const gaze = () => page.run(() => { const d = window.JellyButton._debug, b = d.btn; return { track: +d.eyes.track.toFixed(2), off: [Math.round(window.JellyButton._debug.eyes.tx - b.cx), Math.round(window.JellyButton._debug.eyes.ty - b.cy)], open: +d.eyes.open.toFixed(2) }; });
const crop = { x: cx - 210, y: cy - 62, width: 420, height: 124 };
for (const [tag, x, y] of [['far-corner', 60, 60], ['far-right', W - 40, cy], ['near-right', cx + 360, cy - 20], ['near-below', cx - 60, cy + 150]]) {
  await page.move(x, y, { steps: 1 });
  await sleep(900);
  console.log(tag, JSON.stringify(await gaze()));
  await page.shot(`qa/out/eyes-${tag}.png`, crop);
}
if (page.errors.length) console.log(page.errors.slice(0, 3));
await page.close();
