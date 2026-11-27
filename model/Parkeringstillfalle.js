import { Status } from './Status.js';
import { Tidpunkt } from './Tidpunkt.js';
import { Fordon } from './Fordon.js';
import { Zon } from './Zon.js';

export class Parkeringstillfalle {
  #nr;
  #fordon;
  #zon;
  #start;
  #slut = null;
  #avgift = null;
  #status = Status.PAGAENDE;

  constructor(nr, fordon, zon, start) {
    if (!Number.isInteger(nr) || nr <= 0) {
      throw new Error(`Ogiltigt tillfällesnummer: ${String(nr)}. Ange ett positivt heltal.`);
    }
    if (!(fordon instanceof Fordon)) {
      throw new Error(`Ogiltigt fordon: ${String(fordon)}. Ett Fordon krävs.`);
    }
    if (!(zon instanceof Zon)) {
      throw new Error(`Ogiltig zon: ${String(zon)}. En Zon krävs.`);
    }
    Tidpunkt.valideraTidsintervall(start, start);
    this.#nr = nr;
    this.#fordon = fordon;
    this.#zon = zon;
    this.#start = new Date(start.getTime());
  }

  static aterstall(nr, fordon, zon, start, slut, status, avgift) {
    const tillfalle = new Parkeringstillfalle(nr, fordon, zon, start);
    if (!Object.values(Status).includes(status)) {
      throw new Error(`Okänd status: ${String(status)}.`);
    }
    if (status === Status.PAGAENDE) {
      if (slut !== null || avgift !== null) {
        throw new Error(`Status ${status} kräver att sluttid och avgift saknas.`);
      }
    } else {
      Tidpunkt.valideraTidsintervall(start, slut);
      if (!Number.isInteger(avgift) || avgift < 0) {
        throw new Error(`Ogiltig avgift: ${String(avgift)} för status ${status}.`);
      }
    }
    tillfalle.#slut = slut === null ? null : new Date(slut.getTime());
    tillfalle.#status = status;
    tillfalle.#avgift = avgift;
    return tillfalle;
  }

  get nr() {
    return this.#nr;
  }

  get fordon() {
    return this.#fordon;
  }

  get zon() {
    return this.#zon;
  }

  get start() {
    return new Date(this.#start.getTime());
  }

  get slut() {
    return this.#slut === null ? null : new Date(this.#slut.getTime());
  }

  get avgift() {
    return this.#avgift;
  }

  get status() {
    return this.#status;
  }

  beraknaAvgift(sluttid) {
    Tidpunkt.valideraTidsintervall(this.#start, sluttid);
    let dygnstart = new Date(this.#start.getTime());
    dygnstart.setUTCHours(0, 0, 0, 0);
    let summa = 0;
    while (dygnstart.getTime() < sluttid.getTime()) {
      const dygnslut = new Date(dygnstart.getTime());
      dygnslut.setUTCDate(dygnslut.getUTCDate() + 1);
      const minuter = (Math.min(sluttid.getTime(), dygnslut.getTime())
        - Math.max(this.#start.getTime(), dygnstart.getTime())) / 60000;
      if (minuter > 0) {
        summa += this.#zon.zontyp.dygnsavgift(minuter);
      }
      dygnstart = dygnslut;
    }
    return summa;
  }

  avsluta(sluttid) {
    if (this.#status !== Status.PAGAENDE) {
      throw new Error(`Tillfälle ${this.#nr} har status ${this.#status} och kan inte avslutas.`);
    }
    const avgift = this.beraknaAvgift(sluttid);
    const slut = new Date(sluttid.getTime());
    this.#slut = slut;
    this.#avgift = avgift;
    this.#status = Status.AVSLUTAT;
  }

  registreraBetalning() {
    if (this.#status !== Status.AVSLUTAT) {
      throw new Error(`Tillfälle ${this.#nr} har status ${this.#status} och kan inte betalas.`);
    }
    this.#status = Status.BETALT;
  }

  andraStarttid(starttid) {
    if (this.#status !== Status.PAGAENDE) {
      throw new Error(`Starttiden kan inte ändras för tillfälle ${this.#nr} med status ${this.#status}.`);
    }
    Tidpunkt.valideraTidsintervall(starttid, starttid);
    this.#start = new Date(starttid.getTime());
  }

  andraSluttid(sluttid) {
    if (this.#status !== Status.AVSLUTAT) {
      throw new Error(`Sluttiden kan inte ändras för tillfälle ${this.#nr} med status ${this.#status}.`);
    }
    const avgift = this.beraknaAvgift(sluttid);
    const slut = new Date(sluttid.getTime());
    this.#slut = slut;
    this.#avgift = avgift;
  }
}
