import { readFileSync } from 'node:fs';
import { File } from 'node:buffer';
import { URL } from 'node:url';
import { expect, test } from 'vitest';
import { Filhanterare, FilformatFel } from '../storage/Filhanterare.js';
import { Parkeringssystem } from '../logic/Parkeringssystem.js';
import { Status } from '../model/Status.js';
import { Tidpunkt } from '../model/Tidpunkt.js';
import { skapaRakneexempel } from './rakneexempel.js';

function exempeltext() {
  return readFileSync(new URL('../docs/exempel/rakneexempel.txt', import.meta.url), 'utf8');
}

function skapaFil(text) {
  return new File([text], 'parkering.txt', { type: 'text/plain', lastModified: 0 });
}

function samlingar(system) {
  return { zoner: system.zoner, fordon: system.fordon, tillfallen: system.tillfallen };
}

function faltData(system) {
  return {
    zoner: system.zoner.map((z) => [z.kod, z.gatunamn, z.zontyp.kod]),
    fordon: system.fordon.map((f) => [f.regnr, f.beskrivning]),
    tillfallen: system.tillfallen.map((p) => [
      p.nr, p.fordon.regnr, p.zon.kod, p.start, p.slut, p.avgift, p.status,
    ]),
  };
}

function kontrolleraReferenser(system) {
  for (const p of system.tillfallen) {
    expect(p.fordon).toBe(system.hamtaFordon(p.fordon.regnr));
    expect(p.zon).toBe(system.hamtaZon(p.zon.kod));
  }
}

function andraRad(text, rad, andring) {
  const rader = text.split('\n');
  rader[rad - 1] = andring(rader[rad - 1]);
  return rader.join('\n');
}

async function oppnaTillSystem(filhanterare, system, text) {
  const data = await filhanterare.oppna(skapaFil(text));
  system.ersattData(data);
}

async function nekaUtanAndring(system, text, rad, orsak) {
  const fore = faltData(system);
  const referenser = samlingar(system);
  const resultat = oppnaTillSystem(new Filhanterare(), system, text);
  await expect(resultat).rejects.toBeInstanceOf(FilformatFel);
  await expect(resultat).rejects.toMatchObject({
    rad, orsak: expect.stringMatching(orsak),
    message: expect.stringMatching(new RegExp(`^Rad ${rad}: `)),
  });
  expect(faltData(system)).toEqual(fore);
  for (const namn of ['zoner', 'fordon', 'tillfallen']) {
    system[namn].forEach((objekt, index) => expect(objekt).toBe(referenser[namn][index]));
  }
}

test('test_AK5_1_rundresa', async () => {
  const original = skapaRakneexempel();
  const fore = faltData(original);
  const filhanterare = new Filhanterare();
  const text = filhanterare.spara(samlingar(original));
  const nytt = new Parkeringssystem();
  await oppnaTillSystem(filhanterare, nytt, text);
  expect(faltData(nytt)).toEqual(fore);
  expect(faltData(original)).toEqual(fore);
  kontrolleraReferenser(nytt);
  for (const namn of ['zoner', 'fordon', 'tillfallen']) {
    nytt[namn].forEach((objekt, index) => expect(objekt).not.toBe(original[namn][index]));
  }
  expect(nytt.hamtaTillfalle(7)).toMatchObject({
    status: Status.PAGAENDE, slut: null, avgift: null,
  });
});

