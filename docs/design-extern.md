# Extern designspecifikation – Parkeringsavgifterna (K6)

Projektgrupp G10, ISGB04 Programutveckling, Karlstads universitet, HT 2026
Version 1.0 (utkast för granskning av TPL), 2026-11-20

Markeringen **(förslag, Ö*n*)** betyder att designen bygger på ett förslag som väntar på PO-beslut. Frågorna finns i avsnitt 1.4.

---

## 1 Gränssnittstyp och målgrupp

### 1.1 Gränssnittstyp

- Grafiskt gränssnitt (GUI) i webbläsaren, byggt med React 19 och Vite. En enda sida där vyerna byts via en fast menyrad.
- Allt i gränssnittet är på svenska.
- En användare åt gången, ingen inloggning.
- Systemet har ingen klocka. Alla tider matas in av användaren i två separata fält: **datum** (ÅÅÅÅ-MM-DD) och **klockslag** (HH:MM).
- Gränssnittet innehåller ingen affärslogik. Det samlar in indata, lämnar dem till programmets logikdel och visar svaret: data, kvitto eller felmeddelande. Följande avgörs alltid av logikdelen och aldrig av gränssnittet:
  - avgifter,
  - tillåtna statusövergångar,
  - kontroll och formatering av registreringsnummer,
  - sorteringen i dygnsrapporten,
  - vilka tillfällen som ingår i rapporten.

### 1.2 Målgrupp

- **Parkeringsvakten** är den enda direkta användaren. Vakten registrerar många tillfällen under dagen och behöver korta, förutsägbara formulär som går att fylla i med bara tangentbordet. Vakten ska alltid se befintliga zoner, fordon och tillfällen i stället för att behöva minnas dem.
- **Ekonomiavdelningen** (indirekt) använder dygnsrapporten och dess summa.
- **Bilisterna** (indirekt) ska kunna lita på avgifterna.

Därför visas avgift och status alltid tydligt, och det finns inget fält där en avgift kan matas in eller ändras för hand.

### 1.3 Gemensam layout (gäller alla vyer)

```
┌──────────────────────────────────────────────────────────────────────┐
│ Parkeringsavgifterna – Älvstranden Parkering   ● Osparade ändringar  │  rubrikrad
├──────────────────────────────────────────────────────────────────────┤
│ Start | Zoner | Fordon | Tillfällen | Dygnsrapport | Spara | Öppna | Avsluta │  menyrad
├──────────────────────────────────────────────────────────────────────┤
│ Klart: Zonen A1 Torggatan (A) har lagts till.                        │  meddelanderuta
├──────────────────────────────────────────────────────────────────────┤
│ Vyrubrik                                                             │
│ Lista (tabell)                                                       │
│ Formulär  [Primär knapp]  [Avbryt]                                   │
└──────────────────────────────────────────────────────────────────────┘
```

- **Rubrikrad:** visar programmets namn. Indikatorn "● Osparade ändringar" syns när det finns ändringar sedan senaste Spara eller Öppna **(förslag, Ö6)**.
- **Menyrad:** samma åtta val i samma ordning i alla vyer. Den aktiva vyn är markerad. Menyraden går att använda hela tiden, utom när en bekräftelsedialog är öppen.
- **Meddelanderuta:** alltid på samma plats.
  - Kvitton börjar med "Klart:" och visas i grönt.
  - Fel börjar med "Fel:" och visas i rött.
  - Neutrala besked visas utan prefix.
  - Meddelandet står kvar tills användaren gör nästa åtgärd.
- **Listor:** tabeller med en rubrikrad. Varje rad har sina radknappar längst till höger.
  - Tillfällen visas alltid med sitt löpnummer **Nr**.
  - Avgifter visas som heltal med "kr", till exempel "160 kr".
  - Ett Pågående tillfälle visar "–" som Slut och Avgift.
- **Formulär:** visas under listan i samma vy, så att listan syns medan användaren fyller i.
  - Etiketten står ovanför fältet. Formatet visas som platshållartext i fältet, till exempel "ÅÅÅÅ-MM-DD".
  - Den primära knappen står först och **Avbryt** sist.
  - Enter utför den primära knappen och Esc betyder Avbryt.
- **Fält för befintliga zoner och fordon:** textfält med en förslagslista som visar alla befintliga zoner eller fordon. Användaren kan välja i listan eller skriva fritt.
- **Vid fel:**
  - Formuläret står kvar med det användaren skrivit.
  - Det felaktiga fältet markeras och får fokus.
  - Inga data ändras.
  - Programmet avslutas aldrig.
- **Efter lyckad åtgärd eller Avbryt:** formuläret stängs och användaren är tillbaka i listan i samma vy.
- **Borttagning:** kräver alltid en bekräftelse, där **Avbryt** har fokus från början.

### 1.4 Öppna frågor till PO

