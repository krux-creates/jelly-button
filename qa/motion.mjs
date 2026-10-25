// Press-and-release bounce as a frame strip, plus the frame rate. Writes qa/out/bounce-N.png and logs springs.
import { launch, sleep } from './chrome.mjs';
const W = 1280, H = 800, cx = W / 2, cy = H / 2;
const page = await launch({ width: W, height: H });
await page.size(W, H, { dpr: 2 });
await page.goto('/', { settle: 3000 });
const fps = await page.run(() => new Promise((res) => { let n = 0; const t0 = performance.now(); const f = () => { n++; if (performance.now() - t0 < 2000) requestAnimationFrame(f); else res(Math.round(n / ((performance.now() - t0) / 1000))); }; requestAnimationFrame(f); }));
console.log('fps idle', fps);
const x = cx - 120, y = cy - 10;
await page.move(x, y, { from: [cx - 400, cy - 200], steps: 12 });
await sleep(600);
await page.mouse('mousePressed', x, y);
await sleep(300);
await page.mouse('mouseReleased', x, y);
for (let i = 0; i < 8; i++) {
  const st = await page.run(() => { const d = window.JellyButton._debug; return [d.btn.press, d.jig.ax, d.jig.ay].map((v) => +v.toFixed(2)); });
  console.log('t', i * 80, 'press,ax,ay', st);
  await page.shot(`qa/out/bounce-${i}.png`, { x: cx - 210, y: cy - 62, width: 420, height: 124 });
  await sleep(50);
}
const fps2 = await page.run(() => new Promise((res) => { let n = 0; const t0 = performance.now(); const f = () => { n++; if (performance.now() - t0 < 2000) requestAnimationFrame(f); else res(Math.round(n / ((performance.now() - t0) / 1000))); }; requestAnimationFrame(f); }));
console.log('fps hovering', fps2, 'quality', await page.run(() => document.querySelector('canvas').width));
if (page.errors.length) console.log(page.errors.slice(0, 3));
await page.close();
