import { expect, test } from 'vitest';
import { Zontyp } from '../model/zontyper.js';

test('test_AK3_1_zontyp_A_190_min', () => {
  const zontyp = Zontyp.skapa('A');
  expect(zontyp.dygnsavgift(190)).toBe(80);
});

test('test_AK3_1_zontyp_B_190_min', () => {
  const zontyp = Zontyp.skapa('B');
  expect(zontyp.dygnsavgift(190)).toBe(40);
});

test('test_AK3_1_boende_190_min', () => {
  const zontyp = Zontyp.skapa('BOENDE');
  expect(zontyp.dygnsavgift(190)).toBe(30);
});

test('test_AK3_1_gv_1_min', () => {
  const zontyp = Zontyp.skapa('A');
  expect(zontyp.dygnsavgift(1)).toBe(20);
});

test('test_AK3_1_gv_60_min', () => {
  const zontyp = Zontyp.skapa('A');
  expect(zontyp.dygnsavgift(60)).toBe(20);
});

test('test_AK3_1_gv_61_min', () => {
  const zontyp = Zontyp.skapa('A');
  expect(zontyp.dygnsavgift(61)).toBe(40);
});

test('test_AK3_1_gv_tak_480_min', () => {
  const zontyp = Zontyp.skapa('A');
  expect(zontyp.dygnsavgift(480)).toBe(160);
});

test('test_AK3_1_gv_tak_481_min', () => {
  const zontyp = Zontyp.skapa('A');
  expect(zontyp.dygnsavgift(481)).toBe(160);
});

test('test_AK3_1_tak_600_min', () => {
  const zontyp = Zontyp.skapa('A');
  expect(zontyp.dygnsavgift(600)).toBe(160);
});

test('test_AK3_1_gv_zontyp_B_1440_min', () => {
  const zontyp = Zontyp.skapa('B');
  expect(zontyp.dygnsavgift(1440)).toBe(240);
});

test('test_AK3_1_gv_boende_1440_min', () => {
  const zontyp = Zontyp.skapa('BOENDE');
  expect(zontyp.dygnsavgift(1440)).toBe(30);
});

test('test_AK3_1_gv_ogiltiga_minuter', () => {
  const zontyp = Zontyp.skapa('A');
  expect(() => zontyp.dygnsavgift(0)).toThrow();
  expect(() => zontyp.dygnsavgift(1441)).toThrow();
});

test('test_AK3_1_ej_heltal', () => {
  const zontyp = Zontyp.skapa('A');
  expect(() => zontyp.dygnsavgift(90.5)).toThrow();
});

test('test_AK3_2_koder_och_lista', () => {
  const zontyper = ['A', 'B', 'BOENDE'].map((kod) => Zontyp.skapa(kod));
  expect(zontyper.map((zontyp) => zontyp.kod)).toEqual(['A', 'B', 'BOENDE']);
  expect(Zontyp.listaZontyper()).toEqual(['A', 'B', 'BOENDE']);
});

test('test_AK3_2_okand_kod', () => {
  expect(() => Zontyp.skapa('X')).toThrow();
});

test('test_AK3_3_ny_zontyp_via_arv', () => {
  class EgenZontyp extends Zontyp {
    dygnsavgift(minuter) {
      return Math.min(Math.ceil(minuter / 60) * 5, 40);
    }
  }

  const zontyp = new EgenZontyp();
  expect(zontyp.dygnsavgift(190)).toBe(20);
  expect(zontyp.dygnsavgift(600)).toBe(40);
});
