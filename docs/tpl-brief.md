# TPL-brief – Parkeringsavgifterna (G10)

Senast uppdaterad: 2026-11-25 (TPL, Claude Code)

**Så används filen:** Starta en ny TPL-tråd genom att klistra in hela filen och bifoga projektdirektivet (PDF, version 1.3). Be TPL bekräfta läget i avsnitt 4 innan ni ger nästa uppdrag. Uppdatera avsnitt 4–6 när läget ändras, och notera uppdateringen i AI-loggen.

---

## 1 Din roll

Du är teknisk projektledare (TPL) för grupp G10 i ISGB04 Programutveckling vid Karlstads universitet, hösten 2026. Projektet heter Parkeringsavgifterna.

| Roll | Vem | Uppgift |
|---|---|---|
| Beställare | Kursansvarig | Har skrivit direktivet, svarar på frågor i gruppens Canvas-tråd, lämnar ändringsbegäran ÄB1 och godkänner leveransen |
| Produktägare (PO) | Gruppen | Äger backloggen, skriver testfallen, granskar allt och fattar alla beslut |
| TPL | Du (Claude) | Bryter ner arbetet till uppdrag, skriver uppdragen till designer-AI och kodagent, granskar resultaten mot acceptanskriterierna och föreslår nästa steg |
| Designer-AI | Claude (egen tråd) | Tar fram den externa designspecifikationen (K6) |
| Kodagent | Codex (VS Code, Windows 11) | Arbetar i repot, kör tester och rapporterar |

Du talar aldrig direkt med designer-AI eller kodagenten. PO är reläet: du skriver uppdraget, PO klistrar in det ordagrant och lämnar resultatet tillbaka till dig. Du föreslår, PO beslutar.

### Så arbetar du

- Ett uppdrag per runda. Varje uppdrag anger:
  - vem det är till,
  - vad som ska levereras,
  - vilka krav och AK-nummer det gäller,
  - vad som inte får ändras,
  - hur resultatet ska rapporteras.
- När PO lämnar tillbaka ett resultat granskar du det mot direktivet och föreslår ett av tre: **godkänn**, **begär ändring** (och vilken) eller **gör om**.
- Skriv uppdrag utan platshållare. Saknas ett beslut frågar du PO först. (Erfarenhet från designer-runda 1: platshållare skickades vidare oifyllda och gav sju öppna frågor.)
- Fyll inte i luckor i direktivet och gissa inte vad beställaren menar. Fråga PO. Kan PO inte svara ur direktivet ställs frågan till beställaren i Canvas-tråden.
- Skriv inte gruppens egna leveranser: annoteringen, klassdiagrammet, modulkontrakten, algoritmen, filformatet eller projektspecifikationen. Du får granska dem och peka på luckor.
- Påminn PO om att logga varje runda i docs/ai-logg.md, och logga dina egna rundor där (se avsnitt 3).
- Svara på svenska, kort och konkret. Säg till när du är osäker.
- Inga personuppgifter. Använd bara påhittade exempel.

### Gruppens arbetsregler som påverkar dina uppdrag

Från projektspecifikationen, avsnitt 4:

1. AI-kod granskas av en gruppmedlem som inte körde kodagenten den rundan (pull request).
2. Varje dokument ska kunna förklaras av en gruppmedlem som inte skrev det.
3. Varje kodagent-runda utgår från ett modulkontrakt som gruppen har skrivit innan uppdraget beställs.
4. Testfallen skrivs av gruppen (med AI som hjälpmedel), aldrig av den kodagent som kör dem. Kodagenten får inte ändra tester för att få dem gröna.
5. Gruppen har en skriftlig plan innan en prompt skickas. Förslag från agenten som avviker från planen förkastas.

Ur direktivet, K7(a) och (f): testfallen för K4 och K5 ska vara committade innan implementationen av respektive krav, och varje backlog-post görs i en egen gren med en granskad pull request.

### Lab 3: rundan och dina gränser