test('test_AK5_5_exempelfil', async () => {
  const system = new Parkeringssystem();
  await oppnaTillSystem(new Filhanterare(), system, exempeltext());
  expect(faltData(system)).toEqual(faltData(skapaRakneexempel()));
  expect(system.zoner).toHaveLength(3);
  expect(system.fordon).toHaveLength(4);
  expect(system.tillfallen.map((p) => p.nr)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  kontrolleraReferenser(system);
});

test('test_AK5_1_gv_tomma_sektioner', async () => {
  const system = new Parkeringssystem();
  const filhanterare = new Filhanterare();
  await oppnaTillSystem(filhanterare, system,
    'PARKERING;1\n[ZONER]\n[FORDON]\n[TILLFALLEN]\n');
  expect(samlingar(system)).toEqual({ zoner: [], fordon: [], tillfallen: [] });
  const text = filhanterare.spara(samlingar(system));
  expect(text.split('\n')).toEqual(['PARKERING;1', '[ZONER]', '[FORDON]', '[TILLFALLEN]', '']);
  await oppnaTillSystem(filhanterare, system, text);
  expect(samlingar(system)).toEqual({ zoner: [], fordon: [], tillfallen: [] });
});

test('test_AK5_2_fel_version', async () => {
  const system = skapaRakneexempel();
  await nekaUtanAndring(system, '', 1, /saknad version/i);
  const text = andraRad(exempeltext(), 1, () => 'PARKERING;999');
  await nekaUtanAndring(system, text, 1, /okänd version/i);
});

test('test_AK5_2_okand_zon', async () => {
  const system = skapaRakneexempel();
  const text = andraRad(exempeltext(), 12, (rad) => rad.replace(';A1;', ';C9;'));
  await nekaUtanAndring(system, text, 12, /okänd zon.*C9/i);
});

test('test_AK5_3_fel_klockslag', async () => {
  const system = skapaRakneexempel();
  const text = andraRad(exempeltext(), 14, (rad) => rad.replace('22:30', 'kl 10'));
  await nekaUtanAndring(system, text, 14, /klockslag.*format|format.*klockslag/i);
});

test('test_AK5_3_gv_klockslag', async () => {
  for (const [klockslag, avgift] of [['00:00', 260], ['23:59', 30]]) {
    const system = skapaRakneexempel();
    const text = andraRad(exempeltext(), 14, (rad) => {
      const falt = rad.split(';');
      falt[3] = `2026-11-24 ${klockslag}`;
      falt[6] = String(avgift);
      return falt.join(';');
    });
    await oppnaTillSystem(new Filhanterare(), system, text);
    expect(system.hamtaTillfalle(3)).toMatchObject({
      start: Tidpunkt.tolkaTidpunkt(`2026-11-24 ${klockslag}`), avgift,
    });
    kontrolleraReferenser(system);
  }
  const system = skapaRakneexempel();
  for (const klockslag of ['25:00', '10:60']) {
    const text = andraRad(exempeltext(), 14, (rad) => rad.replace('22:30', klockslag));
    await nekaUtanAndring(system, text, 14, /ogiltigt klockslag/i);
  }
});

test('test_AK5_4_sluttid_fore_starttid', async () => {
  const system = skapaRakneexempel();
  const text = andraRad(exempeltext(), 12, (rad) => rad.replace('12:00', '09:59'));
  await nekaUtanAndring(system, text, 12, /sluttid.*före starttid/i);
});

test('test_K5_BB4_duplicerad_zonkod', async () => {
  const system = skapaRakneexempel();
  const text = andraRad(exempeltext(), 4, (rad) => rad.replace('B2;', 'a1;'));
  await nekaUtanAndring(system, text, 4, /duplicerad zonkod/i);
});

test('test_K5_BB4_zonreferens_skiftlage', async () => {
  const system = new Parkeringssystem();
  const text = andraRad(exempeltext(), 12, (rad) => rad.replace(';A1;', ';a1;'));
  await oppnaTillSystem(new Filhanterare(), system, text);
  expect(faltData(system)).toEqual(faltData(skapaRakneexempel()));
  expect(system.hamtaTillfalle(1).zon).toBe(system.hamtaZon('A1'));
  kontrolleraReferenser(system);
});

test('test_K5_BB1_duplicerat_regnr', async () => {
  const system = skapaRakneexempel();
  const text = andraRad(exempeltext(), 8, (rad) => rad.replace('BBB 222;', 'aaa111;'));
  await nekaUtanAndring(system, text, 8, /duplicerat registreringsnummer/i);
});

test('test_K5_BB1_fordonsreferens_normalisering', async () => {
  const system = new Parkeringssystem();
  const text = andraRad(exempeltext(), 12, (rad) => rad.replace(';AAA 111;', ';aaa111;'));
  await oppnaTillSystem(new Filhanterare(), system, text);
  expect(faltData(system)).toEqual(faltData(skapaRakneexempel()));
  expect(system.hamtaTillfalle(1).fordon).toBe(system.hamtaFordon('AAA 111'));
  kontrolleraReferenser(system);
});

test('test_K5_felaktiga_sektioner', async () => {
  const system = skapaRakneexempel();
  await nekaUtanAndring(system, 'PARKERING;1\n', 2, /saknad sektion/i);
  const okand = andraRad(exempeltext(), 6, () => '[OKAND]');
  await nekaUtanAndring(system, okand, 6, /okänd sektion/i);
  const ombytta = andraRad(
    andraRad(exempeltext(), 2, () => '[FORDON]'), 6, () => '[ZONER]',
  );
  await nekaUtanAndring(system, ombytta, 2, /felplacerad sektion/i);
});

test('test_K5_duplicerat_tillfallesnummer', async () => {
  const system = skapaRakneexempel();
  const text = andraRad(exempeltext(), 19, (rad) => rad.replace(/^8;/, '1;'));
  await nekaUtanAndring(system, text, 19, /duplicerat tillfällesnummer/i);
});
