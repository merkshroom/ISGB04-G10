import { expect, test } from 'vitest';
import { Zontyp } from '../model/zontyper.js';
import { Tidpunkt } from '../model/Tidpunkt.js';
import { Zon } from '../model/Zon.js';
import { Fordon } from '../model/Fordon.js';
import { Parkeringstillfalle } from '../model/Parkeringstillfalle.js';

function skapaTillfalle(nr, regnr, zonkod, zontypkod, start) {
  const zon = new Zon(zonkod, 'Torggatan', Zontyp.skapa(zontypkod));
  const fordon = new Fordon(regnr, 'Röd Volvo');
  return new Parkeringstillfalle(nr, fordon, zon, Tidpunkt.tolkaTidpunkt(start));
}

test('test_AK4_1_over_midnatt', () => {
  const p = skapaTillfalle(3, 'CCC 333', 'B2', 'B', '2026-11-24 22:30');
  expect(p.beraknaAvgift(Tidpunkt.tolkaTidpunkt('2026-11-25 01:15'))).toBe(40);
});

test('test_AK4_4_slut_exakt_midnatt', () => {
  const p = skapaTillfalle(6, 'CCC 333', 'BO', 'BOENDE', '2026-11-25 23:00');
  expect(p.beraknaAvgift(Tidpunkt.tolkaTidpunkt('2026-11-26 00:00'))).toBe(30);
});

test('test_AK4_4_slut_en_minut_efter_midnatt', () => {
  const p = skapaTillfalle(1, 'CCC 333', 'BO', 'BOENDE', '2026-11-25 23:00');
  expect(p.beraknaAvgift(Tidpunkt.tolkaTidpunkt('2026-11-26 00:01'))).toBe(60);
});

test('test_AK4_4_helt_dygn_midnatt_till_midnatt', () => {
  const p = skapaTillfalle(1, 'AAA 111', 'B2', 'B', '2026-11-24 00:00');
  expect(p.beraknaAvgift(Tidpunkt.tolkaTidpunkt('2026-11-25 00:00'))).toBe(240);
});

test('test_AK4_1_boende_tre_dygn', () => {
  const p = skapaTillfalle(4, 'DDD 444', 'BO', 'BOENDE', '2026-11-24 18:00');
  expect(p.beraknaAvgift(Tidpunkt.tolkaTidpunkt('2026-11-26 09:00'))).toBe(90);
});

test('test_AK4_1_zontyp_A_flera_dygn', () => {
  const p = skapaTillfalle(1, 'AAA 111', 'A1', 'A', '2026-11-24 20:00');
  expect(p.beraknaAvgift(Tidpunkt.tolkaTidpunkt('2026-11-26 02:00'))).toBe(280);
});

test('test_AK4_1_rakneexempel_avgifter', () => {
  const zoner = {
    A1: new Zon('A1', 'Torggatan', Zontyp.skapa('A')),
    B2: new Zon('B2', 'Pendlarvägen', Zontyp.skapa('B')),
    BO: new Zon('BO', 'Strandvägen', Zontyp.skapa('BOENDE')),
  };
  const fordon = Object.fromEntries(
    ['AAA 111', 'BBB 222', 'CCC 333', 'DDD 444'].map((regnr) => [
      regnr, new Fordon(regnr, 'Röd Volvo'),
    ]),
  );
  const rader = [
    [1, 'AAA 111', 'A1', '2026-11-24 10:00', '2026-11-24 12:00', 40],
    [2, 'BBB 222', 'A1', '2026-11-24 09:15', '2026-11-24 20:45', 160],
    [3, 'CCC 333', 'B2', '2026-11-24 22:30', '2026-11-25 01:15', 40],
    [4, 'DDD 444', 'BO', '2026-11-24 18:00', '2026-11-26 09:00', 90],
    [5, 'AAA 111', 'B2', '2026-11-24 13:00', '2026-11-24 17:00', 40],
    [6, 'CCC 333', 'BO', '2026-11-25 23:00', '2026-11-26 00:00', 30],
    [7, 'AAA 111', 'A1', '2026-11-26 07:30', null, null],
    [8, 'CCC 333', 'A1', '2026-11-24 07:00', '2026-11-24 08:10', 40],
  ];
  for (const [nr, regnr, zonkod, start, slut, avgift] of rader) {
    const p = new Parkeringstillfalle(
      nr, fordon[regnr], zoner[zonkod], Tidpunkt.tolkaTidpunkt(start),
    );
    const resultat = slut === null
      ? p.avgift
      : p.beraknaAvgift(Tidpunkt.tolkaTidpunkt(slut));
    expect(resultat, `Tillfälle ${nr}`).toBe(avgift);
  }
});