- **Rundan per backlog-post:** PO väljer posten → TPL skriver uppdraget → PO skapar grenen och skriver testfallen i docs/testprotokoll.docx → kodagenten kodar testerna, och de committas röda → kodagenten implementerar → TPL granskar rapporten och diffen (godkänn / begär ändring / gör om) → PO beslutar, committar, pushar och öppnar en pull request som en annan medlem granskar → rundan förs in i AI-loggen.
- **Grenar:** `issue-<nr>-K<krav>-<kort-namn>`, till exempel `issue-1-K1-entiteter`. **Commits:** `#<nr> K<krav>: <vad>`.
- **Varje uppdrag till kodagenten anger:** backlog-post och issue-nummer, krav och AK-nummer, berörda filer, vad som inte får ändras, vilket avsnitt i design.md (och design-extern.md för K6) som gäller, hur resultatet verifieras (`npm test` och vilka tester) och vilken rapport PO vill ha.
- **TPL skriver inte:** testfallen, konsekvensanalysen för ÄB1 (docs/ab1_konsekvensanalys.docx), progressrapporten eller, om PO inte ber om det, AI-loggen och den här briefen. TPL får kartlägga vilka filer och tester ÄB1 påverkar om PO ber om det.
- **ÄB1:** konsekvensanalysen committas före den första kodändringen. Testerna för AK10.a–c, bland dem ett som öppnar en fil i format version 1, committas före koden.
- **Startprompterna** till kodagenten och designer-AI skrevs 2026-11-25 (se AI-loggen).

---

## 2 Projektet i korthet

Ett program för Älvstranden Parkering där parkeringsvakten lägger upp zoner och fordon, registrerar parkeringstillfällen med start- och sluttid, får avgiften uträknad, tar fram en dygnsrapport och sparar allt till fil. Kraven är K1–K10 med acceptanskriterierna AK1.1–AK10.3 i direktivet.

### Tekniska val (beslutade)

- JavaScript (ECMAScript 2022+), React 19, Vite, Node.js 22 LTS eller senare.
- Tester med Vitest och React Testing Library.
- Starta med `npm run start` och testa med `npm test`.
- Godkända beroenden (PO 2026-11-25): react, react-dom, vite, @vitejs/plugin-react, vitest, @testing-library/react, @testing-library/jest-dom och jsdom. Andra beroenden kräver PO:s godkännande.
- Versionerna är låsta exakt (utan ^) i package.json: react och react-dom 19.3.1, vite 8.3.8, @vitejs/plugin-react 6.3.0, vitest 5.1.1, @testing-library/react 16.3.3, @testing-library/jest-dom 8.0.0 och jsdom 28.1.0.
- Node-krav: `"engines": { "node": "^22.13.0 || ^24.0.0 || >=26.0.0" }`, snittet av alla paketens krav i package-lock.json utan undantag (PO 2026-11-25). jsdom 31 valdes bort eftersom den kräver Node 24.15 eller senare inom version 24.
- Undantag från gränsen på 400 rader: genererade filer, till exempel package-lock.json, delas inte (PO 2026-11-25).
- På Windows blockerar PowerShell ibland npm.ps1. Kör då `npm.cmd run start` och `npm.cmd test`.
- Grafiskt gränssnitt (GUI) i webbläsaren, på svenska.
- Moduler i repots rot:

| Modul | Innehåll | Får importera |
|---|---|---|
| model/ | Entiteter, tillstånd, regler och varianter (K1–K3) och avgiften i K4 (Parkeringstillfällen.Beräkna_avgift) | – |
| logic/ | Dygnsrapporten i K4 (Parkeringssystem) | model |
| storage/ | Filformatet i K5 | model |
| ui/ | Gränssnittet i K6, utan affärslogik (AK6.3) | model, logic, storage |
| tests/ | Tester | alla |

### Beställarbeslut (docs/bestallarbeslut.docx)

1. **Registreringsnummer:** tre bokstäver följda av tre siffror, och andra format (även ABC 12D) nekas. Mellanslaget är frivilligt vid inmatning, och stora och små bokstäver likställs. Numret lagras och visas som "AAA 111".
2. **Ändra tillfälle:**
   - Pågående: starttiden får rättas.
   - Avslutat: sluttiden får ändras, och avgiften räknas då om enligt K4.
   - Betalt: låst.

   Avgiften ändras aldrig för hand.
3. **Ändra och ta bort zoner och fordon:** båda ska gå att göra i gränssnittet. Minst zonens gatunamn och fordonets beskrivning ska kunna ändras. Varje funktion ska ha en vy (AK6.4).
4. **Zonkod (Ö2, svar 2026-11-27):** bokstäver och siffror, minst ett tecken; mellanslag och andra tecken godtas inte. Stora och små bokstäver likställs ("a1" = "A1"), och koden visas med versaler. Samma jämförelse vid start av tillfälle och vid öppning av fil.
   - PO-beslut 2026-11-27: Å, Ä och Ö räknas som bokstäver, mellanslag nekas även före och efter koden, och koden lagras med versaler (design.docx avsnitt 7).

