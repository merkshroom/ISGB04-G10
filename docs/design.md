# Design – Parkeringsavgifterna (G10)

Version 1.0, 2026-11-13. Lab 2 del B. Uppdateras när designen ändras (ÄB1).

## 1. Språk, ramverk och kommandon

- Språk och version: JavaScript (ECMAScript 2022+), React 19, Node.js 22 LTS eller senare. Testramverk: Vitest och React Testing Library
- Starta: npm run start Testa: npm test

## 2. Modulindelning

| **Modul/paket** | **Innehåll** | **Får importera** |
|---|---|---|
| model/ | Entiteter, tillstånd, regler, varianter (K1–K3) och avgiften i K4 (Parkeringstillfällen.Beräkna_avgift) | – |
| logic/ | Dygnsrapport i K4 (Parkeringssystem) | model |
| storage/ | Filformat K5 | model |
| ui/ | Gränssnitt K6 – ingen affärslogik (AK6.3) | model, logic, storage |
| tests/ | Tester | alla |

## 3. Klassdiagram (K1–K3, K6)

[bild]

Samma klasser i text. Kodagenten kan inte läsa en bild, så det är den här tabellen den följer:

| **Klass** | **Attribut** | **Metoder** | **Relationer (multiplicitet, arv/gränssnitt)** |
|---|---|---|---|
| Meny |  | Kör() | Använder parkeringsystem och Filhanterare |
| Filhanterare |  | Spara(),<br>Öppna() | Använder parkeringssystem |
| Parkeringssystem | Zoner,fordon,tillfallen | Lägg_till_zon()<br>Lägg_till_fordon(),<br>Starta(),<br>Avsluta(),<br>Registrera_betalning(),<br>Dygnsrapport() | Har 0..* Zon, 0..* Fordon, 0..* Parkeringstillfällen |
| Zon | Kod,<br>gatunamn |  | Har 1 Zontyp, har 0..* Parkeringstillfällen |
| Fordon | Regnr,<br>beskrivning |  | Har 0..* Parkeringstillfälle (max 1 Pågående) |
| Parkeringstillfällen | Start,<br>Slut,<br>Avgift,<br>status | Beräkna_avgift() | Hör till 1 Zon och 1 Fordon |
| Status | Pågående,<br>Avslutat,<br>Betalt |  | Används av parkeringstillfälle |
| Zontyp | Register: zontypkod → klass (A, B, BOENDE) | Dygnsavgift(minuter) | Abstrakt basklass för zontyperna |
| Zontyp A | Timtaxa 20, tak 160 | Dygnsavgift() | Ärver Zontyp |
| ZontypB | Timtaxa 10, tak 240 | Dyngsavgift() | Ärver Zontyp |
| Boende | Dygnstaxa 30 | Dygnsavgift() | Ärver Zontyp |
| Pendlarzon | Timtaxa 5, tak 40 | Dygnsavgift(minuter) | Ärver Zontyp. Visar utökningspunkten (streckad i diagrammet) och implementeras först när beställaren begär det. |

Utökningspunkt för en ny variant (AK3.3): Pendlarzon läggs till i model/ som en ny klass som ärver Zontyp och har en egen Dygnsavgift() (5 kr per påbörjad timme, tak 40 kr). En rad läggs till i Zontyps register: PENDLAR → Pendlarzon. Filhanterare och Meny hittar zontypen via registret. Zontyp A, ZontypB, Boende, Parkeringstillfällen, Parkeringssystem, Filhanterare och Meny behöver inte ändras.

## 4. Modulkontrakt (minst fem)