1. **Ändring av zoner och fordon.** Får zonkod, zontyp och registreringsnummer ändras, eller bara zonens gatunamn och fordonets beskrivning? Designen visar i dag bara minimikravet, gatunamn och beskrivning, och övriga fält är låsta (V4, V8).
2. **Zonkodens format.** Finns det en formatregel för zonkoden, och likställs stora och små bokstäver? I väntan på beställarens svar kontrolleras bara att fältet inte är tomt och att zonkoden inte redan finns. Felmeddelande F23 får sin text när frågan är besvarad.
3. **Registrera betalning.** Behöver användaren mata in något? Förslag: inga indata, bara en bekräftelse (V14).
4. **Spara och öppna.** Förslag: användaren väljer fil själv. Spara ger en nedladdning med ett filnamn som användaren anger (V19). Öppna använder webbläsarens filväljare (V20).
5. **Avsluta.** Förslag: en egen avslutningsvy som påminner om att spara och sedan säger att fliken kan stängas (V21).
6. **Osparade ändringar.** Förslag: ja, varna både vid Avsluta och vid Öppna och visa indikatorn i rubrikraden. Webbläsarens egen varning när fliken stängs visas också, men den texten styr webbläsaren.
7. **Start och Slut i dygnsrapporten.** Direktivets exempel visar bara klockslag. Hur visas ett tillfälle som började ett annat datum än rapportdatumet? Förslag: visa då "ÅÅÅÅ-MM-DD HH:MM" i kolumnen Start och bara klockslag i övriga fall.

---

## 2 Flöde (navigering mellan vyerna, från start till avslut)

```
 Webbläsaren öppnar programmet
            │
            ▼
        V1 Start ◄──────────── Menyraden når alla huvudvyer när som helst ──────────┐
            │                                                                       │
  ┌─────────┼──────────────┬──────────────────┬──────────────┬────────┬────────┐   │
  ▼         ▼              ▼                  ▼              ▼        ▼        ▼   │
V2 Zoner  V6 Fordon    V10 Tillfällen    V18 Dygnsrapport  V19 Spara V20 Öppna V21 Avsluta
  │         │              │                                                   │
  ├ V3 Lägg till zon       ├ V11 Starta tillfälle                              ▼
  ├ V4 Ändra zon           ├ V17 Tillfällen för ett fordon ──┐            Avslutat
  └ V5 Ta bort zon         └ V12 Hantera tillfälle Nr ◄──────┘          (fliken kan
            │                    ├ V13 Avsluta tillfälle                  stängas)
            ├ V7 Lägg till fordon├ V14 Registrera betalning
            ├ V8 Ändra fordon    ├ V15 Rätta starttid
            ├ V9 Ta bort fordon  └ V16 Ändra sluttid
            └ V17 Tillfällen för ett fordon
```

**Beskrivning av flödet**

1. **Start.** När programmet öppnas i webbläsaren visas V1 Start med tomma data. Användaren väljer ett av två sätt att börja:
   - **Öppna** läser in en sparad fil.
   - **Zoner** och **Fordon** låter användaren lägga upp grunddata.
2. **Huvudvyer.** Zoner, Fordon, Tillfällen och Dygnsrapport nås direkt från menyraden. Varje huvudvy visar en lista och knappar som öppnar formulär för vyns operationer.
3. **Formulär.** Lägg till, Ändra, Starta, Avsluta tillfälle och de andra operationerna öppnas som formulär under listan i samma huvudvy.
   - Efter **lyckad åtgärd** stängs formuläret, listan uppdateras och ett kvitto visas.
   - Efter **Avbryt** stängs formuläret utan ändringar.
   - Vid **fel** står formuläret kvar och felet visas i meddelanderutan.
4. **Tillfällen.** Ett tillfälle hanteras via V12 Hantera tillfälle. Dit kommer användaren med radknappen **Välj** i V10 Tillfällen eller i V17 Tillfällen för ett fordon. Från V12 når användaren de fyra tillståndsoperationerna: Avsluta tillfälle, Registrera betalning, Rätta starttid och Ändra sluttid. **Tillbaka** leder till listan som användaren kom ifrån.
5. **Bekräftelser.** Ta bort, Registrera betalning och varningar för osparade ändringar visas som dialoger som måste besvaras. Medan en dialog är öppen är menyraden spärrad. **Avbryt** stänger alltid dialogen utan ändringar.
6. **Spara och Öppna.** Kan väljas när som helst. Efteråt kommer användaren tillbaka till vyn där valet gjordes.
7. **Avsluta.** Leder till V21. Där kan användaren spara först, avsluta utan att spara eller avbryta och gå tillbaka till föregående vy. När programmet har avslutats är menyraden spärrad och vyn säger att fliken kan stängas **(förslag, Ö5)**.

---

## 3 En vy per operation (för varje vy: namn, indata, utdata och felmeddelanden)

Felmeddelanden anges med id. Den ordagranna texten finns i avsnitt 4.

**Fält som återkommer i flera vyer**

