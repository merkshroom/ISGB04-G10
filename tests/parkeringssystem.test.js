import { expect, test } from 'vitest';
import { Status } from '../model/Status.js';
import { Tidpunkt } from '../model/Tidpunkt.js';
import { skapaRakneexempel } from './rakneexempel.js';

function lasData(system) {
  return {
    zoner: system.zoner.map((zon) => ({
      referens: zon, kod: zon.kod, gatunamn: zon.gatunamn,
      zontyp: zon.zontyp, zontypkod: zon.zontyp.kod,
    })),
    fordon: system.fordon.map((fordon) => ({
      referens: fordon, regnr: fordon.regnr, beskrivning: fordon.beskrivning,
    })),
    tillfallen: system.tillfallen.map((tillfalle) => ({
      referens: tillfalle, nr: tillfalle.nr, fordon: tillfalle.fordon,
      zon: tillfalle.zon, start: tillfalle.start, slut: tillfalle.slut,
      avgift: tillfalle.avgift, status: tillfalle.status,
    })),
  };
}

function nekaUtanAndring(system, anrop, felmeddelande) {
  const fore = lasData(system);
  expect(anrop).toThrow(felmeddelande);
  expect(lasData(system)).toEqual(fore);
}

test('test_AK2_1_okand_zon_fordon', () => {
  const system = skapaRakneexempel();
  nekaUtanAndring(system,
    () => system.starta('ZZZ 999', 'A1', '2026-11-26 10:00'), /finns inte/);
  nekaUtanAndring(system,
    () => system.starta('BBB 222', 'C9', '2026-11-26 10:00'), /finns inte/);
  expect(system.tillfallen).toHaveLength(8);
  expect(system.zoner).toHaveLength(3);
  expect(system.fordon).toHaveLength(4);
});

test('test_AK2_3_ett_pagaende_per_fordon', () => {
  const system = skapaRakneexempel();
  nekaUtanAndring(system,
    () => system.starta('AAA 111', 'B2', '2026-11-26 10:00'), /PAGAENDE|Pågående|pågående/);
  expect(system.tillfallen).toHaveLength(8);
  system.avsluta(7, '2026-11-26 09:00');
  expect(system.hamtaTillfalle(7)).toMatchObject({
    status: Status.AVSLUTAT, slut: Tidpunkt.tolkaTidpunkt('2026-11-26 09:00'),
  });
  const tillfalle = system.starta('AAA 111', 'B2', '2026-11-26 10:00');
  expect(tillfalle).toMatchObject({
    nr: 9, status: Status.PAGAENDE,
    start: Tidpunkt.tolkaTidpunkt('2026-11-26 10:00'), slut: null, avgift: null,
  });
  expect(tillfalle.fordon).toBe(system.hamtaFordon('AAA 111'));
  expect(tillfalle.zon).toBe(system.hamtaZon('B2'));
});

test('test_AK2_2_ta_bort_zon', () => {
  const system = skapaRakneexempel();
  nekaUtanAndring(system, () => system.taBortZon('B2'), /AVSLUTAT|Avslutat|avslutat/);
  expect(system.tillfallen).toHaveLength(8);
  system.registreraBetalning(3);
  expect(system.hamtaTillfalle(3).status).toBe(Status.BETALT);
  const fore = lasData(system);
  system.taBortZon('B2');
  expect(lasData(system)).toEqual({
    ...fore,
    zoner: fore.zoner.filter((zon) => zon.kod !== 'B2'),
    tillfallen: fore.tillfallen.filter((tillfalle) => ![3, 5].includes(tillfalle.nr)),
  });
  expect(system.zoner.map((zon) => zon.kod)).toEqual(['A1', 'BO']);
  expect(system.fordon).toHaveLength(4);
  expect(system.tillfallen.map((tillfalle) => tillfalle.nr)).toEqual([1, 2, 4, 6, 7, 8]);
});

