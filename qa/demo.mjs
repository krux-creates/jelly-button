// A demo clip for the launch posts, recorded from the page's own canvas (MediaRecorder, H.264 MP4) while a scripted
// mouse plays with the jelly: eyes wake, strings wrap the glove and snap, a press, the four flavours, dark mode.
//   CHROME_ARGS="--disable-gpu-vsync --disable-frame-rate-limit" node qa/demo.mjs   → media/demo.mp4
import { launch, sleep } from './chrome.mjs';
import { writeFileSync } from 'node:fs';
const W = 1280, H = 720;
const page = await launch({ width: W, height: H });
await page.size(W, H, { dpr: 1.5 });
await page.goto('/?flavor=pumpkin&theme=light', { settle: 2600 });
const b = await page.run(() => { const r = JellyButton.element.getBoundingClientRect(); return { l: r.left, t: r.top, w: r.width, h: r.height }; });
const cx = b.l + b.w / 2, cy = b.t + b.h / 2;
await page.run(() => {
  const s = document.querySelector('canvas').captureStream(60);
  const rec = new MediaRecorder(s, { mimeType: 'video/mp4;codecs=avc1.640028', videoBitsPerSecond: 3.5e6, bitsPerSecond: 3.5e6 });
  window.__chunks = []; rec.ondataavailable = (e) => window.__chunks.push(e.data); rec.start(250); window.__rec = rec;
});
let at = [W - 30, H - 30];
const glide = async (x, y, ms) => { const steps = Math.max(2, Math.round(ms / 16)); await page.move(x, y, { from: at, steps, ms: 16 }); at = [x, y]; };
await page.move(at[0], at[1]);
await sleep(1300);                                              // asleep: lids half shut
await glide(b.l + b.w + 60, b.t + b.h + 70, 1500);              // eyes open, strings reach and wrap the glove
await sleep(1300);
await glide(b.l + b.w + 210, b.t + b.h + 200, 1500);            // pull away: stretch, snap, wobble
await sleep(700);
await glide(b.l + b.w * 0.3, cy + 4, 900);                      // over the jelly: the skin swells under the pointer
await glide(b.l + b.w * 0.62, cy - 2, 900);
await page.mouse('mousePressed', ...at); await sleep(380);      // press: dent, eyes go wide
await page.mouse('mouseReleased', ...at); await sleep(1300);    // bounce
await glide(b.l + b.w * 0.5, b.t + b.h + 160, 700);
for (const k of ['2', '3', '4', '1']) { await page.key(k); await sleep(1050); }   // flavours
await page.key('d'); await sleep(1400);                         // night
await glide(b.l - 40, b.t + b.h + 80, 1300);                    // strings glow in the dark
await sleep(1600);
await glide(40, 40, 900);
await sleep(600);
const n = await page.run(() => new Promise((res) => { window.__rec.onstop = () => { window.__blob = new Blob(window.__chunks, { type: 'video/mp4' }); res(window.__blob.size); }; window.__rec.stop(); }));
const parts = [];
for (let o = 0; o < n; o += 3e6) {
  parts.push(Buffer.from(await page.run(async (o) => { const buf = new Uint8Array(await window.__blob.slice(o, o + 3e6).arrayBuffer()); let s = ''; for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode(...buf.subarray(i, i + 0x8000)); return btoa(s); }, o), 'base64'));
}
writeFileSync('media/demo.mp4', Buffer.concat(parts));
console.log('demo.mp4', (n / 1e6).toFixed(1), 'MB', 'errors', page.errors.slice(0, 2));
await page.close();
