import { expect, test } from 'vitest';
import { Zontyp } from '../model/zontyper.js';
import { Status } from '../model/Status.js';
import { Tidpunkt } from '../model/Tidpunkt.js';
import { Zon } from '../model/Zon.js';
import { Fordon } from '../model/Fordon.js';
import { Parkeringstillfalle } from '../model/Parkeringstillfalle.js';

function skapaTillfalle(nr = 1, start = '2026-11-24 10:00') {
  const fordon = new Fordon('AAA 111', 'Röd Volvo');
  const zon = new Zon('A1', 'Torggatan', Zontyp.skapa('A'));
  return new Parkeringstillfalle(nr, fordon, zon, Tidpunkt.tolkaTidpunkt(start));
}

test('test_AK1_1_mellanslag', () => {
  const zontyp = Zontyp.skapa('A');
  for (const kod of ['A 1', 'B1 ', '', ' C1', 'D-1']) {
    expect(() => new Zon(kod, 'Storgatan', zontyp)).toThrow();
  }
});

test('test_AK1_1_sma_versaler', () => {
  const zon = new Zon('a1', 'Torggatan', Zontyp.skapa('A'));
  expect(zon.kod).toBe('A1');
});

test('test_AK1_1_giltiga_zonkoder', () => {
  const zontyp = Zontyp.skapa('A');
  expect(new Zon('B', 'Storgatan', zontyp).kod).toBe('B');
  expect(new Zon('ÖA1', 'Storgatan', zontyp).kod).toBe('ÖA1');
});

test('test_AK1_2_betala_pagaende', () => {
  const p = skapaTillfalle(7, '2026-11-26 07:30');
  expect(() => p.registreraBetalning()).toThrow();
  expect(p).toMatchObject({ status: Status.PAGAENDE, slut: null, avgift: null });
});

test('test_AK1_2_avsluta_betalt', () => {
  const p = skapaTillfalle();
  p.avsluta(Tidpunkt.tolkaTidpunkt('2026-11-24 12:00'));
  p.registreraBetalning();
  expect(() => p.avsluta(Tidpunkt.tolkaTidpunkt('2026-11-24 13:00'))).toThrow();
  expect(p).toMatchObject({
    status: Status.BETALT,
    slut: Tidpunkt.tolkaTidpunkt('2026-11-24 12:00'),
    avgift: 40,
  });
});

test('test_AK1_3_sluttid_fore_start', () => {
  const p = skapaTillfalle();
  expect(() => p.avsluta(Tidpunkt.tolkaTidpunkt('2026-11-24 09:59'))).toThrow();
  expect(p).toMatchObject({ status: Status.PAGAENDE, slut: null, avgift: null });
});

test('test_AK1_3_regnr_format', () => {
  expect(new Fordon('AAA 111', 'Röd Volvo').regnr).toBe('AAA 111');
  expect(new Fordon('aaa111', 'Röd Volvo').regnr).toBe('AAA 111');
  for (const regnr of ['', 'AA 111', 'AAAA 111', 'AAA 11', 'ABC 12D']) {
    expect(() => new Fordon(regnr, 'Röd Volvo')).toThrow();
  }
});

test('test_AK1_1_pagaende_andra_starttid', () => {
  const p = skapaTillfalle();
  p.andraStarttid(Tidpunkt.tolkaTidpunkt('2026-11-24 09:30'));
  expect(p).toMatchObject({
    start: Tidpunkt.tolkaTidpunkt('2026-11-24 09:30'),
    status: Status.PAGAENDE,
    slut: null,
    avgift: null,
  });
});

test('test_AK1_1_pagaende_andra_sluttid_nekas', () => {
  const p = skapaTillfalle();
  expect(() => p.andraSluttid(Tidpunkt.tolkaTidpunkt('2026-11-24 12:00'))).toThrow();
  expect(p).toMatchObject({ status: Status.PAGAENDE, slut: null, avgift: null });
});

test('test_AK1_1_avslutat_andra_sluttid', () => {
  const p = skapaTillfalle();
  p.avsluta(Tidpunkt.tolkaTidpunkt('2026-11-24 12:00'));
  p.andraSluttid(Tidpunkt.tolkaTidpunkt('2026-11-24 12:01'));
  expect(p).toMatchObject({
    slut: Tidpunkt.tolkaTidpunkt('2026-11-24 12:01'),
    avgift: 60,
    status: Status.AVSLUTAT,
  });
});

test('test_AK1_1_avslutat_andra_starttid_nekas', () => {
  const p = skapaTillfalle();
  p.avsluta(Tidpunkt.tolkaTidpunkt('2026-11-24 12:00'));
  for (const start of ['2026-11-24 09:30', '2026-11-24 12:01']) {
    expect(() => p.andraStarttid(Tidpunkt.tolkaTidpunkt(start))).toThrow();
    expect(p).toMatchObject({
      start: Tidpunkt.tolkaTidpunkt('2026-11-24 10:00'),
      slut: Tidpunkt.tolkaTidpunkt('2026-11-24 12:00'),
      avgift: 40,
    });
  }
});

