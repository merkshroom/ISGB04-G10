# Design – Parkeringsavgifterna (G10)

Version 1.0, 2026-11-13. Lab 2 del B. Uppdateras när designen ändras (ÄB1).

## 1. Språk, ramverk och kommandon

Språk och version: JavaScript (ECMAScript 2022+), React 19, Node.js 22 LTS eller senare. Testramverk: Vitest och React Testing Library

Starta: npm run start Testa: npm test

## 2. Modulindelning

| Modul/paket | Innehåll | Får importera |
| --- | --- | --- |
| model/ | Entiteter, tillstånd, regler, varianter (K1–K3) och avgiften i K4 (Parkeringstillfällen.Beräkna_avgift) | – |
| logic/ | Dygnsrapport i K4 (Parkeringssystem) | model |
| storage/ | Filformat K5 | model |
| ui/ | Gränssnitt K6 – ingen affärslogik (AK6.3) | model, logic, storage |
| tests/ | Tester | alla |

## 3. Klassdiagram (K1–K3, K6)

`App` är en React-komponent som använder `Parkeringssystem` och `Filhanterare` samt listar zontyper genom `Zontyp`.

`Parkeringssystem` består av 0..* zoner, 0..* fordon och 0..* parkeringstillfällen. Varje sådan instans hör till ett system. Systemet använder hjälpmodulen `Tidpunkt` och skapar zontyper genom `Zontyp`.

Varje `Parkeringstillfälle` hör till exakt ett `Fordon` och exakt en `Zon`, använder `Tidpunkt` och har ett värde ur enumerationen `Status`: `PAGAENDE`, `AVSLUTAT` eller `BETALT`. Ett fordon och en zon kan vardera ha 0..* parkeringstillfällen. Ett fordon får ha maximalt ett pågående parkeringstillfälle. Slut och avgift är `null` vid pågående parkering.

Varje `Zon` har exakt en `Zontyp`; en zontyp kan användas av 0..* zoner. `Zontyp` är en abstrakt basklass. `ZontypA`, `ZontypB` och `Boende` ärver `Zontyp`. `Pendlarzon` visas som en framtida variant med framtida arv från `Zontyp`.

`Filhanterare` använder `Zon`, `Fordon`, `Parkeringstillfälle`, `Zontyp` och `Tidpunkt`. Dess publika metoder är `spara(data)` och `oppna(fil)`.

Attributen är privata i diagrammet utom `Zontyp.kod`, som är publik. Metoderna är publika utom `Parkeringssystem.genereraTillfallesnummer()`, som är privat. De understrukna medlemmarna är statiska: `Zon.valideraKod(kod)`, `Zon.valideraGatunamn(gatunamn)`, `Fordon.valideraRegnr(regnr)`, `Fordon.valideraBeskrivning(beskrivning)`, `Parkeringstillfälle.aterstall(nr, fordon, zon, start, slut, status, avgift)`, `Zontyp.register`, `Zontyp.skapa(zontypkod)` och `Zontyp.listaZontyper()`.

Diagrammet visar även `Parkeringssystem.listaTillfallen(regnr)` samt `Parkeringstillfälle.andraStarttid(starttid)` och `Parkeringstillfälle.andraSluttid(sluttid)`. `Zontyp` har attributet `kod: string`. Subklassernas koder är `A` för `ZontypA`, `B` för `ZontypB`, `BOENDE` för `Boende` och `PENDLAR` för den framtida varianten `Pendlarzon`.

Returtyper som anges i diagrammet är `Date` för `Tidpunkt.tolkaTidpunkt(text)`, `string` för `Tidpunkt.formateraTidpunkt(tidpunkt)`, `Zontyp` för `Zontyp.skapa(zontypkod)` samt `number` för `Parkeringstillfälle.beraknaAvgift(sluttid)` och samtliga `dygnsavgift(minuter)`. Klasser, attribut, metoder och relationer återges i tabellen nedan.

Diagrammet anger dessutom returtypen `string` för `Filhanterare.spara(data)`, `Promise<Parkeringsdata>` för `Filhanterare.oppna(fil)` och `string[]` för `Zontyp.listaZontyper()`.

Samma klasser i text. Kodagenten kan inte läsa en bild, så det är den här tabellen den följer:

| Klass | Attribut | Metoder | Relationer (multiplicitet, arv/gränssnitt) |
| --- | --- | --- | --- |
| App |  | React-komponent | Använder Parkeringsystem och Filhanterare |
| Filhanterare |  | spara(),<br>öppna() | Använder Fordon, Zon, Parkeringstillfälle, Zontyp och Tidpunkt |
| Parkeringssystem | zoner: Zon[]<br>fordon: Fordon[]<br>tillfallen: Parkeringstillfalle[] | laggTillZon(kod, gatunamn, zontypkod) <br>laggTillFordon(regnr, beskrivning) <br>hamtaZon(kod) <br>hamtaFordon(regnr) <br>hamtaTillfalle(nr) <br>starta(regnr, zonkod, starttid) <br>avsluta(nr, sluttid) <br>registreraBetalning(nr) <br>dygnsrapport(datum) <br>ersattData(data) <br>genereraTillfallesnummer()<br>andraZon(kod, gatunamn)<br>andraFordon(regnr, beskrivning)<br>taBortZon(kod)<br>taBortFordon(regnr)<br>andraStarttid(nr, starttid)<br>andraSluttid(nr, sluttid) | Har 0..* Zon, 0..* Fordon och 0..* Parkeringstillfälle. Använder Tidpunkt och Zontyp. |
| Zon | kod: string <br>gatunamn: string <br>zontyp: Zontyp | constructor(kod, gatunamn, zontyp) <br>valideraKod(kod)  valideraGatunamn(gatunamn)<br>andraGatunamn(gatunamn) | Har 1 Zontyp och 0..* Parkeringstillfälle. |
| Fordon | regnr: string <br><br> beskrivning: string | constructor(regnr, beskrivning) <br>valideraRegnr(regnr) <br>valideraBeskrivning(beskrivning)<br>andraBeskrivning(beskrivning) | Har 0..* Parkeringstillfälle, varav maximalt ett med status Pågående. |
| Parkeringstillfälle | nr: number <br>fordon: Fordon <br>zon: Zon <br>start: Date <br>slut: Date eller null <br>avgift: number eller null <br>status: Status | constructor(nr, fordon, zon, start) <br>avsluta(sluttid) <br>registreraBetalning() <br>beraknaAvgift(sluttid) <br>aterstall(nr, fordon, zon, start, slut, status, avgift) | Hör till exakt 1 Fordon och 1 Zon. Har 1 Status. Använder Tidpunkt. |
| Tidpunkt |  | tolkaTidpunkt(text)<br>formateraTidpunkt(tidpunkt) <br>valideraDatum(datum) <br>valideraTidsintervall(start, slut) | Hjälpmodul som används av Parkeringssystem, Parkeringstillfälle och Filhanterare. |
| Status | PAGAENDE AVSLUTAT <br>BETALT | - | Enumeration som används av Parkeringstillfälle. |
| Zontyp | register: Map (zontypkod → klass) | skapa(zontypkod) <br>dygnsavgift(minuter)<br>listaZontyper() | Abstrakt basklass för samtliga zontyper. |
| ZontypA | timtaxa = 20 <br>tak = 160 | dygnsavgift(minuter) | Ärver Zontyp |
| ZontypB | timtaxa = 10 <br>tak = 240 | dygnsavgift(minuter) | Ärver Zontyp |
| Boende | dygnstaxa = 30 | dygnsavgift(minuter) | Ärver Zontyp |
| Pendlarzon | timtaxa = 5 <br>tak = 40 | dygnsavgift(minuter) | Ärver Zontyp. Visar utökningspunkten och implementeras först när beställaren begär det. |

Utökningspunkt för en ny variant (AK3.3): Pendlarzon läggs till i model/ som en ny klass som ärver Zontyp och har en egen Dygnsavgift() (5 kr per påbörjad timme, tak 40 kr). En rad läggs till i Zontyps register: PENDLAR → Pendlarzon. Filhanterare och Meny hittar zontypen via registret. Zontyp A, ZontypB, Boende, Parkeringstillfällen, Parkeringssystem, Filhanterare och Meny behöver inte ändras.

## 4. Modulkontrakt (minst fem)

