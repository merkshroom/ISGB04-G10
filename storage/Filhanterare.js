import { Tidpunkt } from '../model/Tidpunkt.js';
import { tolkaDatarad } from './Radtolkning.js';
import { FilformatFel } from './FilformatFel.js';

export { FilformatFel } from './FilformatFel.js';

export class Filhanterare {
  spara(data) {
    const rader = ['PARKERING;1', '[ZONER]'];
    for (const zon of data.zoner) {
      rader.push([zon.kod, zon.gatunamn, zon.zontyp.kod].join(';'));
    }
    rader.push('[FORDON]');
    for (const fordon of data.fordon) {
      rader.push([fordon.regnr, fordon.beskrivning].join(';'));
    }
    rader.push('[TILLFALLEN]');
    for (const p of [...data.tillfallen].sort((a, b) => a.nr - b.nr)) {
      rader.push([
        p.nr, p.fordon.regnr, p.zon.kod, Tidpunkt.formateraTidpunkt(p.start),
        p.slut === null ? '-' : Tidpunkt.formateraTidpunkt(p.slut),
        p.status, p.avgift === null ? '-' : p.avgift,
      ].join(';'));
    }
    return `${rader.join('\n')}\n`;
  }

  async oppna(fil) {
    let text;
    try {
      text = await fil.text();
    } catch (fel) {
      throw new FilformatFel(1, `Filen kunde inte läsas: ${fel.message}`);
    }
    return tolkaFil(text);
  }
}

function tolkaFil(text) {
  const data = {
    zoner: new Map(), fordon: new Map(), tillfallen: [],
    nummer: new Set(), pagaende: new Set(),
  };
  const rader = text.split(/\r?\n/);
  const sektioner = ['[ZONER]', '[FORDON]', '[TILLFALLEN]'];
  let versionLast = false;
  let sektion = -1;
  rader.forEach((rad, index) => {
    if (rad.trim() === '') return;
    try {
      if (!versionLast) {
        kontrolleraVersion(rad);
        versionLast = true;
      } else if (rad.startsWith('[')) {
        sektion = tolkaSektion(rad, sektion, sektioner);
      } else {
        if (sektion === -1) throw new Error('Saknad sektion: [ZONER].');
        tolkaDatarad(rad, sektion, data);
      }
    } catch (fel) {
      throw new FilformatFel(index + 1, fel.message);
    }
  });
  kontrolleraAvslut(versionLast, sektion, rader, sektioner);
  return { zoner: [...data.zoner.values()], fordon: [...data.fordon.values()], tillfallen: data.tillfallen };
}

function kontrolleraVersion(rad) {
  if (rad === 'PARKERING;1') return;
  if (rad.startsWith('PARKERING;')) throw new Error(`Okänd version: ${rad}.`);
  throw new Error('Saknad version: förväntade PARKERING;1.');
}

function tolkaSektion(rad, aktuell, sektioner) {
  const nasta = sektioner.indexOf(rad);
  if (nasta === -1) throw new Error(`Okänd sektion: ${rad}.`);
  if (nasta !== aktuell + 1) throw new Error(`Felplacerad sektion: ${rad}.`);
  return nasta;
}

function kontrolleraAvslut(versionLast, sektion, rader, sektioner) {
  if (!versionLast) throw new FilformatFel(1, 'Saknad version.');
  if (sektion !== sektioner.length - 1) {
    const antalRader = rader.length - (rader.at(-1) === '' ? 1 : 0);
    throw new FilformatFel(antalRader + 1, `Saknad sektion: ${sektioner[sektion + 1]}.`);
  }
}