test('test_K2_ta_bort_zon_pagaende_nekas', () => {
  const system = skapaRakneexempel();
  nekaUtanAndring(system, () => system.taBortZon('A1'), /PAGAENDE|Pågående|pågående/);
});

test('test_K2_ta_bort_fordon_obetalda_nekas', () => {
  const system = skapaRakneexempel();
  nekaUtanAndring(system,
    () => system.taBortFordon('AAA 111'), /PAGAENDE|Pågående|pågående/);
  nekaUtanAndring(system,
    () => system.taBortFordon('DDD 444'), /AVSLUTAT|Avslutat|avslutat/);
});

test('test_K2_ta_bort_fordon_betalda', () => {
  const system = skapaRakneexempel();
  const fore = lasData(system);
  system.taBortFordon('BBB 222');
  expect(lasData(system)).toEqual({
    ...fore,
    fordon: fore.fordon.filter((fordon) => fordon.regnr !== 'BBB 222'),
    tillfallen: fore.tillfallen.filter((tillfalle) => tillfalle.nr !== 2),
  });
  expect(system.fordon.map((fordon) => fordon.regnr)).toEqual(['AAA 111', 'CCC 333', 'DDD 444']);
  expect(system.zoner).toHaveLength(3);
  expect(system.tillfallen.map((tillfalle) => tillfalle.nr)).toEqual([1, 3, 4, 5, 6, 7, 8]);
});

test('test_K2_ta_bort_fordon_utan_tillfallen', () => {
  const system = skapaRakneexempel();
  const fore = lasData(system);
  system.laggTillFordon('EEE 555', 'Blå Saab');
  system.taBortFordon('EEE 555');
  expect(lasData(system)).toEqual(fore);
  expect(system.fordon).toHaveLength(4);
  expect(system.zoner).toHaveLength(3);
  expect(system.tillfallen).toHaveLength(8);
});

test('test_K2_ta_bort_zon_utan_tillfallen', () => {
  const system = skapaRakneexempel();
  const fore = lasData(system);
  system.laggTillZon('A2', 'Storgatan', 'A');
  system.taBortZon('A2');
  expect(lasData(system)).toEqual(fore);
  expect(system.zoner).toHaveLength(3);
  expect(system.fordon).toHaveLength(4);
  expect(system.tillfallen).toHaveLength(8);
});

test('test_AK2_1_zonkod_skiftlage', () => {
  const system = skapaRakneexempel();
  const zon = system.hamtaZon('A1');
  nekaUtanAndring(system, () => system.laggTillZon('a1', 'Storgatan', 'B'), /finns redan/);
  expect(system.zoner).toHaveLength(3);
  const tillfalle = system.starta('BBB 222', 'a1', '2026-11-26 10:00');
  expect(tillfalle).toMatchObject({ nr: 9, status: Status.PAGAENDE });
  expect(tillfalle.zon).toBe(zon);
});

test('test_AK2_1_regnr_normalisering', () => {
  const system = skapaRakneexempel();
  const fordon = system.hamtaFordon('AAA 111');
  nekaUtanAndring(system,
    () => system.laggTillFordon('aaa111', 'Blå Saab'), /finns redan/);
  expect(system.fordon).toHaveLength(4);
  nekaUtanAndring(system,
    () => system.starta('aaa111', 'B2', '2026-11-26 10:00'), /PAGAENDE|Pågående|pågående/);
  system.avsluta(7, '2026-11-26 09:00');
  expect(system.hamtaTillfalle(7).status).toBe(Status.AVSLUTAT);
  const tillfalle = system.starta('aaa111', 'B2', '2026-11-26 10:00');
  expect(tillfalle).toMatchObject({ nr: 9, status: Status.PAGAENDE });
  expect(tillfalle.fordon).toBe(fordon);
});

