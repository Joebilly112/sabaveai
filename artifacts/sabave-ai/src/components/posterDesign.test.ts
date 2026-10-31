import assert from 'node:assert/strict';
import test from 'node:test';
import { contrast, parseOffer, posterChecks, posterPalette, priceDigits } from './posterDesign';
import type { PosterDirection } from './posterDesign';

test('offers split into the price a customer pays and what it replaces', () => {
  assert.deepEqual(parseOffer('RM2 off Nasi Lemak Ayam (RM8 → RM6)'), { now: 6, was: 8, save: 2, note: undefined });
  assert.deepEqual(parseOffer('Family pack: 2 × Nasi Lemak Ayam (RM16 → RM14)'), { now: 14, was: 16, save: 2, note: 'Family pack: 2 × Nasi Lemak Ayam' });
  assert.deepEqual(parseOffer('RM2.50 off Kopi O (RM2.5 -> RM0)'), { now: 0, was: 2.5, save: 2.5, note: undefined });
  assert.equal(parseOffer('Teh Tarik now RM2.80').now, 2.8);
  assert.equal(parseOffer('RM2 off any set').flat, 'RM2 OFF');
  assert.equal(parseOffer('20% off all baju').flat, '20% OFF');
  assert.deepEqual(parseOffer('Free teh tarik with every set'), { note: 'Free teh tarik with every set' });
  assert.deepEqual(parseOffer('  '), {});
  assert.equal(priceDigits(2.8), '2.80');
  assert.equal(priceDigits(6), '6');
});

test('every direction keeps text and price readable for any brand colours', () => {
  const brands = [['#FDE68A', '#92400E', '#FFF7D6'], ['#0369A1', '#BAE6FD'], ['#BE185D', '#FCE7F3'], ['#0F7A5C'], ['#000000', '#FFFFFF'], ['nonsense']];
  for (const direction of ['heritage', 'bold', 'editorial'] as PosterDirection[]) {
    for (const brand of brands) {
      for (const isFood of [true, false]) {
        const palette = posterPalette(direction, brand, isFood);
        const label = `${direction} ${brand.join()} ${isFood}`;
        assert.ok(contrast(palette.ink, palette.ground) >= 7, `ink ${label}`);
        const onGround = direction === 'bold' ? contrast(palette.price, palette.priceInk) : contrast(palette.price, palette.ground);
        assert.ok(onGround >= 4.5, `price ${label}`);
      }
    }
  }
});

test('food brands get the banana-leaf ground and keep their own colours for type', () => {
  const palette = posterPalette('heritage', ['#FDE68A', '#92400E', '#FFF7D6'], true);
  assert.equal(palette.ground, '#12382B');
  assert.equal(palette.ink, '#FFF7D6');
  assert.notEqual(posterPalette('heritage', ['#0369A1', '#BAE6FD'], false).ground, '#12382B');
});

test('the poster check names what stops an ad working', () => {
  const good = { product: 'Nasi Lemak Ayam', isFood: true, hasPhoto: true, photoEdge: 1024, offer: 'RM2 off Nasi Lemak Ayam (RM8 → RM6)', headline: 'Nasi Lemak Ayam, sambal still warm', cta: 'Order now' };
  assert.deepEqual(posterChecks(good), []);
  assert.match(posterChecks({ ...good, hasPhoto: false, photoEdge: 0 })[0]!, /real photo of Nasi Lemak Ayam/);
  assert.match(posterChecks({ ...good, photoEdge: 160 })[0]!, /160px/);
  assert.match(posterChecks({ ...good, offer: 'Free teh tarik' })[0]!, /price/);
  assert.match(posterChecks({ ...good, headline: 'one two three four five six seven eight nine' })[0]!, /It has 9/);
  assert.match(posterChecks({ ...good, cta: 'Hubungi kami · Contact us' })[0]!, /one short step/);
  assert.match(posterChecks({ ...good, cta: 'Contact us' })[0]!, /Say what to do next/);
});
