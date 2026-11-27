import { expect, test } from 'vitest';
import { Parkeringssystem } from '../logic/Parkeringssystem.js';
import { Status } from '../model/Status.js';
import { Tidpunkt } from '../model/Tidpunkt.js';
import { skapaRakneexempel } from './rakneexempel.js';

function rapportData(rapport) {
  return {
    tillfallen: rapport.tillfallen.map((p) => [
      p.fordon.regnr, p.zon.kod, Tidpunkt.formateraTidpunkt(p.start),
      Tidpunkt.formateraTidpunkt(p.slut), p.avgift,
    ]),
    summa: rapport.summa,
  };
}

function forvantatRakneexempel() {
  return {
    tillfallen: [
      ['BBB 222', 'A1', '2026-11-24 09:15', '2026-11-24 20:45', 160],
      ['CCC 333', 'A1', '2026-11-24 07:00', '2026-11-24 08:10', 40],
      ['AAA 111', 'A1', '2026-11-24 10:00', '2026-11-24 12:00', 40],
      ['AAA 111', 'B2', '2026-11-24 13:00', '2026-11-24 17:00', 40],
    ],
    summa: 280,
  };
}

function systemData(system) {
  return {
    zoner: system.zoner.map((z) => [z.kod, z.gatunamn, z.zontyp.kod]),
    fordon: system.fordon.map((f) => [f.regnr, f.beskrivning]),
    tillfallen: system.tillfallen.map((p) => [
      p.nr, p.fordon.regnr, p.zon.kod, p.start, p.slut, p.avgift, p.status,
    ]),
  };
}

test('test_AK4_1_rakneexempel_rapport', () => {
  const systemA = skapaRakneexempel();
  const foreA = systemData(systemA);
  const rapportA = systemA.dygnsrapport('2026-11-24');
  expect(rapportData(rapportA)).toEqual(forvantatRakneexempel());
  expect(systemData(systemA)).toEqual(foreA);

  const systemB = skapaRakneexempel([8, 6, 5, 4, 3, 2, 1, 7]);
  const foreB = systemData(systemB);
  const rapportB = systemB.dygnsrapport('2026-11-24');
  expect(rapportData(rapportB)).toEqual(rapportData(rapportA));
  expect(systemData(systemB)).toEqual(foreB);
});

test('test_AK4_1_avslutat_ingar_i_rapport', () => {
  const system = skapaRakneexempel();
  const fore = systemData(system);
  const rapport = system.dygnsrapport('2026-11-25');
  expect(rapport.tillfallen.map((p) => p.nr)).toEqual([3]);
  expect(rapport.tillfallen[0]).toBe(system.hamtaTillfalle(3));
  expect(rapport.tillfallen[0]).toMatchObject({ status: Status.AVSLUTAT, avgift: 40 });
  expect(rapport.tillfallen[0].fordon.regnr).toBe('CCC 333');
  expect(rapport.tillfallen).not.toContain(system.hamtaTillfalle(6));
  expect(rapport.summa).toBe(40);
  expect(systemData(system)).toEqual(fore);
});

test('test_AK4_2_tom_rapport', () => {
  const system = skapaRakneexempel();
  const fore = systemData(system);
  expect(system.dygnsrapport('2026-11-27')).toEqual({ tillfallen: [], summa: 0 });
  expect(systemData(system)).toEqual(fore);
});

test('test_AK4_3_lika_avgift_sortering', () => {
  const system = new Parkeringssystem();
  system.laggTillZon('A1', 'Torggatan', 'A');
  for (const regnr of ['AAA 111', 'BBB 222', 'CCC 333']) {
    system.laggTillFordon(regnr, 'Röd Volvo');
  }
  const rader = [
    ['CCC 333', '2026-11-24 11:00', '2026-11-24 12:00'],
    ['BBB 222', '2026-11-24 10:00', '2026-11-24 11:00'],
    ['AAA 111', '2026-11-24 10:00', '2026-11-24 11:00'],
  ];
  for (const [regnr, start, slut] of rader) {
    const p = system.starta(regnr, 'A1', start);
    system.avsluta(p.nr, slut);
  }
  const fore = systemData(system);
  expect(rapportData(system.dygnsrapport('2026-11-24'))).toEqual({
    tillfallen: [
      ['AAA 111', 'A1', '2026-11-24 10:00', '2026-11-24 11:00', 20],
      ['BBB 222', 'A1', '2026-11-24 10:00', '2026-11-24 11:00', 20],
      ['CCC 333', 'A1', '2026-11-24 11:00', '2026-11-24 12:00', 20],
    ],
    summa: 60,
  });
  expect(systemData(system)).toEqual(fore);
});

test('test_AK4_4_pagaende_utan_avgift', () => {
  const system = skapaRakneexempel();
  system.laggTillFordon('EEE 555', 'Blå Saab');
  const p = system.starta('EEE 555', 'A1', '2026-11-24 14:00');
  expect(p).toMatchObject({ status: Status.PAGAENDE, slut: null, avgift: null });
  const fore = systemData(system);
  const rapport = system.dygnsrapport('2026-11-24');
  expect(rapportData(rapport)).toEqual(forvantatRakneexempel());
  expect(rapport.tillfallen).not.toContain(p);
  expect(systemData(system)).toEqual(fore);
});
