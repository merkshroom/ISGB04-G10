import { Zontyp } from './Zontyp.js';

export class Boende extends Zontyp {
  kod = 'BOENDE';
  #dygnstaxa = 30;

  dygnsavgift(minuter) {
    if (!Number.isInteger(minuter) || minuter < 1 || minuter > 1440) {
      throw new Error('Minuter måste vara ett heltal mellan 1 och 1440.');
    }
    return this.#dygnstaxa;
  }
}