- **Registreringsnummer** tar emot till exempel "aaa111", "AAA111" och "AAA 111". Logikdelen kontrollerar formatet, och numret visas sedan alltid som logikdelen returnerar det, till exempel "AAA 111". Ett ogiltigt format ger F07. Det kontrolleras före F01, så att en felskrivning inte rapporteras som ett fordon som saknas.
- **Datum** har formatet ÅÅÅÅ-MM-DD. Fel format ger F18.
- **Klockslag** har formatet HH:MM. Fel format ger F19.
- Ett **tomt obligatoriskt fält** ger F20.

### V1 Start

- **Nås från:** när programmet öppnas, och via menyvalet "Start".
- **Indata:** inga.
- **Utdata:**
  - Välkomsttext (T10).
  - Hur många zoner, fordon och tillfällen som finns i minnet (T11).
  - Om data saknas visas en hänvisning till Öppna, Zoner och Fordon (T12).
- **Felmeddelanden:** inga.

### V2 Zoner (lista)

- **Nås från:** menyvalet "Zoner".
- **Indata:** inga. Knappen **Lägg till zon** öppnar V3. Radknapparna **Ändra** och **Ta bort** öppnar V4 och V5.
- **Utdata:**
  - Tabell med kolumnerna Zonkod, Gatunamn och Zontyp, sorterad på zonkod.
  - Varje zon visar sin zontyp (AK3.2). Alla zontyper visas i samma tabell på samma sätt, både A, B, Boende och framtida typer.
  - En tom lista visar T13.
- **Felmeddelanden:** inga.

```
Zoner                                               [Lägg till zon]
┌────────┬───────────────┬─────────┬────────────────────────┐
│ Zonkod │ Gatunamn      │ Zontyp  │                        │
├────────┼───────────────┼─────────┼────────────────────────┤
│ A1     │ Torggatan     │ A       │ [Ändra] [Ta bort]      │
│ B2     │ Pendlarvägen  │ B       │ [Ändra] [Ta bort]      │
│ BO     │ Strandvägen   │ Boende  │ [Ändra] [Ta bort]      │
└────────┴───────────────┴─────────┴────────────────────────┘
Lägg till zon
 Zonkod        Gatunamn          Zontyp
 [A1      ]    [Torggatan    ]   [Välj zontyp ▾]
 [Lägg till]  [Avbryt]
```

### V3 Lägg till zon

- **Nås från:** V2, knappen "Lägg till zon". Formuläret visas under zonlistan.
- **Indata:**
  - **Zonkod:** textfält.
  - **Gatunamn:** textfält.
  - **Zontyp:** vallista med de zontyper som programmet känner till. Listan hämtas från logikdelen, så att framtida zontyper visas utan ändring i gränssnittet. Inget värde är förvalt, och listan visar "Välj zontyp" tills användaren har valt.
  - Knapparna **Lägg till** och **Avbryt**.
- **Utdata:** kvitto K01. Den nya zonen syns i listan.
- **Felmeddelanden:**
  - F20: tomt fält eller ingen vald zontyp.
  - F09: zonkoden finns redan.
  - F23: ogiltig zonkod (Ö2).

### V4 Ändra zon

- **Nås från:** V2, radknappen "Ändra".
- **Indata:**
  - **Zonkod** och **Zontyp** visas men är låsta **(förslag, Ö1)**.
  - **Gatunamn:** textfält, förifyllt med det nuvarande gatunamnet.
  - Knapparna **Ändra** och **Avbryt**.
- **Utdata:** kvitto K02. Listan visar det nya gatunamnet.
- **Felmeddelanden:** F20 (tomt gatunamn).

### V5 Ta bort zon

- **Nås från:** V2, radknappen "Ta bort".
- **Indata:** bekräftelsedialog B01 med knapparna **Ta bort** och **Avbryt**. Avbryt har fokus från början.
- **Utdata:** kvitto K03, som anger hur många Betalda tillfällen som togs bort samtidigt. Zonen försvinner ur listan.
- **Felmeddelanden:** F11, om zonen har tillfällen med status Pågående eller Avslutat. Då är ingenting borttaget.

### V6 Fordon (lista)

- **Nås från:** menyvalet "Fordon".
- **Indata:** inga. Knappen **Lägg till fordon** öppnar V7. Radknapparna **Tillfällen**, **Ändra** och **Ta bort** öppnar V17, V8 och V9.
- **Utdata:**
  - Tabell med kolumnerna Registreringsnummer och Beskrivning, sorterad på registreringsnummer.
  - En tom lista visar T14.
- **Felmeddelanden:** inga.

### V7 Lägg till fordon

- **Nås från:** V6, knappen "Lägg till fordon".
- **Indata:**
  - **Registreringsnummer:** textfält med platshållaren "AAA 111".
  - **Beskrivning:** textfält.
  - Knapparna **Lägg till** och **Avbryt**.