| Metod | Förvillkor | Eftervillkor | Vid regelbrott |
| --- | --- | --- | --- |
| Parkeringssystem.starta(regnr, zonkod, starttid) | Fordonet regnr finns. Zonen zonkod finns. Fordonet har inget tillfälle med status Pågående. Starttid är giltig enligt Tidpunkt.tolkaTidpunkt(). | Ett nytt Parkeringstillfälle skapas med ett unikt tillfällesnummer och referenser till fordonet och zonen. Status = Pågående, slut = null och avgift = null. Antalet tillfällen ökar med 1. Returnerar tillfället. | Kastar ett undantag med felmeddelande. Systemet är oförändrat. |
| Parkeringssystem.avsluta(nr, sluttid) | Tillfälle nr finns och har status Pågående. Sluttid är giltig enligt Tidpunkt.tolkaTidpunkt(). Sluttid ≥ starttid. | Tillfället avslutas genom Parkeringstillfalle.avsluta(). Slut = sluttid, avgift = beräknad avgift och status = Avslutat. Returnerar tillfället. | Kastar ett undantag med felmeddelande. Tillfället är oförändrat. |
| Parkeringssystem.registreraBetalning(nr) | Tillfälle nr finns och har status Avslutat. | Betalning registreras genom Parkeringstillfalle.registreraBetalning(). Status = Betalt. Övriga attribut är oförändrade. Returnerar tillfället. | Kastar ett undantag med felmeddelande. Tillfället är oförändrat. |
| Parkeringstillfälle.beraknaAvgift() | Sluttid är ett giltigt Date-objekt. Sluttid ≥ tillfällets starttid. | Returnerar ett icke-negativt heltal i kronor: summan av zonens zontyps dygnsavgift() för varje kalenderdygn med parkeringstid inom intervallet. Tillfället är oförändrat. | Kastar ett undantag med felmeddelande. Tillfället är oförändrat. |
| Zontyp.dygnsavgift(minuter)<br> | Minuter är ett heltal, 1 ≤ minuter ≤ 1440. | Returnerar ett heltal i kronor enligt respektive subklass avgiftsregler. Timtaxezoner: min(⌈minuter/60⌉ × timtaxa, dygnstak). Boende: dygnstaxan. | Kastar ett undantag med felmeddelande. Inget tillstånd ändras. |
| Parkeringssystem.Dygnsrapportt(datum) | Datum är giltigt enligt Tidpunkt.valideraDatum(). | Returnerar ett objekt med tillfällen med status Avslutat eller Betalt vars sluttid ligger på angivet datum, sorterade på avgift fallande, starttid stigande och registreringsnummer stigande, samt summan av avgifterna. Om inga tillfällen finns returneras en tom lista och summan 0. Inga tillfällen ändras. | Kastar ett undantag med felmeddelande vid ogiltigt datum. |
| Filhanterare.oppna(fil) | Filen är läsbar och uppfyller filformatets regler. Samtliga attribut, referenser och tillstånd är giltiga.<br> | Returnerar ett objekt med samlingar av Zon, Fordon och Parkeringstillfälle. Befintliga parkeringstillfällen återskapas genom Parkeringstillfalle.aterstall(). Sparade avgifter bibehålls. Systemets data i minnet ändras inte. | Kastar ett undantag med radnummer och orsak. Data i minnet är oförändrad. |

## 5. Algoritm K4

Pseudokod:

```text
Parkeringstillfalle.beraknaAvgift(sluttid):
    Tidpunkt.valideraTidsintervall(start, sluttid)
    summa ← 0
    dygnstart ← start.datum kl 00:00
    MEDAN dygnstart < sluttid:
        dygnslut ← dygnstart + 1 kalenderdygn
        minuter ← min(sluttid, dygnslut)
                   − max(start, dygnstart), i minuter
        OM minuter > 0:
            summa ← summa + zon.zontyp.dygnsavgift(minuter)
        dygnstart ← dygnslut
    RETURNERA summa
ZontypA / ZontypB.dygnsavgift(minuter):
    OM minuter inte är ett heltal ELLER minuter < 1
       ELLER minuter > 1440:
        KASTA undantag
    timmar ← (minuter + 59) heltalsdivision 60
    RETURNERA min(timmar × timtaxa, tak)
Boende.dygnsavgift(minuter):
    OM minuter inte är ett heltal ELLER minuter < 1
       ELLER minuter > 1440:
        KASTA undantag
    RETURNERA dygnstaxa
Parkeringstillfalle.avsluta(sluttid):
    OM status != PAGAENDE:
        KASTA undantag
    Tidpunkt.valideraTidsintervall(start, sluttid)
    beraknadAvgift ← beraknaAvgift(sluttid)
    slut ← sluttid
    avgift ← beraknadAvgift
    status ← AVSLUTAT
Parkeringssystem.dygnsrapport(datum):
    Tidpunkt.valideraDatum(datum)
    urval ← alla tillfällen där
        status ∈ {AVSLUTAT, BETALT}
        OCH slut.datum == datum
    SORTERA urval på:
        avgift fallande
        start stigande
        fordon.regnr stigande
    summa ← summan av avgifterna i urval
    RETURNERA {tillfallen: urval, summa: summa}
```

