export class Zontyp {
  static register = new Map();

  constructor() {
    if (new.target === Zontyp) {
      throw new Error('Zontyp är abstrakt och kan inte skapas direkt.');
    }
  }

  static skapa(zontypkod) {
    const Zontypklass = Zontyp.register.get(zontypkod);
    if (!Zontypklass) {
      throw new Error(`Okänd zontypkod: ${zontypkod}.`);
    }
    return new Zontypklass();
  }

  static listaZontyper() {
    return [...Zontyp.register.keys()];
  }

  dygnsavgift(minuter) {
    throw new Error('Subklassen måste implementera dygnsavgift(minuter).');
  }
}
