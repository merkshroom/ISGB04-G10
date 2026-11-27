import { Zon } from '../model/Zon.js';
import { Fordon } from '../model/Fordon.js';
import { Parkeringstillfalle } from '../model/Parkeringstillfalle.js';
import { Tidpunkt } from '../model/Tidpunkt.js';
import { Status } from '../model/Status.js';
import { Zontyp } from '../model/zontyper.js';
import { kontrolleraData } from './Datakontroll.js';

export class Parkeringssystem {
  #zoner = [];
  #fordon = [];
  #tillfallen = [];
  #nastaTillfallesnummer = 1;

  get zoner() {
    return [...this.#zoner];
  }

  get fordon() {
    return [...this.#fordon];
  }

  get tillfallen() {
    return [...this.#tillfallen];
  }

  hamtaZon(kod) {
    const normaliseradKod = Zon.valideraKod(kod);
    const zon = this.#zoner.find((zon) => zon.kod === normaliseradKod);
    if (!zon) {
      throw new Error(`Zonen ${normaliseradKod} finns inte.`);
    }
    return zon;
  }

  hamtaFordon(regnr) {
    const normaliseratRegnr = Fordon.valideraRegnr(regnr);
    const fordon = this.#fordon.find((fordon) => fordon.regnr === normaliseratRegnr);
    if (!fordon) {
      throw new Error(`Fordonet ${normaliseratRegnr} finns inte.`);
    }
    return fordon;
  }

  hamtaTillfalle(nr) {
    const tillfalle = this.#tillfallen.find((tillfalle) => tillfalle.nr === nr);
    if (!tillfalle) {
      throw new Error(`Tillfälle ${String(nr)} finns inte.`);
    }
    return tillfalle;
  }

  laggTillZon(kod, gatunamn, zontypkod) {
    const normaliseradKod = Zon.valideraKod(kod);
    if (this.#zoner.some((zon) => zon.kod === normaliseradKod)) {
      throw new Error(`Zonkoden ${normaliseradKod} finns redan.`);
    }
    const zon = new Zon(normaliseradKod, gatunamn, Zontyp.skapa(zontypkod));
    this.#zoner.push(zon);
    return zon;
  }

  laggTillFordon(regnr, beskrivning) {
    const normaliseratRegnr = Fordon.valideraRegnr(regnr);
    if (this.#fordon.some((fordon) => fordon.regnr === normaliseratRegnr)) {
      throw new Error(`Fordonet ${normaliseratRegnr} finns redan.`);
    }
    const fordon = new Fordon(normaliseratRegnr, beskrivning);
    this.#fordon.push(fordon);
    return fordon;
  }

  starta(regnr, zonkod, starttid) {
    const fordon = this.hamtaFordon(regnr);
    const zon = this.hamtaZon(zonkod);
    const pagaende = this.#tillfallen.find((tillfalle) =>
      tillfalle.fordon === fordon && tillfalle.status === Status.PAGAENDE);
    if (pagaende) {
      throw new Error(`Fordonet ${fordon.regnr} har redan ett Pågående tillfälle (nr ${pagaende.nr}).`);
    }
    const start = Tidpunkt.tolkaTidpunkt(starttid);
    const nr = this.#genereraTillfallesnummer();
    const tillfalle = new Parkeringstillfalle(nr, fordon, zon, start);
    this.#tillfallen.push(tillfalle);
    return tillfalle;
  }

  #genereraTillfallesnummer() {
    return this.#nastaTillfallesnummer++;
  }

  avsluta(nr, sluttid) {
    const tillfalle = this.hamtaTillfalle(nr);
    tillfalle.avsluta(Tidpunkt.tolkaTidpunkt(sluttid));
    return tillfalle;
  }

  registreraBetalning(nr) {
    const tillfalle = this.hamtaTillfalle(nr);
    tillfalle.registreraBetalning();
    return tillfalle;
  }

  andraStarttid(nr, starttid) {
    const tillfalle = this.hamtaTillfalle(nr);
    tillfalle.andraStarttid(Tidpunkt.tolkaTidpunkt(starttid));
    return tillfalle;
  }

  andraSluttid(nr, sluttid) {
    const tillfalle = this.hamtaTillfalle(nr);
    tillfalle.andraSluttid(Tidpunkt.tolkaTidpunkt(sluttid));
    return tillfalle;
  }

  andraZon(kod, gatunamn) {
    const zon = this.hamtaZon(kod);
    zon.andraGatunamn(gatunamn);
    return zon;
  }

  andraFordon(regnr, beskrivning) {
    const fordon = this.hamtaFordon(regnr);
    fordon.andraBeskrivning(beskrivning);
    return fordon;
  }

  taBortZon(kod) {
    const zon = this.hamtaZon(kod);
    const obetalt = this.#tillfallen.find((tillfalle) =>
      tillfalle.zon === zon && tillfalle.status !== Status.BETALT);
    if (obetalt) {
      throw new Error(`Zonen ${zon.kod} kan inte tas bort: tillfälle ${obetalt.nr} har status ${obetalt.status}.`);
    }
    const zoner = this.#zoner.filter((befintlig) => befintlig !== zon);
    const tillfallen = this.#tillfallen.filter((tillfalle) => tillfalle.zon !== zon);
    this.#zoner = zoner;
    this.#tillfallen = tillfallen;
  }

  taBortFordon(regnr) {
    const fordon = this.hamtaFordon(regnr);
    const obetalt = this.#tillfallen.find((tillfalle) =>
      tillfalle.fordon === fordon && tillfalle.status !== Status.BETALT);
    if (obetalt) {
      throw new Error(`Fordonet ${fordon.regnr} kan inte tas bort: tillfälle ${obetalt.nr} har status ${obetalt.status}.`);
    }
    const fordonLista = this.#fordon.filter((befintligt) => befintligt !== fordon);
    const tillfallen = this.#tillfallen.filter((tillfalle) => tillfalle.fordon !== fordon);
    this.#fordon = fordonLista;
    this.#tillfallen = tillfallen;
  }

  dygnsrapport(datum) {
    Tidpunkt.valideraDatum(datum);
    const tillfallen = this.#tillfallen.filter((tillfalle) =>
      (tillfalle.status === Status.AVSLUTAT || tillfalle.status === Status.BETALT)
      && Tidpunkt.formateraTidpunkt(tillfalle.slut).slice(0, 10) === datum);
    tillfallen.sort((a, b) => {
      const avgift = b.avgift - a.avgift;
      if (avgift !== 0) return avgift;
      const start = a.start.getTime() - b.start.getTime();
      if (start !== 0) return start;
      const regnrA = a.fordon.regnr;
      const regnrB = b.fordon.regnr;
      if (regnrA < regnrB) return -1;
      if (regnrA > regnrB) return 1;
      return 0;
    });
    const summa = tillfallen.reduce((summa, tillfalle) => summa + tillfalle.avgift, 0);
    return { tillfallen, summa };
  }

  ersattData(data) {
    kontrolleraData(data);
    const zoner = [...data.zoner];
    const fordon = [...data.fordon];
    const tillfallen = [...data.tillfallen];
    const nastaNummer = tillfallen.reduce((hogst, p) => Math.max(hogst, p.nr), 0) + 1;
    this.#zoner = zoner;
    this.#fordon = fordon;
    this.#tillfallen = tillfallen;
    this.#nastaTillfallesnummer = nastaNummer;
  }

  listaTillfallen(regnr) {
    const fordon = this.hamtaFordon(regnr);
    return this.#tillfallen
      .filter((tillfalle) => tillfalle.fordon === fordon)
      .sort((a, b) => a.nr - b.nr);
  }
}