- **Utdata:** kvitto K04, där numret visas med versaler och mellanslag. Fordonet syns i listan.
- **Felmeddelanden:**
  - F07: ogiltigt registreringsnummer, till exempel "ABC 12D".
  - F10: fordonet finns redan.
  - F20: tomt fält.

### V8 Ändra fordon

- **Nås från:** V6, radknappen "Ändra".
- **Indata:**
  - **Registreringsnummer** visas men är låst **(förslag, Ö1)**.
  - **Beskrivning:** textfält, förifyllt med den nuvarande beskrivningen.
  - Knapparna **Ändra** och **Avbryt**.
- **Utdata:** kvitto K05.
- **Felmeddelanden:** F20.

### V9 Ta bort fordon

- **Nås från:** V6, radknappen "Ta bort".
- **Indata:** bekräftelsedialog B02 med knapparna **Ta bort** och **Avbryt**. Avbryt har fokus från början.
- **Utdata:** kvitto K06, som anger hur många Betalda tillfällen som togs bort samtidigt.
- **Felmeddelanden:** F12, om fordonet har tillfällen med status Pågående eller Avslutat. Då är ingenting borttaget.

### V10 Tillfällen (lista)

- **Nås från:** menyvalet "Tillfällen".
- **Indata:** inga.
  - Knappen **Starta tillfälle** öppnar V11.
  - Knappen **Visa tillfällen för ett fordon** öppnar V17.
  - Radknappen **Välj** öppnar V12 för det tillfället.
- **Utdata:**
  - Tabell med kolumnerna Nr, Fordon, Zon, Start, Slut, Avgift och Status, sorterad på Nr.
  - Start och Slut visas som "ÅÅÅÅ-MM-DD HH:MM".
  - Ett Pågående tillfälle visar "–" som Slut och Avgift.
  - En tom lista visar T15.
- **Felmeddelanden:** inga.

```
Tillfällen                 [Starta tillfälle] [Visa tillfällen för ett fordon]
┌────┬─────────┬─────┬──────────────────┬──────────────────┬────────┬───────────┬────────┐
│ Nr │ Fordon  │ Zon │ Start            │ Slut             │ Avgift │ Status    │        │
├────┼─────────┼─────┼──────────────────┼──────────────────┼────────┼───────────┼────────┤
│ 1  │ CCC 333 │ A1  │ 2026-11-24 07:00 │ 2026-11-24 08:10 │ 40 kr  │ Betalt    │ [Välj] │
│ 2  │ BBB 222 │ A1  │ 2026-11-24 09:15 │ 2026-11-24 20:45 │ 160 kr │ Avslutat  │ [Välj] │
│ 3  │ AAA 111 │ A1  │ 2026-11-24 10:00 │ 2026-11-24 12:00 │ 40 kr  │ Avslutat  │ [Välj] │
│ 4  │ DDD 444 │ BO  │ 2026-11-25 08:30 │ –                │ –      │ Pågående  │ [Välj] │
└────┴─────────┴─────┴──────────────────┴──────────────────┴────────┴───────────┴────────┘
```

### V11 Starta tillfälle

- **Nås från:** V10, knappen "Starta tillfälle".
- **Indata:**
  - **Fordon:** registreringsnummer i ett textfält. Förslagslistan visar alla fordon som "AAA 111 – beskrivning".
  - **Zon:** zonkod i ett textfält. Förslagslistan visar alla zoner som "A1 Torggatan (A)".
  - **Startdatum:** ÅÅÅÅ-MM-DD.
  - **Starttid:** HH:MM.
  - Knapparna **Starta** och **Avbryt**.
- **Utdata:** kvitto K07 med tillfällets nya Nr. Tillfället syns i listan med status Pågående.
- **Felmeddelanden:**
  - F07: ogiltigt registreringsnummer.
  - F01: fordonet finns inte.
  - F03: zonkoden finns inte.
  - F06: fordonet har redan ett Pågående tillfälle.
  - F18, F19, F20.

### V12 Hantera tillfälle Nr

- **Nås från:** radknappen "Välj" i V10 eller V17.
- **Indata:** inga. Knapparna **Avsluta tillfälle**, **Registrera betalning**, **Rätta starttid**, **Ändra sluttid** och **Tillbaka**.
  - Alla knappar är alltid aktiva. Det är logikdelen som avgör om åtgärden är tillåten för tillfällets status. Se avsnitt 5.
- **Utdata:** tillfällets Nr, Fordon (med beskrivning), Zon (med gatunamn och zontyp), Start, Slut, Avgift och Status. Under rubriken visas statuskedjan "Pågående → Avslutat → Betalt" med den aktuella statusen markerad.
- **Felmeddelanden:** inga i själva vyn. Se V13–V16.