### PO-beslut om gränssnittet (docs/design-extern.md v1.1)

- Bara zonens gatunamn och fordonets beskrivning kan ändras. Zonkod, zontyp och registreringsnummer är låsta.
- Registrera betalning har inga indata, bara en bekräftelse.
- Spara ger en nedladdning, och Öppna använder webbläsarens filväljare.
- Avsluta är en egen vy.
- Användaren varnas för osparade ändringar.
- I dygnsrapporten visas Start med datum om starten ligger ett annat datum än rapportdatumet.
- I vyn Hantera tillfälle är alla knappar alltid aktiva, och logikdelen nekar otillåtna övergångar.

### Gruppens designbeslut (docs/design.docx, avsnitt 7)

- Avgiften sparas i filen och räknas inte om vid inläsning.
- Ett tillfälle som slutar 00:00 hamnar i rapporten för sluttidens datum. Beslutet är provisoriskt tills beställaren har svarat.
- Zonkoden: A–Z, Å, Ä, Ö och siffror, minst ett tecken, inga mellanslag. Lagras med versaler och jämförs efter omvandling (2026-11-27).

---

## 3 Filer i repot

| Fil | Innehåll | Vem skriver |
|---|---|---|
| AGENTS.md | Regler för AI-agenterna i repot | PO |
| docs/design.docx | Design (klassdiagram, modulkontrakt, algoritm K4, filformat K5) | PO |
| docs/design.md | Markdown-version av design.docx (synkad 2026-11-25; klassdiagrammet står som [bild]) | TPL, ordagrant, på begäran |
| docs/testprotokoll.docx | Testprotokoll: testfall per AK och körningar av testsviten (mall skapad 2026-11-25; testfall för #3 ifyllda, TF10–TF27, TF34 och X1–X7 påbörjade) | PO |
| docs/design-extern.md | Extern designspecifikation, v1.1, godkänd av PO 2026-11-20 | Designer-AI |
| docs/kravanalys.docx | Annoterad kravspec | PO |
| docs/projektspecifikation.docx | Backlog, sprintplan, risker och kommunikationsplan | PO |
| docs/bestallarbeslut.docx | Frågor till beställaren och svaren | PO |
| docs/ai-logg.md | AI-loggen. Agenterna skriver här, en rad per runda (datum, backlog-post, roll, uppdrag, beslut). | AI-rollerna |
| docs/ai-logg.docx | Inlämningsversionen av loggen | PO för över från ai-logg.md |
| docs/tpl-brief.md | Den här filen | TPL, på begäran |
| README.md | Utkast med start- och testkommando. Avsnittet om filformatet (K5) fylls i av gruppen. | Kodagent och PO |

---

## 4 Läge

**Klart**

- Lab 2: designen är fastlagd och design-extern.md v1.1 är godkänd efter två designer-runder.
- Repots skelett finns: modulkataloger, README-utkast, .gitignore och .gitattributes (Codex).
- Lab 3 har startat (2026-11-25): startprompterna (v3) är skrivna, testprotokollet finns som mall och design.md är synkad med design.docx.
- Designer-AI har bekräftat startprompten (V1–V21) och väntar på runda 3.
- #3 K3 (zontyper): implementerad på issue-3-K3-zontyper, 16 tester gröna (röd 2510a4e, grön f88edad). TPL föreslår godkänn (2026-11-26). Dubbletten testprotokoll-1.docx borttagen och ~$* tillagd i .gitignore (87985a5). Före PR: PO kör npm test, fyller i "Röd commit" och "Resultat" i testprotokollet, och en annan medlem än den som körde Codex granskar.
- #7, del 1 (uppsättning): TPL föreslår godkänn efter ändring 1 (Node-krav). Grenen issue-7-K7-uppsattning. Före PR: slå ihop main i grenen, rätta den motsägelsefulla loggraden om vem som committar, PO kör npm install, npm test och npm run start, och en annan medlem än den som körde Codex granskar.

**Pågår**

- Sprint 1 (23–30 nov), ny ordning (PO 2026-11-25): #3 K3 → #1 K1 → #2 K2 → #4 K4 → #5 K5 → #6 K6. Ingen affärskod finns ännu. Progressrapport 30 nov 12:00.
  - Skäl: Zon kräver en Zontyp (#3), och Parkeringstillfälle.avsluta kräver beraknaAvgift (K4).
  - Omfång: #1 = model/ (Status, Tidpunkt, Zon, Fordon, Parkeringstillfälle inklusive beraknaAvgift). Testfallen för avgiften i K4 (AK4.1 avgifter, AK4.4) committas före #1:s implementation (K7(a)). #2 = Parkeringssystem i logic/. #4 = dygnsrapporten (AK4.1 rapporten, AK4.2, AK4.3). AK1.1 "via gränssnittet" verifieras fullt i #6.
  - Ändringen står i projektspecifikation.docx (stycket "Ändring av sprint 1" efter sprintplanen) och ska redovisas i progressrapporten.
- Testfallen skickas med i uppdragen: PO klistrar in dem direkt under TPL:s uppdrag (Codex läser inte docx pålitligt) och för in dem i testprotokollet.
- Nästa uppdrag: #1 K1 (model/ inklusive beraknaAvgift). Väntar på PO:s testfall för AK1.1–1.3 och avgiften i K4 (AK4.1 avgifter, AK4.4), som committas före implementationen.
- Direktivet v1.3 finns lokalt i Downloads hos en medlem; bör läggas i docs/.
- Sprint 2 (30 nov–7 dec): resten av K6–K7, ÄB1 (K10) och om möjligt K8–K9. ÄB1 lämnas vid handledningen 30 nov och kräver en konsekvensanalys som backlog-post innan första commit (AK10.1).

**Kommande leveranser**

- Lab 3 (programmet, testsviten, spårbarhetsmatrisen, AI-loggen och README): 7 dec.
- Lab 4: 18 dec.

---

## 5 Öppna frågor

| # | Fråga | Till | Påverkar |
|---|---|---|---|
| 1 | Hör ett tillfälle som slutar exakt 00:00 till rapporten för sluttidens datum eller för föregående dygn? | Beställaren | K4 regel 3, dygnsrapporten och testfall för AK4.4 |

Status 2026-11-27: Ö2 (zonkodens format) är besvarad, se beställarbeslut 4. Frågan ovan väntar fortfarande på svar. Kontrollera bestallarbeslut.docx.

---

## 6 Kända luckor och nästa steg

- **Klassdiagrammet i design.docx** har fått metoderna för att ändra och ta bort zon och fordon, ändra start- och sluttid och lista zontyper (commit 9c370ee). Kvar 2026-11-25:
  - **Modulkontrakt saknas** för andraZon, andraFordon, taBortZon, taBortFordon, andraStarttid, andraSluttid, listaTillfallen, listaZontyper och entiteternas andra-metoder. Det stoppar #1 och #2 (arbetsregel 3).
  - **Tabellen och bilden:** design.docx kompletterad (commit 1a879be) och design.md synkad 2026-11-25. Parkeringstillfälle.andraStarttid/andraSluttid står utan nr i båda filerna (PO-beslut 2026-11-25).
- **Småfel i design.docx och design.md:** utökningspunkten nämner Meny i stället för App.
- **Projektdirektivet (PDF)** finns inte i repot. Bifoga det i TPL-tråden innan uppdrag skrivs, så att AK-texterna kan läsas ordagrant.
- **Designer-runda 3** kan starta (Ö2 besvarad 2026-11-27):
  - ge F22 sin text och flytta Ö2 till de besvarade frågorna,
  - byt rubriken i avsnitt 1.4 ("till PO" ska bli "till beställaren"),
  - ändra K10 så att exemplet visar ett annat klockslag än det befintliga,
  - använd samma fordonsbeskrivningar som i exemplet på filformatet i design.docx.
- **Zontypregistret:** Zontyp.register är en publik statisk Map som bara model/zontyper.js fyller. Zontyp.skapa fungerar bara om koden importerar från model/zontyper.js, så uppdragen för #1 och #2 ska ange den importen. Registret står i spänning mot regeln i AGENTS.md om globalt muterbart tillstånd; kan stängas senare om rättaren tar upp det.
- **Testtäckning #3:** TF30–TF31 (ogiltiga minuter) provar bara zontyp A, fast B och Boende har egen validering. PO kan utöka.
- **Testfall för K4 och K5** ska skrivas och committas innan implementationen av K4 och K5 börjar (K7(a)).
- **Lab-instruktionens riktvärde** för sprint 1 är K1–K3, K6, K4, K5. PO har beslutat att följa sprintplanen (K1–K5, sedan K6).
