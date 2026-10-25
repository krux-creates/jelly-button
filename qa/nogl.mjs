// The no-WebGL2 fallback: run with CHROME_ARGS="--disable-3d-apis". Checks the CSS jelly sits centred, hugs its
// label with room for both eyes, and that press feedback and the activate event work.
import { launch, sleep } from './chrome.mjs';
const page = await launch({ width: 1280, height: 800 });
await page.size(1280, 800, { dpr: 2 });
await page.goto('/', { settle: 1500 });
const info = await page.run(() => {
  const b = document.getElementById('jelly'), r = b.getBoundingClientRect();
  const range = document.createRange(); range.selectNodeContents(b); const t = range.getBoundingClientRect();
  return { noGl: document.body.classList.contains('no-gl'), btn: [r.left, r.top, r.width, r.height].map(Math.round),
    text: [t.left, t.width].map(Math.round), font: getComputedStyle(b).fontFamily.split(',')[0], hidden: ['flavors', 'tuneToggle'].map((id) => getComputedStyle(document.getElementById(id)).display) };
});
console.log(JSON.stringify(info));
const [l, tp, w, h] = info.btn;
// eyes occupy 17.5..42.5 (times the scale) from each end: the label must clear them
const s = h / 60;
console.log('gap left eye→text', Math.round(info.text[0] - (l + 42.5 * s)), 'gap text→right eye', Math.round(l + w - 42.5 * s - (info.text[0] + info.text[1])));
await page.shot('qa/out/nogl.png', { x: l - 60, y: tp - 50, width: w + 120, height: h + 100 });
let fired = 0;
await page.run(() => { window.__fired = 0; document.getElementById('jelly').addEventListener('jelly:activate', () => window.__fired++); });
await page.mouse('mousePressed', l + w / 2, tp + h / 2);
await sleep(150);
await page.shot('qa/out/nogl-press.png', { x: l - 60, y: tp - 50, width: w + 120, height: h + 100 });
await page.mouse('mouseReleased', l + w / 2, tp + h / 2);
await sleep(100);
console.log('activate fired', await page.run(() => window.__fired), 'errors', page.errors.slice(0, 2));
await page.close();
