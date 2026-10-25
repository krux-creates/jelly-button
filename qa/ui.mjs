// Page chrome: one cursor over the flavour chips, the Tune card on both tabs and in another flavour, the card on a
// phone, and the press dent in the jelly at 3x.
import { launch, sleep } from './chrome.mjs';
const W = 1280, H = 800;
const page = await launch({ width: W, height: H });
await page.size(W, H, { dpr: 2 });
await page.goto('/', { settle: 2500 });
// 1. over a chip: the drawn cursor must be off (the system cursor shows)
const chip = await page.run(() => { const r = document.querySelector('[data-flavor="slime"]').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
await page.move(chip[0], chip[1], { from: [chip[0] + 200, chip[1] - 200], steps: 10 });
await sleep(400);
console.log('over chip', JSON.stringify(await page.run(() => ({ drawnCursor: JellyButton._debug.hand.on, bodyCursorHidden: document.body.classList.contains('is-engaged'), chipCursor: getComputedStyle(document.querySelector('[data-flavor="slime"]')).cursor.slice(0, 20) }))));
await page.click(chip);
await sleep(300);
console.log('after clicking a chip', JSON.stringify(await page.run(() => ({ drawnCursor: JellyButton._debug.hand.on, flavor: JellyButton.flavor }))));
await page.run(() => JellyButton.setFlavor('pumpkin'));
await page.move(W / 2 + 300, H / 2 - 200, { from: chip, steps: 10 });
await sleep(400);
console.log('open floor', JSON.stringify(await page.run(() => ({ drawnCursor: JellyButton._debug.hand.on, bodyCursorHidden: document.body.classList.contains('is-engaged') }))));
// 2. the Tune card
await page.click('#tuneToggle');
await sleep(500);
const box = await page.run(() => { const r = document.getElementById('panel').getBoundingClientRect(); return { x: r.left - 16, y: r.top - 16, width: r.width + 32, height: r.height + 70 }; });
await page.shot('qa/out/tune-jelly.png', box);
await page.click('#tab-strings');
await sleep(250);
const box2 = await page.run(() => { const r = document.getElementById('panel').getBoundingClientRect(); return { x: r.left - 16, y: r.top - 16, width: r.width + 32, height: r.height + 70 }; });
await page.shot('qa/out/tune-strings.png', box2);
await page.run(() => JellyButton.setFlavor('blood'));
await page.click('#tab-jelly');
await sleep(300);
await page.shot('qa/out/tune-blood.png', box);
console.log('panel', JSON.stringify(box2), 'over panel drawn cursor', await page.run(() => JellyButton._debug.hand.on));
await page.key('Escape');
await sleep(200);
console.log('escape closes', await page.run(() => document.getElementById('panel').hidden));
await page.run(() => JellyButton.setFlavor('pumpkin'));
// 3. the press dent, close up
await page.size(W, H, { dpr: 3 });
await sleep(600);
const r = await page.run(() => { const b = JellyButton.element.getBoundingClientRect(); return { l: b.left, t: b.top, w: b.width, h: b.height }; });
const px = r.l + r.w * 0.62, py = r.t + r.h * 0.5;
await page.move(px, py, { from: [px + 300, py + 200], steps: 14 });
await sleep(700);
await page.shot('qa/out/skin-hover.png', { x: r.l - 10, y: r.t - 10, width: r.w + 20, height: r.h + 20 });
await page.mouse('mousePressed', px, py);
await sleep(260);
await page.shot('qa/out/skin-press.png', { x: r.l - 10, y: r.t - 10, width: r.w + 20, height: r.h + 20 });
await page.mouse('mouseReleased', px, py);
await sleep(90);
await page.shot('qa/out/skin-release.png', { x: r.l - 10, y: r.t - 10, width: r.w + 20, height: r.h + 20 });
// 4. the card on a phone
await page.size(390, 844, { touch: true, dpr: 2 });
await sleep(500);
await page.run(() => document.getElementById('tuneToggle').click());
await sleep(400);
await page.shot('qa/out/tune-phone.png');
console.log('errors', page.errors.slice(0, 3));
await page.close();