```
Tillfälle 3
 Fordon   AAA 111 – Blå personbil
 Zon      A1 Torggatan (A)
 Start    2026-11-24 10:00
 Slut     2026-11-24 12:00
 Avgift   40 kr
 Status   Pågående → [Avslutat] → Betalt

 [Avsluta tillfälle] [Registrera betalning] [Rätta starttid] [Ändra sluttid] [Tillbaka]
```

### V13 Avsluta tillfälle

- **Nås från:** V12, knappen "Avsluta tillfälle".
- **Indata:**
  - Tillfällets Nr, Fordon, Zon och Start visas, så att användaren ser starttiden.
  - **Slutdatum:** ÅÅÅÅ-MM-DD.
  - **Sluttid:** HH:MM.
  - Knapparna **Avsluta tillfälle** och **Avbryt**.
- **Utdata:** kvitto K08 med den avgift som logikdelen har räknat ut. Status blir Avslutat, och användaren är tillbaka i V12.
- **Felmeddelanden:**
  - F02: sluttiden ligger före starttiden.
  - F05: tillfället är Betalt.
  - F16: tillfället är redan Avslutat.
  - F18, F19, F20.

### V14 Registrera betalning

- **Nås från:** V12, knappen "Registrera betalning".
- **Indata:** bekräftelsedialog B03 med knapparna **Registrera betalning** och **Avbryt**. Inga andra indata **(förslag, Ö3)**.
- **Utdata:** kvitto K09. Status blir Betalt och tillfället är därefter låst.
- **Felmeddelanden:**
  - F04: tillfället är Pågående.
  - F17: tillfället är redan Betalt.

### V15 Rätta starttid

- **Nås från:** V12, knappen "Rätta starttid".
- **Indata:**
  - **Startdatum** och **Starttid**, förifyllda med de nuvarande värdena.
  - Knapparna **Rätta starttid** och **Avbryt**.
- **Utdata:** kvitto K10. V12 visar den nya starttiden.
- **Felmeddelanden:**
  - F14: tillfället är Avslutat.
  - F13: tillfället är Betalt.
  - F18, F19, F20.

### V16 Ändra sluttid

- **Nås från:** V12, knappen "Ändra sluttid".
- **Indata:**
  - Starttiden visas.
  - **Slutdatum** och **Sluttid**, förifyllda med de nuvarande värdena.
  - Knapparna **Ändra sluttid** och **Avbryt**.
- **Utdata:** kvitto K11 med den nya avgiften, som logikdelen har räknat om, och den tidigare avgiften.
- **Felmeddelanden:**
  - F15: tillfället är Pågående.
  - F13: tillfället är Betalt.
  - F02: sluttiden ligger före starttiden.
  - F18, F19, F20.

### V17 Tillfällen för ett fordon

- **Nås från:** V6, radknappen "Tillfällen" (registreringsnumret är då förifyllt och listan visas direkt). Även från V10, knappen "Visa tillfällen för ett fordon".
- **Indata:**
  - **Registreringsnummer:** textfält med förslagslista över alla fordon.
  - Knappen **Visa**.
- **Utdata:**
  - Rubriken T16.
  - Tabell med kolumnerna Nr, Zon, Start, Slut, Avgift och Status, sorterad på starttid. Varje rad har radknappen **Välj**, som öppnar V12.
  - Om fordonet saknar tillfällen visas T17.
- **Felmeddelanden:** F07, F01, F20.

### V18 Dygnsrapport

- **Nås från:** menyvalet "Dygnsrapport".
- **Indata:**
  - **Datum:** ÅÅÅÅ-MM-DD.
  - Knappen **Visa rapport**.
- **Utdata:**
  - Rubriken T18.
  - Tabell med kolumnerna Plac, Fordon, Zon, Start, Slut och Avgift och en summarad "Summa".
  - Raderna visas i den ordning logikdelen levererar dem. Plac är radens löpnummer i den ordningen.
  - Rapporten tar med tillfällen med status Avslutat eller Betalt vars sluttid ligger på det valda datumet. Pågående tillfällen visas inte.
  - Start och Slut visas som klockslag **(förslag, Ö7)**.
  - Om inga tillfällen ingår visas T19 och summaraden "Summa 0 kr". Det är inget fel.
- **Felmeddelanden:** F18, F20.

```
Dygnsrapport                     Datum [2026-11-24]  [Visa rapport]

Dygnsrapport 2026-11-24
┌──────┬─────────┬─────┬───────┬───────┬────────┐
│ Plac │ Fordon  │ Zon │ Start │ Slut  │ Avgift │
├──────┼─────────┼─────┼───────┼───────┼────────┤
│ 1    │ BBB 222 │ A1  │ 09:15 │ 20:45 │ 160 kr │
│ 2    │ CCC 333 │ A1  │ 07:00 │ 08:10 │  40 kr │
│ 3    │ AAA 111 │ A1  │ 10:00 │ 12:00 │  40 kr │
│ 4    │ AAA 111 │ B2  │ 13:00 │ 17:00 │  40 kr │
├──────┴─────────┴─────┴───────┴───────┼────────┤
│ Summa                                │ 280 kr │
└──────────────────────────────────────┴────────┘
```

