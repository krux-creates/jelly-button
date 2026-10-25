// Uncapped frame rate (vsync and the frame limit off) for the jelly and the original Venom button, before the
// page's adaptive resolution can kick in. Run: CHROME_ARGS="--disable-gpu-vsync --disable-frame-rate-limit" node qa/perf.mjs
import { launch, sleep } from './chrome.mjs';
const W = +(process.env.W || 1440), H = +(process.env.H || 900);
const page = await launch({ width: W, height: H });
await page.size(W, H, { dpr: 2 });
const fps = () => page.run(() => new Promise((res) => { let n = 0; const t0 = performance.now(); const f = () => { n++; if (performance.now() - t0 < 1200) requestAnimationFrame(f); else res(Math.round(n / ((performance.now() - t0) / 1000))); }; requestAnimationFrame(f); }));
for (const [name, path] of [['venom original', '/qa/ref/venom.html'], ['jelly', '/']]) {
  await page.goto(path, { settle: 600 });
  const idle = await fps();
  // with the cursor near: tendrils, wraps and the hand in the scene
  await page.move(W / 2 + 230, H / 2 + 120, { from: [W / 2 + 500, H / 2 + 300], steps: 8 });
  await sleep(300);
  const busy = await fps();
  console.log(name.padEnd(15), 'idle', idle, 'fps   cursor near', busy, 'fps');
  await page.move(20, 20, { steps: 1 });
}
await page.close();
