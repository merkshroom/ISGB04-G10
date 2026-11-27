export class FilformatFel extends Error {
  constructor(rad, orsak) {
    super(`Rad ${rad}: ${orsak}`);
    this.name = 'FilformatFel';
    this.rad = rad;
    this.orsak = orsak;
  }
}