Parkeringstillfället delas upp per kalenderdygn. Antalet parkerade minuter inom respektive kalenderdygn beräknas och skickas till zonens zontyps metod dygnsavgift(minuter). Varje dygn beräknas separat enligt zontypens avgiftsregler, varefter dygnsavgifterna summeras.

Avgiftsberäkningen sker oberoende av parkeringstillfällets status och utgår från tillfällets starttid samt den sluttid som skickas som parameter. Metoden ändrar inte tillfällets tillstånd eller lagrade avgift.

Vid avslutande av ett parkeringstillfälle valideras sluttiden och avgiften beräknas innan tillfällets attribut uppdateras. Om valideringen eller avgiftsberäkningen misslyckas förblir tillfället oförändrat. Pågående parkeringstillfällen har ingen lagrad sluttid eller avgift.

Ett parkeringstillfälle som avslutas exakt vid midnatt debiteras inte för det nya kalenderdygnet. Om starttid och sluttid är identiska blir avgiften 0 kr.

Dygnsrapporten omfattar avslutade och betalda parkeringstillfällen vars sluttid ligger på angivet datum. Tillfällena sorteras på avgift i fallande ordning, därefter på starttid och registreringsnummer i stigande ordning. Rapporten innehåller även summan av tillfällenas avgifter. Tidigare lagrade avgifter används utan ny avgiftsberäkning.

## 6. Filformat K5

## 6. Filformat K5

Versionsrad: PARKERING;1.

Sektioner: [ZONER], [FORDON] och [TILLFALLEN], i den ordningen.

Radformat:

Zon: kod;gatunamn;zontypkod

Fordon: regnr;beskrivning

Tillfälle: nr;regnr;zonkod;start;slut;status;avgift

Start- och sluttider anges i formatet ÅÅÅÅ-MM-DD HH:MM. Avgifter anges som icke-negativa heltal i kronor. Om sluttid eller avgift saknas skrivs -. Textfält får inte innehålla semikolon eller radbrytningar.

Tillåtna statusvärden är PAGAENDE, AVSLUTAT och BETALT.

### Exempel

```text
PARKERING;1
[ZONER]
A1;Torggatan;A
B2;Pendlarvägen;B
BO;Strandvägen;BOENDE
[FORDON]
AAA 111;Röd Volvo
[TILLFALLEN]
1;AAA 111;A1;2026-11-24 10:00;2026-11-24 12:00;BETALT;40
7;AAA 111;A1;2026-11-26 07:30;-;PAGAENDE;-
```

### Inläsning

Filhanterare.oppna(fil) ansvarar för att läsa, tolka och validera filens innehåll. Filens data läses in till temporära samlingar av zoner, fordon och parkeringstillfällen.

Zontyper skapas genom Zontyp.skapa(zontypkod). Zoner och fordon skapas genom respektive klass konstruktor, vilket innebär att samma valideringsregler används vid inläsning som vid manuell registrering.

Start- och sluttider tolkas och valideras genom den gemensamma hjälpmodulen Tidpunkt. Parkeringstillfällen återskapas genom Parkeringstillfalle.aterstall(), vilket innebär att sparad status, sluttid och avgift bibehålls utan ny avgiftsberäkning.

Vid inläsning kontrolleras även att samtliga referenser är giltiga, att identifierare är unika och att varje fordon har maximalt ett pågående parkeringstillfälle.

Först när hela filen har lästs och validerats returnerar Filhanterare de temporära samlingarna. Därefter anropas Parkeringssystem.ersattData(data), som kontrollerar samlingarnas giltighet och ersätter systemets befintliga data i sin helhet.