| **Metod** | **Förvillkor** | **Eftervillkor** | **Vid regelbrott** |
|---|---|---|---|
| Parkeringssystem.starta(regnr, zonkod, starttid) | Fordonet regnr finns. Zonen zonkod finns. Fordonet har inget tillfälle med status Pågående. starttid har formatet ÅÅÅÅ-MM-DD HH:MM | Ett nytt tillfälle finns med status pågående, slut = inget och avgift = inget, och det refererar till fordonet och zonen. Antalet tillfällen har ökat med 1. | Kastar ett undantag med felmeddelande. Systemet är oförändrat. |
| Parkeringssystem.avsluta(nr, sluttid) | Tillfälle nr finns och har status Pågående. sluttid ≥ starttid. | slut = sluttid, avgift = tillfällets Beräkna_avgift() och status = Avslutat. | Kastar ett undantag med felmeddelande. Tillfället är oförändrat. |
| Parkeringssystem.registrera_betalning(nr) | Tillfälle nr finns och har status Avslutat. | status = Betalt. Övriga fält är oförändrade. | Kastar ett undantag med felmeddelande. Tillfället är oförändrat. |
| Parkeringstillfällen.Beräkna_avgift() | Tillfället har en sluttid och sluttid ≥ starttid. | Returnerar ett heltal i kr: summan av zonens Dygnsavgift() för varje kalenderdygn som tillfället berör. Tillfället ändras inte. | Kastar ett undantag med felmeddelande. Tillfället är oförändrat. |
| Zontyp.dygnsavgift(minuter) | minuter är ett heltal, 1 ≤ minuter ≤ 1440. | Returnerar ett heltal i kr. Timtaxezoner: min(⌈minuter/60⌉ × timtaxa, dygnstak). Boende: dygnstaxan. | Kastar ett undantag med felmeddelande. Inget tillstånd ändras. |
| Parkeringssystem.Dygnsrapportt(datum) | datum har formatet ÅÅÅÅ-MM-DD. | Returnerar tillfällen med status Avslutat eller Betalt vars sluttid ligger på datum, sorterade på avgift (fallande), starttid och registreringsnummer, samt summan. Om det inte finns några blir det en tom lista och summan 0. Inga tillfällen ändras. | Kastar ett undantag med felmeddelande vid ogiltigt datum. |
| Filhanterare.öppna(sökväg) | Filen finns och är läsbar. | Om hela filen är giltig ersätts systemets data med filens innehåll. | Kastar ett undantag med radnummer och orsak. Data i minnet är oförändrad. |

## 5. Algoritm K4

**Pseudokod:**

```
Parkeringstillfällen.Beräkna_avgift()
    OM status == Pågående: RETURNERA inget                            // regel 4
    summa ← 0
    dygnstart ← start.datum kl 00:00
    MEDAN dygnstart < slut                                             // regel 1
        dygnslut ← dygnstart + 1 dygn
        minuter ← min(slut, dygnslut) − max(start, dygnstart), i minuter
        OM minuter > 0:
            summa ← summa + zon.zontyp.Dygnsavgift(minuter)            // regel 2
        dygnstart ← dygnslut
    RETURNERA summa

Zontyp A / ZontypB.Dygnsavgift(minuter):
    timmar ← (minuter + 59) heltalsdivision 60
    RETURNERA min(timmar × timtaxa, tak)
Boende.Dygnsavgift(minuter):
    RETURNERA dygnstaxa

Parkeringssystem.Dygnsrapport(datum)                                   // regel 3–4
    urval ← alla tillfällen där status ∈ {Avslutat, Betalt} OCH slut.datum == datum
    sortera urval på (avgift fallande, start stigande, regnr stigande)
    RETURNERA urval, summan av avgifterna i urval
```

Tillfället delas upp per kalenderdygn. Varje dygn räknas för sig, och sedan läggs dygnen ihop.

**Tillfälle 1** A1: 120 min = 2 timmar × 20 kr = **40 kr** 

**Tillfälle 2** A1: 690 min = 12 timmar × 20 kr = 240 kr, men dygnstaket ger **160 kr** 

**Tillfälle 3** B2: den 24/11 90 min = 2 timmar = 20 kr, den 25/11 75 min = 2 timmar = 20 kr, totalt **40 kr**

**Tillfälle 4** Boende: berör 3 dygn × 30 kr = **90 kr** 

**Tillfälle 5** B2: 240 min = 4 timmar × 10 kr = **40 kr** 

**Tillfälle 6** Boende: 1 dygn = **30 kr**. Det slutar 00:00, så den 26/11 räknas inte 