### V19 Spara

- **Nås från:** menyvalet "Spara".
- **Indata:**
  - **Filnamn:** textfält, förifyllt med namnet på den senast öppnade eller sparade filen.
  - Knapparna **Spara till fil** och **Avbryt**.
  - Filen hämtas ned via webbläsaren **(förslag, Ö4)**.
- **Utdata:** kvitto K12. Indikatorn "Osparade ändringar" försvinner. Användaren är tillbaka i föregående vy.
- **Felmeddelanden:** F20, F21.

### V20 Öppna

- **Nås från:** menyvalet "Öppna".
- **Indata:**
  - Om det finns osparade ändringar visas först varningen B04 med knapparna **Fortsätt utan att spara** och **Avbryt** **(förslag, Ö6)**.
  - Sedan öppnas webbläsarens filväljare **(förslag, Ö4)**.
- **Utdata:**
  - Vid lyckad inläsning ersätts data i minnet med filens innehåll, och kvitto K13 visas.
  - Om användaren avbryter filvalet visas T20, och data är oförändrade.
- **Felmeddelanden:** F08, vid en trasig fil. Meddelandet anger radnummer och orsak, och data i minnet är oförändrade.

### V21 Avsluta

- **Nås från:** menyvalet "Avsluta" **(förslag, Ö5)**.
- **Indata:**
  - Om det finns osparade ändringar visas varningen B05 med knapparna **Spara och avsluta**, **Avsluta utan att spara** och **Avbryt** **(förslag, Ö6)**. "Spara och avsluta" går via V19.
  - Utan osparade ändringar visas B06 med knapparna **Avsluta** och **Avbryt**.
- **Utdata:**
  - T21 visas och menyraden spärras.
  - Avbryt leder tillbaka till föregående vy utan ändringar.
- **Felmeddelanden:** F21, om sparandet misslyckas. Då avslutas programmet inte.

---

## 4 Texter och felmeddelanden (ordagrant, så som de visas)

Exempelvärden inom klamrar, `{...}`, ersätts med verkliga värden när texten visas. Prefixet "Fel:" eller "Klart:" visas i meddelanderutan framför texten.

### 4.1 Rubriker, menyval och knappar

| Id | Text |
|---|---|
| T01 | Parkeringsavgifterna – Älvstranden Parkering |
| T02 | ● Osparade ändringar |
| T03 | Menyval: Start · Zoner · Fordon · Tillfällen · Dygnsrapport · Spara · Öppna · Avsluta |
| T04 | Vyrubriker: Start · Zoner · Lägg till zon · Ändra zon · Fordon · Lägg till fordon · Ändra fordon · Tillfällen · Starta tillfälle · Tillfälle {3} · Avsluta tillfälle {3} · Rätta starttid för tillfälle {3} · Ändra sluttid för tillfälle {3} · Tillfällen för ett fordon · Dygnsrapport · Spara · Öppna · Avsluta |
| T05 | Knappar: Lägg till zon · Lägg till fordon · Lägg till · Ändra · Ta bort · Tillfällen · Starta tillfälle · Starta · Visa tillfällen för ett fordon · Välj · Avsluta tillfälle · Registrera betalning · Rätta starttid · Ändra sluttid · Tillbaka · Visa · Visa rapport · Spara till fil · Fortsätt utan att spara · Spara och avsluta · Avsluta utan att spara · Avsluta · Avbryt |
| T06 | Fältetiketter: Zonkod · Gatunamn · Zontyp · Registreringsnummer · Beskrivning · Fordon · Zon · Startdatum · Starttid · Slutdatum · Sluttid · Datum · Filnamn |
| T07 | Platshållare: "ÅÅÅÅ-MM-DD" · "HH:MM" · "AAA 111" · "Välj zontyp" |
| T08 | Kolumnrubriker: Zonkod · Gatunamn · Zontyp · Registreringsnummer · Beskrivning · Nr · Fordon · Zon · Start · Slut · Avgift · Status · Plac |
| T09 | Statustexter: Pågående · Avslutat · Betalt. Tom cell: – |

### 4.2 Informationstexter

| Id | Text |
|---|---|
| T10 | Välkommen till Parkeringsavgifterna. Välj i menyn vad du vill göra. |
| T11 | I minnet finns {3} zoner, {4} fordon och {5} tillfällen. |
| T12 | Inga data är inlästa. Välj Öppna för att läsa in en sparad fil, eller börja med Zoner och Fordon. |
| T13 | Inga zoner finns. Välj Lägg till zon. |
| T14 | Inga fordon finns. Välj Lägg till fordon. |
| T15 | Inga tillfällen finns. Välj Starta tillfälle. |
| T16 | Tillfällen för {AAA 111} – {Blå personbil} |
| T17 | Fordonet {AAA 111} har inga tillfällen. |
| T18 | Dygnsrapport {2026-11-24} |
| T19 | Inga avslutade tillfällen detta datum. |
| T20 | Öppna avbröts. Data i programmet är oförändrade. |
| T21 | Programmet är avslutat. Du kan nu stänga fliken. |

