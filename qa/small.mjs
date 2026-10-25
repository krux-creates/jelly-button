// Phone width and reduced motion: layout of the chrome, and that nothing throws.
import { launch, sleep } from './chrome.mjs';
const page = await launch({ width: 390, height: 844 });
await page.size(390, 844, { touch: true, dpr: 2 });
await page.goto('/', { settle: 2500 });
const lay = await page.run(() => {
  const r = (el) => { const b = el.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.top), Math.round(b.right), Math.round(b.bottom)]; };
  return { flavors: r(document.getElementById('flavors')), tune: r(document.getElementById('tuneToggle')), jelly: r(document.getElementById('jelly')), vw: innerWidth };
});
console.log('phone', JSON.stringify(lay));
await page.shot('qa/out/phone.png');
await page.reducedMotion(true);
await page.size(1280, 800, { dpr: 1 });
await page.goto('/', { settle: 2500 });
await page.shot('qa/out/reduced.png');
console.log('errors', page.errors.slice(0, 3));
await page.close();
