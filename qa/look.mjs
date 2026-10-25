// Visual walkthrough in headless Chrome (real time, real mouse). Saves PNGs to qa/out/.
//   node qa/look.mjs [scenario ...]      scenarios: idle reach hover press flavors mobile
//   env: W, H (viewport), DPR (capture scale), FLAVOR, TAG (file suffix)
import { launch, sleep } from './chrome.mjs';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const OUT = fileURLToPath(new URL('./out/', import.meta.url));
mkdirSync(OUT, { recursive: true });
const want = new Set(process.argv.slice(2));
const on = (k) => !want.size || want.has(k);
const W = +(process.env.W || 1280), H = +(process.env.H || 800), DPR = +(process.env.DPR || 2);
const TAG = process.env.TAG || '';
const page = await launch({ width: W, height: H });
await page.size(W, H, { dpr: DPR });
const cx = W / 2, cy = H / 2;
// a close crop around the jelly and its plate
const crop = { x: cx - 260, y: cy - 150, width: 520, height: 300 };
const state = () => page.run(() => {
  const d = window.JellyButton?._debug;
  return d && { flavor: window.JellyButton.flavor, strands: d.strands.length, ax: +d.jig.ax.toFixed(3), ay: +d.jig.ay.toFixed(3), glow: +d.glow.v.toFixed(2), press: +d.btn.press.toFixed(2), hand: d.hand.on };
});
try {
  await page.goto(`/${process.env.FLAVOR ? `?flavor=${process.env.FLAVOR}` : ''}`, { settle: 3200 });
  console.log('start', await state());
  if (on('idle')) { await page.shot(`${OUT}idle${TAG}.png`); await page.shot(`${OUT}idle-crop${TAG}.png`, crop); }
  if (on('zoom')) {
    // close-ups: the jelly alone, then with the cursor just off its right end so the eyes look at it
    await page.shot(`${OUT}zoom${TAG}.png`, { x: cx - 210, y: cy - 62, width: 420, height: 124 });
    await page.move(cx + 330, cy - 10, { from: [cx + 500, cy - 10], steps: 10 });
    await sleep(700);
    await page.shot(`${OUT}zoom-look${TAG}.png`, { x: cx - 210, y: cy - 62, width: 420, height: 124 });
    await page.move(cx + 700, cy + 380, { steps: 1 });
    await sleep(800);
  }
  if (on('reach')) {
    // come in from the lower right, stop just off the edge so tendrils reach and wrap the hand
    await page.move(cx + 150, cy + 95, { from: [cx + 420, cy + 300], steps: 30 });
    await sleep(1400);
    console.log('reach', await state());
    await page.shot(`${OUT}reach${TAG}.png`, { x: cx - 260, y: cy - 150, width: 560, height: 330 });
    // pull away slowly: the strands stretch, then snap
    await page.move(cx + 260, cy + 200, { from: [cx + 150, cy + 95], steps: 40, ms: 20 });
    await sleep(120);
    await page.shot(`${OUT}stretch${TAG}.png`, { x: cx - 260, y: cy - 150, width: 620, height: 400 });
    await page.move(cx + 520, cy + 330, { from: [cx + 260, cy + 200], steps: 10 });
    await sleep(900);
  }
  if (on('hover')) {
    await page.move(cx + 20, cy + 4, { from: [cx + 300, cy + 200], steps: 25 });
    await sleep(500);
    console.log('hover', await state());
    await page.shot(`${OUT}hover${TAG}.png`, crop);
  }
  if (on('press')) {
    await page.move(cx - 30, cy, { from: [cx + 20, cy + 4], steps: 6 });
    await page.mouse('mousePressed', cx - 30, cy);
    await sleep(220);
    await page.shot(`${OUT}press-down${TAG}.png`, crop);
    await page.mouse('mouseReleased', cx - 30, cy);
    await sleep(110);
    console.log('release', await state());
    await page.shot(`${OUT}press-bounce${TAG}.png`, crop);
    await sleep(1500);
  }
  if (on('flavors')) {
    await page.move(40, H - 40, { steps: 1 });
    await sleep(1500);
    for (const f of ['pumpkin', 'slime', 'blood', 'plum']) {
      await page.run((f) => window.JellyButton.setFlavor(f), f);
      await sleep(1600);
      await page.shot(`${OUT}flavor-${f}${TAG}.png`, crop);
    }
    await page.shot(`${OUT}flavor-full${TAG}.png`);
  }
  if (on('mobile')) { await page.size(390, 844, { touch: true, dpr: 2 }); await sleep(1500); await page.shot(`${OUT}mobile${TAG}.png`); }
  console.log('end', await state());
} catch (e) {
  console.error('FAILED', e.message);
  await page.shot(`${OUT}failure.png`).catch(() => {});
} finally {
  if (page.errors.length) console.log('page errors', [...new Set(page.errors)].slice(0, 5).map((e) => String(e).slice(0, 1500)));
  if (page.outside.length) console.log('outside requests', page.outside);
  await page.close();
}