### 4.3 Bekräftelsedialoger

| Id | Text |
|---|---|
| B01 | Ta bort zonen {A1 Torggatan (A)}? Betalda tillfällen i zonen tas också bort. Det går inte att ångra. |
| B02 | Ta bort fordonet {AAA 111}? Betalda tillfällen för fordonet tas också bort. Det går inte att ångra. |
| B03 | Registrera betalning för tillfälle {3}, {AAA 111} i zon {A1}, {40} kr? |
| B04 | Det finns osparade ändringar. Om du öppnar en annan fil försvinner de. |
| B05 | Det finns osparade ändringar. Vill du spara innan du avslutar? |
| B06 | Vill du avsluta programmet? |

### 4.4 Kvitton (prefix "Klart:")

| Id | Text |
|---|---|
| K01 | Zonen {A1 Torggatan (A)} har lagts till. |
| K02 | Gatunamnet för zon {A1} har ändrats till {Torggatan}. |
| K03 | Zonen {A1} har tagits bort. {2} betalda tillfällen togs också bort. |
| K04 | Fordonet {AAA 111} har lagts till. |
| K05 | Beskrivningen för fordonet {AAA 111} har ändrats. |
| K06 | Fordonet {AAA 111} har tagits bort. {1} betalda tillfällen togs också bort. |
| K07 | Tillfälle {5} har startats för {AAA 111} i zon {A1}. |
| K08 | Tillfälle {3} har avslutats. Avgift: {40} kr. |
| K09 | Betalning har registrerats för tillfälle {3}. |
| K10 | Starttiden för tillfälle {4} har rättats till {2026-11-25 08:15}. |
| K11 | Sluttiden för tillfälle {2} har ändrats. Ny avgift: {120} kr (tidigare {160} kr). |
| K12 | Data har sparats till {parkering.txt}. |
| K13 | Filen {parkering.txt} har öppnats: {3} zoner, {4} fordon och {5} tillfällen. |

### 4.5 Felmeddelanden (prefix "Fel:")

De tre felen som AK6.2 kräver är F01, F02 och F03.

| Id | När | Text |
|---|---|---|
| F01 | Start eller visning för ett fordon som inte finns (AK6.2) | Fordonet {AAA 111} finns inte. Lägg till det under Fordon först. |
| F02 | Sluttiden ligger före starttiden (AK6.2) | Sluttiden får inte ligga före starttiden ({2026-11-24 10:00}). |
| F03 | Zonkoden finns inte (AK6.2) | Zonen {A9} finns inte. Välj en zon i listan eller lägg till den under Zoner. |
| F04 | Betalning av ett Pågående tillfälle | Tillfälle {4} är Pågående och kan inte betalas. Avsluta tillfället först. |
| F05 | Avslut av ett Betalt tillfälle | Tillfälle {1} är Betalt och kan inte avslutas. |
| F06 | Ett andra Pågående tillfälle för samma fordon | Fordonet {DDD 444} har redan ett Pågående tillfälle (nr {4}). Avsluta det först. |
| F07 | Ogiltigt registreringsnummer | Ogiltigt registreringsnummer: "{ABC 12D}". Ange tre bokstäver följda av tre siffror, till exempel AAA 111. |
| F08 | Trasig fil vid Öppna | Filen {parkering.txt} kunde inte öppnas. Rad {7}: {orsak}. Data i programmet är oförändrade. |
| F09 | Dubblett av zonkod | Zonkoden {A1} finns redan. |
| F10 | Dubblett av registreringsnummer | Fordonet {AAA 111} finns redan. |
| F11 | Borttagning av en zon med Pågående eller Avslutade tillfällen | Zonen {A1} kan inte tas bort eftersom den har tillfällen som är Pågående eller Avslutade. |
| F12 | Borttagning av ett fordon med Pågående eller Avslutade tillfällen | Fordonet {AAA 111} kan inte tas bort eftersom det har tillfällen som är Pågående eller Avslutade. |
| F13 | Ändring av ett Betalt tillfälle | Tillfälle {1} är Betalt och kan inte ändras. |
| F14 | Rättad starttid för ett Avslutat tillfälle | Starttiden kan bara rättas för ett Pågående tillfälle. Tillfälle {3} är Avslutat. |
| F15 | Ändrad sluttid för ett Pågående tillfälle | Sluttiden kan bara ändras för ett Avslutat tillfälle. Tillfälle {4} är Pågående. Välj Avsluta tillfälle. |
| F16 | Avslut av ett Avslutat tillfälle | Tillfälle {3} är redan Avslutat. |
| F17 | Betalning av ett Betalt tillfälle | Tillfälle {1} är redan Betalt. |
| F18 | Ogiltigt datum | Ogiltigt datum: "{24/11}". Ange datum som ÅÅÅÅ-MM-DD, till exempel 2026-11-24. |
| F19 | Ogiltigt klockslag | Ogiltigt klockslag: "{9.15}". Ange klockslag som HH:MM, till exempel 09:15. |
| F20 | Tomt obligatoriskt fält | {Gatunamn} måste fyllas i. |
| F21 | Sparandet misslyckades | Filen kunde inte sparas: {orsak}. Inga data har ändrats. |
| F23 | Ogiltig zonkod (Ö2) | Texten bestäms när Ö2 är besvarad. |