**Tillfälle 7**: pågår fortfarande och har därför **ingen avgift** 

**Tillfälle 8** A1: 70 min = 2 timmar × 20 kr = **40 kr** 

Dygnsrapport 2026-11-24: tillfälle 1, 2, 5 och 8 avslutades den 24/11. Sorterat på avgift och vid lika avgift på starttid: BBB 222 (160 kr), CCC 333 (40 kr), AAA 111 (40 kr), AAA 111 (40 kr). Summa 280 kr

**Resultat = direktivets facit:** Algoritmen ger samma avgifter och samma rapport som facit, så ingenting behövde justeras.

## 6. Filformat K5

**Versionsrad:** PARKERING;1. **Sektioner:** [ZONER], [FORDON] och [TILLFALLEN], i den ordningen.

**Radformat:** 

Zon: kod;gatunamn;zontypkod (t.ex. A1;Torggatan;A). 

Fordon: regnr;beskrivning (t.ex. AAA 111;Röd Volvo). 

Tillfälle: nr;regnr;zonkod;start;slut;status;avgift (t.ex. 1;AAA 111;A1;2026-11-24 10:00;2026-11-24 12:00;BETALT;40). 

Om sluttid eller avgift saknas skrivs -. Textfälten får inte innehålla ;.

Exempel:

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

**Fel fall (AK5.2–5.4) och hur radnummer rapporteras:** Raderna räknas från 1, och alla rader räknas, även versionsraden och tomma rader. Då stämmer numret med radnumret i en texteditor. AK5.2: "Rad 9: zonen 'X9' finns inte i filen". AK5.3: "Rad 10: ogiltig tidpunkt 'kl. 10'". AK5.4: "Rad 11: sluttid före starttid". Fel antal fält, okänd version, okänd zon typ, okänd sektion och dubbletter ger också fel. Hela filen tolkas till temporära listor och ersätter datan i minnet först när hela filen är giltig. Vid fel kastas Filformat Fel, och datan i minnet påverkas inte.

**Motivering av formatvalet:** Raderna är lätta att läsa för en människa och lätta att tolka utan bibliotek. Eftersom sektionerna kommer i fast ordning kan referenser till zoner och fordon kontrolleras direkt på tillfällesraden. Avgiften sparas i filen, så att gamla avgifter inte ändras om en regel ändras. Versionsraden gör det möjligt att utöka formatet och ändå kunna läsa filer i version 1.

**Version 2 (fylls i vid ÄB1):** [nytt fält, standardvärde för version 1-filer]

## 7. Designbeslut och ändringar

| **Datum** | **Beslut/ändring** | **Varför** | **Påverkade delar** |
|---|---|---|---|
| 2026-11-17 | Avgiften sparas i filen istället för att räknas om vid inläsning | Gamla avgifter ska inte ändras om en regel ändras (ÄB1 b) | Avsnitt 6, storage |
| 2026-11-17 | Ett tillfälle som slutar 00:00 hamnar i rapporten för sluttidens datum. Beslutet gäller tills beställaren har svarat. | Direktivet anger bara regeln för avgiften, inte för rapportdatumet | Avsnitt 5, beställarbeslut |
|  |  |  |  |

## När designen är klar: textversion för kodagenten

| **Det här steget gör TPL åt er – men bara omvandlingen, inte innehållet.**<br>1. Klistra in eller ladda upp det här dokumentet hos TPL med uppdraget: ”Här är vår design. Gör om den till markdown ordagrant: samma rubriker, tabeller och formuleringar. Lägg inte till, ta inte bort och förbättra ingenting. Skriv [bild] där klassdiagrammets bild står. Svara bara med markdown-texten.”<br>2. Spara svaret som docs/design.md (ny fil i VS Code, klistra in, spara).<br>3. Läs textversionen mot det här dokumentet. Stämmer något inte: rätta i design.md eller be om en ny omvandling.<br>4. Committa båda filerna och notera omvandlingen i AI-loggen.<br>5. När designen ändras: ändra först här i Word-filen och gör sedan om steg 1–4. |
|---|
