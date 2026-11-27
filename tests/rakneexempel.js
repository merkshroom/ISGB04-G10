import { Parkeringssystem } from '../logic/Parkeringssystem.js';

export function skapaRakneexempel(ordning = [1, 2, 3, 4, 5, 6, 7, 8]) {
  const system = new Parkeringssystem();
  system.laggTillZon('A1', 'Torggatan', 'A');
  system.laggTillZon('B2', 'Pendlarvägen', 'B');
  system.laggTillZon('BO', 'Strandvägen', 'BOENDE');
  for (const regnr of ['AAA 111', 'BBB 222', 'CCC 333', 'DDD 444']) {
    system.laggTillFordon(regnr, 'Röd Volvo');
  }
  laggTillTillfallen(system, ordning);
  return system;
}

function laggTillTillfallen(system, ordning) {
  const rader = [
    ['AAA 111', 'A1', '2026-11-24 10:00', '2026-11-24 12:00', 'BETALT'],
    ['BBB 222', 'A1', '2026-11-24 09:15', '2026-11-24 20:45', 'BETALT'],
    ['CCC 333', 'B2', '2026-11-24 22:30', '2026-11-25 01:15', 'AVSLUTAT'],
    ['DDD 444', 'BO', '2026-11-24 18:00', '2026-11-26 09:00', 'AVSLUTAT'],
    ['AAA 111', 'B2', '2026-11-24 13:00', '2026-11-24 17:00', 'BETALT'],
    ['CCC 333', 'BO', '2026-11-25 23:00', '2026-11-26 00:00', 'AVSLUTAT'],
    ['AAA 111', 'A1', '2026-11-26 07:30', null, 'PAGAENDE'],
    ['CCC 333', 'A1', '2026-11-24 07:00', '2026-11-24 08:10', 'BETALT'],
  ];
  for (const originalnummer of ordning) {
    const [regnr, zonkod, start, slut, status] = rader[originalnummer - 1];
    const tillfalle = system.starta(regnr, zonkod, start);
    if (slut !== null) {
      system.avsluta(tillfalle.nr, slut);
    }
    if (status === 'BETALT') {
      system.registreraBetalning(tillfalle.nr);
    }
  }
}
