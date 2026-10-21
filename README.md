# A.L.L.A.N. Research Terminal

En forskarterminal i en läderväska, byggd i ren HTML, CSS och JavaScript.
Allt körs offline. Inget behöver installeras eller byggas.

## Köra på datorn med Live Server

1. Öppna mappen `ALLAN` i VS Code (Arkiv → Öppna mapp).
2. Högerklicka på `index.html` och välj **Open with Live Server**.
3. Sidan öppnas i webbläsaren och laddas om automatiskt när du sparar en fil.

Det går också bra att bara dubbelklicka på `index.html`.

### Tangenter på datorn

| Tangent | Gör |
|---|---|
| Piltangenter | Joysticken |
| A, Enter eller mellanslag | A (välj) |
| B, Esc eller backsteg | B (tillbaka) |
| C eller M | C (musen pratar) |
| D | Visa eller dölj felsökningsrutan |

### Genvägar när du testar

- `index.html#skip` hoppar över uppstarten.
- `index.html#keys=down,down,a` hoppar över uppstarten och trycker sedan på
  knapparna i tur och ordning (`up`, `down`, `left`, `right`, `a`, `b`, `c`).

## Var ligger vad?

| Fil eller mapp | Innehåll |
|---|---|
| `index.html` | Sidans skelett. Behöver sällan ändras. |
| `css/style.css` | Utseende och var panelerna sitter. |
| `js/content.js` | **Nästan alla texter.** Här redigerar du innehållet. |
| `js/archive.js` | **Arkivet:** kapitlen och alla bevis (bilder, chattar, inlägg). |
| `js/specimen.js` | **Allans kort:** nivåer, förmågor och stats per kapitel. |
| `js/app.js` | Logiken. Inställningarna står överst. |
| `images/` | Bakgrundsbilden `background.png`. |
| `images/archive/` | Fotona till Arkiv. |
| `audio/` | Ljudfilerna till Ljudloggar. |
| `fonts/` | Typsnitten (IBM Plex Mono och Cormorant Garamond, båda fria). |

## Ändra innehåll

Öppna `js/content.js`. Varje del har en kommentar på svenska som förklarar
hur man lägger till saker. Sök efter **BYT UT** för att hitta alla
platshållare där era egna minnen ska in.

Långa texter delas automatiskt upp på flera sidor.

Blir skärmen tom efter en ändring saknas nästan alltid ett kommatecken eller
citattecken. Tryck F12 i webbläsaren och titta under **Console**, där står
radnumret.

## Fylla på arkivet

Arkivet har sju kapitel och ligger i `js/archive.js`. Överst i filen står
hur allt fungerar. Varje kapitel har en lista `items` med bevis, och varje
bevis har en `type`:

| type | Vad det är |
|---|---|
| `"image"` | Ett foto med valfri bildtext. A visar det i helskärm. |
| `"text"` | En berättelse eller observation. |
| `"chat"` | En återfunnen konversation. |
| `"post"` | Ett arkiverat inlägg från sociala medier. |
| `"pip"` | Dr. Pips fältanteckning. |

Lägg till ett bevis genom att kopiera ett befintligt block av samma typ.
Ett kapitel utan bevis visas som SEALED och går inte att öppna.

Lägg fotona i `images/archive/`. Gör dem högst ca 1600 px breda så laddar de
snabbt på Pi:n.

I arkivet bläddrar vänster/höger mellan bevisen, A förstorar en bild och
B går tillbaka till kapitellistan (och en gång till till huvudmenyn).

## Allans kort

Allans karaktärskort (SPECIMEN No. 001) ligger i `js/specimen.js`. Där finns
en nivå per kapitel med namn, bild, förmågor och stats. Kortet visas
först i kapitel 1 och sist i varje annat öppet kapitel, och första gången en ny nivå visas
kommer en LEVEL UP. I kapitellistan öppnar höger kortet, och där bläddrar
man bland de nivåer som låsts upp. Nivåerna sparas inte när sidan laddas om.

## Lägga till ljud

1. Lägg filen i `audio/`, till exempel `audio/log01.mp3` (mp3, ogg eller wav).
2. Se till att samma filnamn står i listan `audio` i `js/content.js`.

Saknas en fil visas "FIL SAKNAS" på raden.

## Byta bakgrundsbild

Ersätt `images/background.png` med en bild som har samma namn. Nuvarande bild
är 1672×941 (16:9) och sträcks lite på höjden till 1024×600. Panelernas lägen
står i procent i `css/style.css`, så de följer med om bilden är ritad på samma
sätt. Ritas bilden om måste lägena mätas upp på nytt.

## Joystick och knappnummer

1. Koppla in joysticken och tryck på någon knapp på den (webbläsaren ser den
   först då).
2. Tryck **D** på tangentbordet. Rutan visar vilka knappnummer som är
   nedtryckta och vad axlarna har för värden.
3. Tryck på A, B och C en i taget och notera numren.
4. Öppna `js/app.js`. Överst finns `CONFIG`:

```js
buttons: {
  A: 0,   // välj
  B: 1,   // tillbaka
  C: 2,   // musen pratar
},
axisX: 0,
axisY: 1,
```

Byt siffrorna mot dem du såg i rutan och spara. Går joysticken åt fel håll
sätter du `invertX` eller `invertY` till `true`.

I samma block ändrar du också ljudvolymen (`volume`), stänger av ljudet
(`sound: false`) och hur många sektioner som krävs för att låsa upp
Slutrapport (`unlockAfter`).

## Köra på Raspberry Pi i kiosk-läge

Kopiera hela mappen till Pi:n, till exempel `/home/pi/ALLAN`, och starta:

```bash
chromium-browser --kiosk --noerrdialogs --disable-infobars \
  --autoplay-policy=no-user-gesture-required \
  file:///home/pi/ALLAN/index.html
```

Flaggan `--autoplay-policy=no-user-gesture-required` behövs för ljudet.
Chromium räknar inte joystickknappar som "användaren har klickat", och utan
flaggan förblir allt tyst.

Klockan uppe till höger visar Pi:ns systemtid. En Pi utan nätverk och utan
klockmodul (RTC) tappar tiden när strömmen bryts, så då visar den fel datum.

## Dolda saker

- Konami-koden: upp, upp, ner, ner, vänster, höger, vänster, höger, B, A.
- Tryck C sex gånger snabbt.
- Tryck B tre gånger i huvudmenyn.
- Vänta en stund utan att röra något.
- GLU-värdet sticker iväg någon gång ibland.

Texterna för dessa ligger under `eggs` och `pip` i `js/content.js`.
