import { Zon } from '../model/Zon.js';
import { Fordon } from '../model/Fordon.js';
import { Parkeringstillfalle } from '../model/Parkeringstillfalle.js';
import { Status } from '../model/Status.js';

export function kontrolleraData(data) {
  if (!data || !Array.isArray(data.zoner) || !Array.isArray(data.fordon)
    || !Array.isArray(data.tillfallen)) {
    throw new Error('Ogiltiga data: zoner, fordon och tillfällen måste vara listor.');
  }
  kontrolleraUnika(data.zoner, Zon, (zon) => zon.kod, 'zonkod');
  kontrolleraUnika(data.fordon, Fordon, (fordon) => fordon.regnr, 'registreringsnummer');
  kontrolleraUnika(data.tillfallen, Parkeringstillfalle, (p) => p.nr, 'tillfällesnummer');
  const zoner = new Set(data.zoner);
  const fordon = new Set(data.fordon);
  const pagaende = new Set();
  for (const p of data.tillfallen) {
    if (!zoner.has(p.zon) || !fordon.has(p.fordon)) {
      throw new Error(`Tillfälle ${p.nr} refererar till en zon eller ett fordon utanför samlingarna.`);
    }
    if (p.status === Status.PAGAENDE) {
      if (pagaende.has(p.fordon)) {
        throw new Error(`Fordonet ${p.fordon.regnr} har flera Pågående tillfällen.`);
      }
      pagaende.add(p.fordon);
    }
  }
}

function kontrolleraUnika(samling, Typ, identifierare, namn) {
  const identifierareSedda = new Set();
  for (const objekt of samling) {
    if (!(objekt instanceof Typ)) {
      throw new Error(`Ogiltig objekttyp för ${namn}.`);
    }
    const id = identifierare(objekt);
    if (identifierareSedda.has(id)) {
      throw new Error(`Duplicerad identifierare för ${namn}: ${id}.`);
    }
    identifierareSedda.add(id);
  }
}