test('test_AK1_1_betalt_andring_nekas', () => {
  const p = skapaTillfalle();
  p.avsluta(Tidpunkt.tolkaTidpunkt('2026-11-24 12:00'));
  p.registreraBetalning();
  const oforandrat = {
    status: Status.BETALT,
    start: Tidpunkt.tolkaTidpunkt('2026-11-24 10:00'),
    slut: Tidpunkt.tolkaTidpunkt('2026-11-24 12:00'),
    avgift: 40,
  };
  expect(() => p.andraStarttid(Tidpunkt.tolkaTidpunkt('2026-11-24 09:30'))).toThrow();
  expect(p).toMatchObject(oforandrat);
  expect(() => p.andraSluttid(Tidpunkt.tolkaTidpunkt('2026-11-24 13:00'))).toThrow();
  expect(p).toMatchObject(oforandrat);
});

test('test_AK1_3_andra_sluttid_fore_start', () => {
  const p = skapaTillfalle();
  p.avsluta(Tidpunkt.tolkaTidpunkt('2026-11-24 12:00'));
  expect(() => p.andraSluttid(Tidpunkt.tolkaTidpunkt('2026-11-24 09:59'))).toThrow();
  expect(p).toMatchObject({
    slut: Tidpunkt.tolkaTidpunkt('2026-11-24 12:00'),
    avgift: 40,
    status: Status.AVSLUTAT,
  });
});

test('test_AK4_4_nytt_tillfalle_pagaende', () => {
  const fordon = new Fordon('AAA 111', 'Röd Volvo');
  const zon = new Zon('A1', 'Torggatan', Zontyp.skapa('A'));
  const start = Tidpunkt.tolkaTidpunkt('2026-11-24 10:00');
  const p = new Parkeringstillfalle(1, fordon, zon, start);
  expect(p.nr).toBe(1);
  expect(p.fordon).toBe(fordon);
  expect(p.zon).toBe(zon);
  expect(p.start).toEqual(start);
  expect(p).toMatchObject({ status: Status.PAGAENDE, slut: null, avgift: null });
});

test('test_K1_avsluta_ger_avslutat', () => {
  const p = skapaTillfalle();
  p.avsluta(Tidpunkt.tolkaTidpunkt('2026-11-24 12:00'));
  expect(p).toMatchObject({
    status: Status.AVSLUTAT,
    slut: Tidpunkt.tolkaTidpunkt('2026-11-24 12:00'),
    avgift: 40,
  });
});

test('test_K1_betala_ger_betalt', () => {
  const p = skapaTillfalle();
  p.avsluta(Tidpunkt.tolkaTidpunkt('2026-11-24 12:00'));
  p.registreraBetalning();
  expect(p).toMatchObject({
    status: Status.BETALT,
    slut: Tidpunkt.tolkaTidpunkt('2026-11-24 12:00'),
    avgift: 40,
  });
});

test('test_K1_ovriga_overgangar_nekas', () => {
  const p = skapaTillfalle();
  p.avsluta(Tidpunkt.tolkaTidpunkt('2026-11-24 12:00'));
  expect(() => p.avsluta(Tidpunkt.tolkaTidpunkt('2026-11-24 13:00'))).toThrow();
  expect(p).toMatchObject({
    status: Status.AVSLUTAT,
    slut: Tidpunkt.tolkaTidpunkt('2026-11-24 12:00'),
    avgift: 40,
  });
  p.registreraBetalning();
  expect(() => p.registreraBetalning()).toThrow();
  expect(p).toMatchObject({
    status: Status.BETALT,
    slut: Tidpunkt.tolkaTidpunkt('2026-11-24 12:00'),
    avgift: 40,
  });
});

test('test_AK1_1_zon_skapa_och_andra', () => {
  const z = new Zon('A1', 'Torggatan', Zontyp.skapa('A'));
  expect(z).toMatchObject({ kod: 'A1', gatunamn: 'Torggatan' });
  expect(z.zontyp.kod).toBe('A');
  z.andraGatunamn('Kungsgatan');
  expect(z.gatunamn).toBe('Kungsgatan');
  expect(() => z.andraGatunamn('')).toThrow();
  expect(z.gatunamn).toBe('Kungsgatan');
  expect(() => new Zon('A2', '', Zontyp.skapa('A'))).toThrow();
});

test('test_AK1_1_fordon_skapa_och_andra', () => {
  const f = new Fordon('AAA 111', 'Röd Volvo');
  expect(f).toMatchObject({ regnr: 'AAA 111', beskrivning: 'Röd Volvo' });
  f.andraBeskrivning('Blå Saab');
  expect(f.beskrivning).toBe('Blå Saab');
  expect(() => f.andraBeskrivning('')).toThrow();
  expect(f.beskrivning).toBe('Blå Saab');
  expect(() => new Fordon('BBB 222', '')).toThrow();
});
