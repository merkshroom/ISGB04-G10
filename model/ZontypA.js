import { Zontyp } from './Zontyp.js';

export class ZontypA extends Zontyp {
  kod = 'A';
  #timtaxa = 20;
  #tak = 160;

  dygnsavgift(minuter) {
    if (!Number.isInteger(minuter) || minuter < 1 || minuter > 1440) {
      throw new Error('Minuter måste vara ett heltal mellan 1 och 1440.');
    }
    return Math.min(Math.ceil(minuter / 60) * this.#timtaxa, this.#tak);
  }
}
