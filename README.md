# Parkeringsavgifterna (ISGB04, grupp G10)

Fastighetsbolaget Älvstranden Parkering i Hammarö driver ett tiotal små parkeringsplatser med olika taxor: timtaxa i centrum, lägre timtaxa vid pendlarparkeringen och fast dygnstaxa för boende. Bolaget vill ha ett litet program där vakten kan lägga upp zoner och fordon, registrera parkeringstillfällen med start- och sluttid, få avgiften uträknad enligt bolagets regler, ta fram en dygnsrapport och spara allt till fil.

## Kom igång

Körmiljö: Node.js 22 LTS eller senare.

Starta:

```sh
npm run start
```

Testa:

```sh
npm test
```

## Filformat (K5)

Filerna är textfiler med versionsraden `PARKERING;1`, följd av sektionerna
`[ZONER]`, `[FORDON]` och `[TILLFALLEN]` i den ordningen. Alla sektionsrubriker
ska finnas även när sektionerna är tomma.

Varje datarad använder semikolon som fältavskiljare:

```text
Zon: kod;gatunamn;zontypkod
Fordon: regnr;beskrivning
Tillfälle: nr;regnr;zonkod;start;slut;status;avgift
```

Tidpunkter anges som `ÅÅÅÅ-MM-DD HH:MM`. Avgifter är icke-negativa heltal i
kronor och behålls vid inläsning utan ny beräkning. Saknad sluttid och avgift
skrivs som `-`. Status är `PAGAENDE`, `AVSLUTAT` eller `BETALT`; ett pågående
tillfälle ska sakna både sluttid och avgift. Textfält får inte innehålla
semikolon eller radbrytningar.

Zonkoder och registreringsnummer normaliseras även vid inläsning och som
referenser. Zonkoden `a1` hittar därför `A1`, och `aaa111` hittar `AAA 111`.

Sparade rader avslutas med `\n`. Vid inläsning godtas även `\r\n` och tomma
rader ignoreras. Radnummer räknas från 1 och inkluderar versionsraden och
tomma rader. Fel anges som `Rad N: orsak`.

Inläsningen nekar saknad eller okänd version, saknade, okända eller
felplacerade sektioner, fel antal fält, ogiltiga zon- och fordonsuppgifter,
okänd zontyp, duplicerade identifierare, saknade referenser, ogiltiga tider,
okänd status, sluttid före starttid, ogiltig avgift, värden som inte passar
statusen och flera pågående tillfällen för samma fordon. Systemets befintliga
data ersätts först när hela filen och samlingarna har godkänts. Vid fel
behålls befintliga data.

Exempelfilen [docs/exempel/rakneexempel.txt](docs/exempel/rakneexempel.txt)
innehåller räkneexemplets tre zoner, fyra fordon och åtta tillfällen.

### Versionshistorik

- Version 1: `PARKERING;1`, med lagrade avgifter och referenser via identifierare.
