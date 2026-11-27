import { Zontyp } from './zontyper.js';

export class Zon {
  #kod;
  #gatunamn;
  #zontyp;

  constructor(kod, gatunamn, zontyp) {
    const normaliseradKod = Zon.valideraKod(kod);
    Zon.valideraGatunamn(gatunamn);
    if (!(zontyp instanceof Zontyp)) {
      throw new Error(`Ogiltig zontyp: ${String(zontyp)}. En Zontyp krävs.`);
    }
    this.#kod = normaliseradKod;
    this.#gatunamn = gatunamn;
    this.#zontyp = zontyp;
  }

  get kod() {
    return this.#kod;
  }

  get gatunamn() {
    return this.#gatunamn;
  }

  get zontyp() {
    return this.#zontyp;
  }

  static valideraKod(kod) {
    const normaliseradKod = typeof kod === 'string' ? kod.toUpperCase() : '';
    if (/^[A-ZÅÄÖ0-9]+$/.exec(normaliseradKod)?.[0] !== normaliseradKod) {
      throw new Error(`Ogiltig zonkod: ${String(kod)}. Ange bokstäver eller siffror utan mellanslag.`);
    }
    return normaliseradKod;
  }

  static valideraGatunamn(gatunamn) {
    if (typeof gatunamn !== 'string' || gatunamn.trim() === ''
      || /[;\r\n]/.test(gatunamn)) {
      throw new Error(`Ogiltigt gatunamn: ${String(gatunamn)}. Ange text utan semikolon eller radbrytning.`);
    }
  }

  andraGatunamn(gatunamn) {
    Zon.valideraGatunamn(gatunamn);
    this.#gatunamn = gatunamn;
  }
}
