import { Zontyp } from './Zontyp.js';
import { ZontypA } from './ZontypA.js';
import { ZontypB } from './ZontypB.js';
import { Boende } from './Boende.js';

Zontyp.register.set('A', ZontypA);
Zontyp.register.set('B', ZontypB);
Zontyp.register.set('BOENDE', Boende);

export { Zontyp, ZontypA, ZontypB, Boende };