test('test_AK2_1_okant_tillfallesnummer', () => {
  const system = skapaRakneexempel();
  nekaUtanAndring(system, () => system.avsluta(99, '2026-11-26 10:00'), /finns inte/);
  nekaUtanAndring(system, () => system.registreraBetalning(99), /finns inte/);
  nekaUtanAndring(system, () => system.andraSluttid(99, '2026-11-26 10:00'), /finns inte/);
  expect(system.tillfallen).toHaveLength(8);
});

test('test_K2_tillfallesnummer_ateranvands_inte', () => {
  const system = skapaRakneexempel();
  system.registreraBetalning(3);
  system.taBortZon('B2');
  expect(system.tillfallen).toHaveLength(6);
  const tillfalle = system.starta('BBB 222', 'A1', '2026-11-26 10:00');
  expect(system.tillfallen).toHaveLength(7);
  expect(system.tillfallen.map((p) => p.nr)).toEqual([1, 2, 4, 6, 7, 8, 9]);
  expect(tillfalle).toMatchObject({ nr: 9, status: Status.PAGAENDE });
});

test('test_K3_lagg_till_zon_okand_zontyp', () => {
  const system = skapaRakneexempel();
  nekaUtanAndring(system, () => system.laggTillZon('C9', 'Storgatan', 'X'), /[Oo]känd.*X/);
  expect(system.zoner).toHaveLength(3);
  expect(system.fordon).toHaveLength(4);
  expect(system.tillfallen).toHaveLength(8);
});

test('test_AK1_1_andra_zon_system', () => {
  const system = skapaRakneexempel();
  const zon = system.hamtaZon('A1');
  const zontyp = zon.zontyp;
  system.andraZon('a1', 'Kungsgatan');
  expect(zon).toMatchObject({ kod: 'A1', gatunamn: 'Kungsgatan' });
  expect(zon.zontyp).toBe(zontyp);
  for (const nr of [1, 2, 7, 8]) {
    expect(system.hamtaTillfalle(nr).zon).toBe(zon);
    expect(system.hamtaTillfalle(nr).zon.gatunamn).toBe('Kungsgatan');
  }
  nekaUtanAndring(system, () => system.andraZon('A1', ''), /gatunamn/);
  nekaUtanAndring(system, () => system.andraZon('C9', 'Storgatan'), /finns inte/);
});

test('test_AK1_1_andra_fordon_system', () => {
  const system = skapaRakneexempel();
  const fordon = system.hamtaFordon('AAA 111');
  system.andraFordon('aaa111', 'Blå Saab');
  expect(fordon).toMatchObject({ regnr: 'AAA 111', beskrivning: 'Blå Saab' });
  for (const nr of [1, 5, 7]) {
    expect(system.hamtaTillfalle(nr).fordon).toBe(fordon);
    expect(system.hamtaTillfalle(nr).fordon.beskrivning).toBe('Blå Saab');
  }
  nekaUtanAndring(system, () => system.andraFordon('AAA 111', ''), /beskrivning/);
  nekaUtanAndring(system, () => system.andraFordon('ZZZ 999', 'Röd Volvo'), /finns inte/);
});

test('test_K2_lista_tillfallen_for_fordon', () => {
  const system = skapaRakneexempel();
  system.laggTillFordon('EEE 555', 'Blå Saab');
  const fore = lasData(system);
  const forvantade = [1, 5, 7].map((nr) => system.hamtaTillfalle(nr));
  for (const regnr of ['AAA 111', 'aaa111']) {
    const tillfallen = system.listaTillfallen(regnr);
    expect(tillfallen.map((p) => p.nr)).toEqual([1, 5, 7]);
    tillfallen.forEach((p, index) => expect(p).toBe(forvantade[index]));
    expect(tillfallen.map((p) => p.status)).toEqual([
      Status.BETALT, Status.BETALT, Status.PAGAENDE,
    ]);
    expect(lasData(system)).toEqual(fore);
  }
  expect(system.listaTillfallen('EEE 555')).toEqual([]);
  expect(lasData(system)).toEqual(fore);
});
