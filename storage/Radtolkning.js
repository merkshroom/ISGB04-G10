import { Zon } from '../model/Zon.js';
import { Fordon } from '../model/Fordon.js';
import { Parkeringstillfalle } from '../model/Parkeringstillfalle.js';
import { Tidpunkt } from '../model/Tidpunkt.js';
import { Status } from '../model/Status.js';
import { Zontyp } from '../model/zontyper.js';

export function tolkaDatarad(text, sektion, data) {
  const falt = text.split(';');
  const antalFalt = sektion === 0 ? 3 : sektion === 1 ? 2 : 7;
  if (falt.length !== antalFalt) {
    throw new Error(`Fel antal fält: ${falt.length}, förväntat ${antalFalt}.`);
  }
  if (sektion === 0) laggTillZon(falt, data);
  else if (sektion === 1) laggTillFordon(falt, data);
  else laggTillTillfalle(falt, data);
}

function laggTillZon([kod, gatunamn, zontypkod], data) {
  const normaliseradKod = Zon.valideraKod(kod);
  if (data.zoner.has(normaliseradKod)) {
    throw new Error(`Duplicerad zonkod: ${normaliseradKod}.`);
  }
  const zon = new Zon(normaliseradKod, gatunamn, Zontyp.skapa(zontypkod));
  data.zoner.set(normaliseradKod, zon);
}

function laggTillFordon([regnr, beskrivning], data) {
  const normaliseratRegnr = Fordon.valideraRegnr(regnr);
  if (data.fordon.has(normaliseratRegnr)) {
    throw new Error(`Duplicerat registreringsnummer: ${normaliseratRegnr}.`);
  }
  data.fordon.set(normaliseratRegnr, new Fordon(normaliseratRegnr, beskrivning));
}

function laggTillTillfalle(falt, data) {
  const [nrtext, regnr, zonkod, starttext, sluttext, status, avgifttext] = falt;
  const nr = tolkaHeltal(nrtext, 'tillfällesnummer');
  if (data.nummer.has(nr)) throw new Error(`Duplicerat tillfällesnummer: ${nr}.`);
  const fordon = data.fordon.get(Fordon.valideraRegnr(regnr));
  const zon = data.zoner.get(Zon.valideraKod(zonkod));
  if (!fordon) throw new Error(`Okänt fordon: ${regnr}.`);
  if (!zon) throw new Error(`Okänd zon: ${zonkod}.`);
  const start = tolkaTidpunkt(starttext);
  const slut = sluttext === '-' ? null : tolkaTidpunkt(sluttext);
  const avgift = avgifttext === '-' ? null : tolkaHeltal(avgifttext, 'avgift');
  const tillfalle = Parkeringstillfalle.aterstall(nr, fordon, zon, start, slut, status, avgift);
  if (status === Status.PAGAENDE && data.pagaende.has(fordon)) {
    throw new Error(`Fordonet ${fordon.regnr} har flera Pågående tillfällen.`);
  }
  if (status === Status.PAGAENDE) data.pagaende.add(fordon);
  data.nummer.add(nr);
  data.tillfallen.push(tillfalle);
}

function tolkaHeltal(text, namn) {
  const tal = Number(text);
  if (!/^[0-9]+$/.test(text) || !Number.isInteger(tal) || tal < 0) {
    throw new Error(`Ogiltigt värde för ${namn}: ${text}. Ange ett icke-negativt heltal.`);
  }
  return tal;
}

function tolkaTidpunkt(text) {
  try {
    return Tidpunkt.tolkaTidpunkt(text);
  } catch (fel) {
    if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(text)) {
      throw new Error(`Felaktigt klockslagsformat eller tidpunktsformat: ${text}. ${fel.message}`);
    }
    throw fel;
  }
}