Vid fel under inläsning eller ersättning förblir systemets befintliga data oförändrad.

### Sparning

Filhanterare.spara(data) ansvarar för att serialisera systemets samlingar enligt det definierade filformatet.

Zoner sparas med respektive zontypkod. Parkeringstillfällen sparas med referenser till fordonets registreringsnummer och zonens kod. Tidpunkter formateras genom Tidpunkt.formateraTidpunkt().

Parkeringstillfällenas lagrade avgifter, tillfällesnummer och statusvärden bibehålls. Ingen ny avgiftsberäkning utförs vid sparning.

Sparning ändrar inte systemets data eller tillstånd.

### Felfall (AK5.2–5.4) och radnummer

Raderna räknas från 1. Samtliga rader räknas, inklusive versionsraden och tomma rader. Radnumret i felmeddelandet motsvarar därmed radnumret i en texteditor.

Exempel på felmeddelanden:

AK5.2: ”Rad 9: zonen 'X9' finns inte i filen”.

AK5.3: ”Rad 10: ogiltig tidpunkt 'kl. 10'”.

AK5.4: ”Rad 11: sluttid före starttid”.

Följande ger också fel:

Okänd eller saknad filversion.

Okänd, saknad eller felplacerad sektion.

Fel antal fält.

Ogiltiga fordons- eller zonuppgifter.

Okänd zontypkod.

Dubbletter av registreringsnummer, zonkoder eller tillfällesnummer.

Referenser till fordon eller zoner som saknas.

Ogiltiga start- eller sluttider.

Okända statusvärden.

Sluttid eller avgift som inte överensstämmer med parkeringstillfällets status.

Ogiltig avgift.

Flera pågående parkeringstillfällen för samma fordon.

Vid fel kastas FilformatFel med information om radnummer, där det är tillämpligt, samt orsak. Ingen data returneras från inläsningen och systemets befintliga data påverkas inte.

### Motivering av formatvalet

Raderna är lätta att läsa för en människa och lätta att tolka utan externa bibliotek. Eftersom sektionerna kommer i fast ordning kan referenser till zoner och fordon kontrolleras direkt vid inläsning av parkeringstillfällen.

Genom att använda modellklassernas konstruktorer och valideringsmetoder undviks duplicering av valideringslogik mellan filhanteringen och den manuella registreringen.

Filhanteraren ansvarar endast för tolkning, validering och serialisering av data. Parkeringssystemet ansvarar för att ersätta sitt eget tillstånd. Därmed behöver modulen storage/ inte importera logic/.

Avgiften sparas i filen så att tidigare avgifter inte ändras om avgiftsreglerna ändras. Versionsraden gör det möjligt att utöka formatet och samtidigt behålla stöd för tidigare filversioner.

Version 2 (fylls i vid ÄB1): [nytt fält, standardvärde för version 1-filer]

## 7. Designbeslut och ändringar

| Datum | Beslut/ändring | Varför | Påverkade delar |
| --- | --- | --- | --- |
| 2026-11-17 | Avgiften sparas i filen istället för att räknas om vid inläsning | Gamla avgifter ska inte ändras om en regel ändras (ÄB1 b) | Avsnitt 6, storage |
| 2026-11-17 | Ett tillfälle som slutar 00:00 hamnar i rapporten för sluttidens datum. Beslutet gäller tills beställaren har svarat. | Direktivet anger bara regeln för avgiften, inte för rapportdatumet | Avsnitt 5, beställarbeslut |
|  |  |  |  |

### När designen är klar: textversion för kodagenten

| Det här steget gör TPL åt er – men bara omvandlingen, inte innehållet.<br>1. Klistra in eller ladda upp det här dokumentet hos TPL med uppdraget: ”Här är vår design. Gör om den till markdown ordagrant: samma rubriker, tabeller och formuleringar. Lägg inte till, ta inte bort och förbättra ingenting. Skriv [bild] där klassdiagrammets bild står. Svara bara med markdown-texten.”<br>2. Spara svaret som docs/design.md (ny fil i VS Code, klistra in, spara).<br>3. Läs textversionen mot det här dokumentet. Stämmer något inte: rätta i design.md eller be om en ny omvandling.<br>4. Committa båda filerna och notera omvandlingen i AI-loggen.<br>5. När designen ändras: ändra först här i Word-filen och gör sedan om steg 1–4. |
| --- |

