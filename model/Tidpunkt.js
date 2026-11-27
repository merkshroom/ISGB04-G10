export class Tidpunkt {
  static tolkaTidpunkt(text) {
    const delar = typeof text === 'string' && text.length === 16
      ? /^(\d{4}-\d{2}-\d{2}) (\d{2}):(\d{2})$/.exec(text)
      : null;
    if (!delar) {
      throw new Error(`Ogiltig tidpunkt: ${String(text)}. Ange ÅÅÅÅ-MM-DD HH:MM.`);
    }
    Tidpunkt.valideraDatum(delar[1]);
    const [ar, manad, dag] = delar[1].split('-').map(Number);
    const timme = Number(delar[2]);
    const minut = Number(delar[3]);
    if (timme > 23 || minut > 59) {
      throw new Error(`Ogiltigt klockslag i tidpunkten: ${text}.`);
    }
    const tidpunkt = new Date(Date.UTC(ar, manad - 1, 1, timme, minut));
    tidpunkt.setUTCFullYear(ar, manad - 1, dag);
    return tidpunkt;
  }

  static formateraTidpunkt(tidpunkt) {
    Tidpunkt.valideraTidsintervall(tidpunkt, tidpunkt);
    const ar = String(tidpunkt.getUTCFullYear()).padStart(4, '0');
    const manad = String(tidpunkt.getUTCMonth() + 1).padStart(2, '0');
    const dag = String(tidpunkt.getUTCDate()).padStart(2, '0');
    const timme = String(tidpunkt.getUTCHours()).padStart(2, '0');
    const minut = String(tidpunkt.getUTCMinutes()).padStart(2, '0');
    return `${ar}-${manad}-${dag} ${timme}:${minut}`;
  }

  static valideraDatum(datum) {
    if (typeof datum !== 'string' || datum.length !== 10
      || !/^\d{4}-\d{2}-\d{2}$/.test(datum)) {
      throw new Error(`Ogiltigt datum: ${String(datum)}. Ange ÅÅÅÅ-MM-DD.`);
    }
    const [ar, manad, dag] = datum.split('-').map(Number);
    const tidpunkt = new Date(Date.UTC(ar, manad - 1, 1));
    tidpunkt.setUTCFullYear(ar, manad - 1, dag);
    if (tidpunkt.getUTCFullYear() !== ar
      || tidpunkt.getUTCMonth() !== manad - 1
      || tidpunkt.getUTCDate() !== dag) {
      throw new Error(`Ogiltigt datum: ${datum}. Datumet finns inte.`);
    }
  }

  static valideraTidsintervall(start, slut) {
    for (const tidpunkt of [start, slut]) {
      if (!(tidpunkt instanceof Date) || !Number.isFinite(tidpunkt.getTime())) {
        throw new Error(`Ogiltig tidpunkt: ${String(tidpunkt)}.`);
      }
    }
    if (slut.getTime() < start.getTime()) {
      throw new Error(`Sluttiden ${Tidpunkt.formateraTidpunkt(slut)} får inte ligga före starttiden ${Tidpunkt.formateraTidpunkt(start)}.`);
    }
  }
}