Om ett fält kan ge flera fel visas bara det första, i den här ordningen: F20 (tomt), F18, F19 eller F07 (format), F01 eller F03 (finns inte) och sist statusfelen.

---

## 5 Motivering mot gränssnittsprinciperna

### 5.1 Ångra och avbryta utan att något går sönder

- Varje formulär och dialog har **Avbryt** på samma plats och kan också avbrytas med Esc. Avbryt ändrar aldrig några data.
- Borttagning och betalning går inte att ändra efteråt, eftersom ett Betalt tillfälle är låst. Därför kräver de en bekräftelse (B01–B03) där **Avbryt** har fokus från början, så att en snabb Enter inte gör något som inte går att ta tillbaka.
- En felskrivning i ett Pågående eller Avslutat tillfälle kan rättas med Rätta starttid eller Ändra sluttid. Beskrivning och gatunamn kan alltid ändras tillbaka.
- Fel ändrar aldrig några data. Formuläret står kvar med det användaren skrev, så att bara det felaktiga behöver rättas. Programmet avslutas aldrig vid fel (AK6.2).
- Öppna ändrar ingenting om filen är trasig (F08) eller om användaren avbryter filvalet (T20). Varningar för osparade ändringar (B04, B05) skyddar arbetet mot att försvinna **(förslag, Ö6)**.

### 5.2 Inget "mänskligt RAM"

- Fält för fordon och zoner har förslagslistor med alla befintliga fordon och zoner, inklusive beskrivning, gatunamn och zontyp.
- Tillfällen pekas ut med radknappen **Välj** i stället för att användaren skriver ett nummer. Nr visas ändå i alla listor och kvitton, så att användaren kan hänvisa till ett tillfälle.
- Formulär visas under sin lista, så att listan syns medan användaren fyller i.
- V12, V13 och V16 visar starttiden när användaren anger en sluttid. Det minskar risken för F02.
- Kvitton upprepar vad som hände, med Nr, registreringsnummer och avgift, så att användaren inte behöver kontrollera det i listan.
- Indikatorn "Osparade ändringar" gör att användaren inte behöver minnas om data är sparade.
- Felmeddelandena säger vad som är fel och vad användaren kan göra, till exempel "Avsluta tillfället först" och "till exempel AAA 111".

### 5.3 Inlärning: samma mönster överallt

- Alla huvudvyer följer samma mönster: först en lista, sedan en knapp som öppnar ett formulär under listan, sedan den primära knappen och Avbryt, och sist ett kvitto eller fel i meddelanderutan.
- Ändra och Ta bort fungerar på samma sätt för zoner och fordon.
- Datum och klockslag matas alltid in i två separata fält med samma platshållare.
- Alla zontyper, både A, B, Boende och framtida typer, hanteras i samma vyer, listor och rapport. Listan över zontyper hämtas från logikdelen, så en ny zontyp kräver ingen ny vy och inget nytt menyval.
- Knapparnas text upprepar operationens namn ("Avsluta tillfälle", "Ändra sluttid"), så att användaren lär sig ett ord per operation. Tillfällen avslutas alltid med knappen "Avsluta tillfälle", så att det inte förväxlas med menyvalet "Avsluta".

### 5.4 Konsekvent utseende och beteende

- Menyraden, meddelanderutan och placeringen av knapparna är desamma i alla vyer.
- Kvitton och fel har alltid samma prefix ("Klart:" och "Fel:"), färg och plats.
- Registreringsnummer, datum, klockslag och avgifter visas alltid på samma sätt: "AAA 111", "2026-11-24 09:15" och "40 kr". Pågående tillfällen visar alltid "–" för Slut och Avgift.
- I V12 är alla fyra tillståndsknappar alltid synliga och aktiva, oavsett status:
  - Gränssnittet ska inte innehålla affärslogik, så det är logikdelen som avgör om en övergång är tillåten. Felmeddelandet förklarar varför när den inte är det (F04, F05, F13–F17).
  - Vyn ser likadan ut för alla tillfällen.
  - Statuskedjan "Pågående → Avslutat → Betalt" visar ändå vilket steg som kommer härnäst, så att användaren sällan behöver se felmeddelandet.
- Det finns inget fält för att ändra en avgift. Avgiften visas bara som den logikdelen har räknat ut den.
