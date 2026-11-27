export class Fordon {
  #regnr;
  #beskrivning;

  constructor(regnr, beskrivning) {
    const normaliseratRegnr = Fordon.valideraRegnr(regnr);
    Fordon.valideraBeskrivning(beskrivning);
    this.#regnr = normaliseratRegnr;
    this.#beskrivning = beskrivning;
  }

  get regnr() {
    return this.#regnr;
  }

  get beskrivning() {
    return this.#beskrivning;
  }

  static valideraRegnr(regnr) {
    const versaler = typeof regnr === 'string' ? regnr.toUpperCase() : '';
    const delar = /^([A-Z]{3}) ?([0-9]{3})$/.exec(versaler);
    if (!delar || delar[0] !== versaler) {
      throw new Error(`Ogiltigt registreringsnummer: ${String(regnr)}. Ange tre bokstäver och tre siffror, till exempel AAA 111.`);
    }
    return `${delar[1]} ${delar[2]}`;
  }

  static valideraBeskrivning(beskrivning) {
    if (typeof beskrivning !== 'string' || beskrivning.trim() === ''
      || /[;\r\n]/.test(beskrivning)) {
      throw new Error(`Ogiltig beskrivning: ${String(beskrivning)}. Ange text utan semikolon eller radbrytning.`);
    }
  }

  andraBeskrivning(beskrivning) {
    Fordon.valideraBeskrivning(beskrivning);
    this.#beskrivning = beskrivning;
  }
}
