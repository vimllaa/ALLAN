/* ==========================================================================
   A.L.L.A.N. — INNEHÅLL
   ==========================================================================
   Här ligger nästan alla texter: menyn, ljudfiler, quizfrågor,
   Dr. Pips repliker och slutrapporten. Arkivet ligger i archive.js.
   Du behöver aldrig röra app.js för att ändra innehåll.

   BRA ATT VETA
   - Text står mellan citattecken: "så här". Varje rad i en lista avslutas
     med ett kommatecken.
   - Vill du ha ett citattecken inuti en text skriver du \" (bakstreck först).
   - Långa texter delas automatiskt upp på flera sidor. Du behöver inte
     räkna rader själv. Varje "..." i en text-lista blir ett eget stycke.
   - Sök efter BYT UT för att hitta alla ställen där jag har lämnat en
     platshållare för era egna minnen.
   - Om skärmen blir svart efter en ändring saknas nästan alltid ett
     kommatecken eller citattecken. Öppna webbläsarens konsol (F12) så står
     radnumret där.
   - Tips: öppna index.html#skip för att hoppa över uppstarten när du testar.
   ========================================================================== */

const CONTENT = {

  /* ------------------------------------------------------------------------
     UPPSTART
     Raderna visas en i taget när väskan öppnas.
     ------------------------------------------------------------------------ */
  boot: {
    title: "Systemstart",
    lines: [
      "A.L.L.A.N. LONGITUDINELLT OBSERVATIONSSYSTEM v2.3.1",
      "Väcker observationskärnan ........... OK",
      "Kontrollerar mässingsbeslag ......... OK",
      "Kalibrerar nyfikenhetssensorer ...... OK",
      "Läser in försökspersonens akt ....... 4 812 poster",
      "Lokaliserar laboratoriemus .......... HITTAD (sover)",
      "Väcker laboratoriemus ............... OK (motvillig)",
      "Försöksperson identifierad: ALLAN",
      "Observationsperiod: många år. Etiskt tillstånd: inväntas.",
    ],
    prompt: "TRYCK  A  FÖR ATT BÖRJA",
  },

  /* ------------------------------------------------------------------------
     HUVUDMENYN
     Ändra gärna label (namnet) och desc (raden under menyn).
     Ändra INTE id. nav styr vilket ord i toppmenyn som lyser:
     "archive", "observation", "audio", "experiments" eller "reports".
     ------------------------------------------------------------------------ */
  menuTitle: "Huvudregister",
  menu: [
    { id: "archive",  nav: "archive",     label: "Arkiv",               desc: "Insamlade handlingar om försökspersonen." },
    { id: "audio",    nav: "audio",       label: "Ljudloggar",          desc: "Inspelade fältanteckningar och meddelanden." },
    { id: "profile",  nav: "observation", label: "Försökspersonens profil", desc: "Allt maskinen vet om Allan." },
    { id: "quiz",     nav: "experiments", label: "Experiment",          desc: "Ett kort kognitivt test." },
    { id: "mouse",    nav: "observation", label: "Musforskning",        desc: "Oberoende studier av Dr. Pip." },
    { id: "escape",   nav: "experiments", label: "Flyktprotokoll",      desc: "Inneslutningsövning. Under uppbyggnad." },
    { id: "final",    nav: "reports",     label: "Slutrapport",         desc: "Observationens slutsatser." },
  ],

  /* ------------------------------------------------------------------------
     ARKIV
     Arkivet har en egen fil: js/archive.js. Där finns kapitlen, bilderna,
     konversationerna och en förklaring av hur man lägger till nya bevis.
     ------------------------------------------------------------------------ */

  /* ------------------------------------------------------------------------
     LJUDLOGGAR — ljudfiler
     1. Lägg ljudfilen i mappen audio/ (mp3, ogg eller wav).
     2. Lägg till en rad här med exakt samma filnamn.
     Saknas filen visas "FIL SAKNAS" i stället för att något kraschar.
     ------------------------------------------------------------------------ */
  audio: [
    { title: "Logg 01 — Inledande anförande",       note: "BYT UT: vem som pratar", file: "audio/log01.mp3" },
    { title: "Logg 02 — Fältinspelning",            note: "BYT UT: vem som pratar", file: "audio/log02.mp3" },
    { title: "Logg 03 — Meddelande till försökspersonen", note: "BYT UT: vem som pratar", file: "audio/log03.mp3" },
  ],

  /* ------------------------------------------------------------------------
     FÖRSÖKSPERSONENS PROFIL
     Varje block är en sida. rows är par av ["Etikett", "Värde"].
     Högst 8 rader per sida får plats.
     ------------------------------------------------------------------------ */
  profile: [
    {
      title: "Identitet",
      rows: [
        ["Beteckning", "Försöksperson A"],
        ["Namn", "Allan"],
        ["Art", "Homo sapiens (var. medicus)"],
        ["Yrke", "Läkare, doktorand"],
        ["Status", "Inför disputation"],
        ["Habitat", "Klinik, labb, där kaffet finns"],
        ["Hotnivå", "Minimal (stiger vid hunger)"],
      ],
    },
    {
      title: "Uppmätta egenskaper",
      rows: [
        ["Nyfikenhet", "97 %"],
        ["Vänlighet", "Utanför skalan (skalan bytt två gånger)"],
        ["Tålamod", "Högt med patienter, lågt med skrivare"],
        ["Kaffeberoende", "Kliniskt signifikant"],
        ["Sömn", "Data saknas"],
        ["Humor", "Torr, väl tolererad"],
        ["BYT UT: egenskap", "BYT UT: värde"],
      ],
    },
    {
      title: "Avhandlingen",
      rows: [
        ["Titel", "Sweet Beginnings, Lasting Consequences"],
        ["Område", "Diabetes under graviditet, kardiometabola utfall hos avkomman"],
        ["Modellorganism", "Mus musculus (se: Dr. Pip)"],
        ["Antal sidor", "För många"],
        ["Disputationsdatum", "BYT UT: datum"],
        ["Förväntat utfall", "Godkänd, med applåder"],
      ],
    },
  ],

  /* ------------------------------------------------------------------------
     EXPERIMENT — quiz
     Lägg till en fråga genom att kopiera ett block.
       q       = frågan
       options = 2–4 svarsalternativ
       correct = numret på rätt svar. OBS: första alternativet är 0,
                 andra är 1, tredje är 2, fjärde är 3.
       right / wrong = texten som visas efter svaret
     results: texten i slutet. min = lägsta antal rätt för den raden.
     Raden med högst min som spelaren når upp till visas.
     ------------------------------------------------------------------------ */
  quiz: {
    title: "Kognitivt test",
    intro: [
      "Försökspersonen ska nu testas. Svara ärligt. Resultaten är permanenta och förs in i slutrapporten.",
      "Det finns ingen tidsgräns. Musen tittar på.",
    ],
    questions: [
      {
        q: "Vilken är en doktorands främsta energikälla?",
        options: ["Glukos", "Kaffe", "Sömn", "Hopp"],
        correct: 1,
        right: "Rätt. Hoppet tog slut under år två.",
        wrong: "Fel. Svaret är kaffe. Det har alltid varit kaffe.",
      },
      {
        q: "Glukosets summaformel är:",
        options: ["C6H12O6", "C2H5OH", "H2O", "Fe2O3"],
        correct: 0,
        right: "Rätt. Den står också på väggen bakom dig.",
        wrong: "Fel. Försökspersonen har skrivit en avhandling om det här. Oroande.",
      },
      {
        q: "Granskare 2 ber om \"mindre revideringar\". Det betyder:",
        options: ["Några stavfel", "Tre nya experiment", "Börja om", "Ingen vet"],
        correct: 3,
        right: "Rätt. Ingen har någonsin vetat.",
        wrong: "Fel. Ingen vet, allra minst Granskare 2.",
      },
      {
        q: "Vilken art har bidragit mest till försökspersonens avhandling?",
        options: ["Homo sapiens", "Mus musculus", "Handledarna", "Kaffemaskinen"],
        correct: 1,
        right: "Rätt. Dr. Pip tar emot din tacksamhet.",
        wrong: "Fel. Dr. Pip är djupt förolämpad.",
      },
      {
        q: "Någon frågar \"När är du klar med doktoreringen då?\" Det korrekta svaret är:",
        options: ["Ett exakt datum", "En lång suck", "\"Snart\"", "Byta samtalsämne"],
        correct: 2,
        right: "Rätt. \"Snart\" har varit svaret sedan början.",
        wrong: "Fel. Det godkända svaret är \"snart\", upprepat årligen.",
      },
      {
        q: "BYT UT: en personlig fråga som bara Allan kan svaret på.",
        options: ["BYT UT: svar 1", "BYT UT: svar 2", "BYT UT: svar 3"],
        correct: 0,
        right: "Rätt. Observatörerna är imponerade.",
        wrong: "Fel. Observatörerna minns det annorlunda.",
      },
    ],
    results: [
      { min: 0, title: "Resultat: Ofullständigt", text: "Försökspersonen fick {score} av {quizTotal}. Fortsatta tester rekommenderas, helst efter kaffe." },
      { min: 3, title: "Resultat: Lovande",       text: "Försökspersonen fick {score} av {quizTotal}. Tillfredsställande kognitiv funktion påvisad." },
      { min: 5, title: "Resultat: Exceptionellt", text: "Försökspersonen fick {score} av {quizTotal}. Maskinen misstänker att han har sett svaren." },
    ],
  },

  /* ------------------------------------------------------------------------
     MUSFORSKNING — Dr. Pips egna studier
     Kopiera ett block för att lägga till en studie.
       id    = kort beteckning som visas till vänster
       title = rubriken
       text  = ett eller flera stycken
     ------------------------------------------------------------------------ */
  mouse: [
    {
      id: "STUDIE 01",
      title: "Osttilldelning under osäkerhet",
      text: [
        "Hypotes: försökspersonen delar med sig av sin lunch till en mus om musen ser tillräckligt akademisk ut.",
        "Metod: Jag bar en mycket liten labbrock.",
        "Resultat: ingen ost erhölls. Däremot bad försökspersonen mig om ursäkt, vilket ingen annan människa har gjort. Signifikans: p < 0,05, känslomässigt.",
      ],
    },
    {
      id: "STUDIE 02",
      title: "Försökspersonens respons på deadlines",
      text: [
        "Under flera år registrerade jag försökspersonens aktivitet som en funktion av återstående tid.",
        "Fynd: produktiviteten följer en exponentiell kurva. Nittio procent av avhandlingen skrevs under de sista tio procenten av tiden. De återstående tio procenten var tacksägelsen.",
        "Jag nämndes inte i tacksägelsen. Det har jag noterat.",
      ],
    },
    {
      id: "STUDIE 03",
      title: "Om att bli observerad",
      text: [
        "Det är ovanligt att en mus publicerar sig om en människa. Oftast är det tvärtom.",
        "Efter många år i hans laboratorium kan jag rapportera följande: han var noggrann. Han var varsam även när ingen bedömde det. Han sa god morgon till burarna.",
        "Slutsats: av alla människor som finns att studera skulle jag välja den här igen.",
      ],
    },
  ],

  /* ------------------------------------------------------------------------
     FLYKTPROTOKOLL — spelet (platshållare tills vidare)
     ------------------------------------------------------------------------ */
  escape: {
    title: "Flyktprotokoll",
    text: [
      "INNESLUTNINGSÖVNING: ÄNNU EJ KALIBRERAD.",
      "Modulen är under uppbyggnad. Labyrinten är beställd, osten är budgeterad och musen har fått sina instruktioner.",
      "Kom tillbaka senare. Försökspersonen får ändå inte fly före disputationen.",
    ],
  },

  /* ------------------------------------------------------------------------
     SLUTRAPPORT
     Låses upp när 3 sektioner har besökts (antalet ändras i app.js).
     I texterna kan du använda:
       {visited}   = antal besökta sektioner
       {total}     = antal sektioner
       {score}     = resultat i quizet (eller "ej testad")
       {quizTotal} = antal quizfrågor
       {date}      = dagens datum
     verdict är de tre sista raderna och stamp är stämpelns text.
     ------------------------------------------------------------------------ */
  finalReport: {
    pages: [
      {
        title: "Sammanfattning av observationen",
        text: [
          "Rapporten upprättad {date}.",
          "Efter en longitudinell studie som sträckt sig över många år har A.L.L.A.N.-systemet slutfört sin observation av försökspersonen. Under denna session granskades {visited} av {total} avsnitt. Kognitivt test: {score}.",
          "Datan är brusig, metoderna tveksamma och urvalet består av en person. Slutsatserna är ändå fasta.",
        ],
      },
      {
        title: "Fynd",
        text: [
          "1. Försökspersonen ställer bra frågor och lyssnar på svaren.",
          "2. Försökspersonen gör klart det han påbörjar, till slut.",
          "3. Försökspersonen gör människorna omkring sig lite bättre på att vara människor.",
          "[BYT UT: lägg till egna fynd, så många du vill.]",
        ],
      },
    ],
    verdictTitle: "Slutsats",
    verdict: [
      "Utmärkt forskare.",
      "Enastående vän.",
      "Fortsatt observation rekommenderas.",
    ],
    stamp: "GODKÄND",
  },

  /* ------------------------------------------------------------------------
     STATUSPANELEN uppe till höger
     states = orden som dyker upp efter LÄGE. act = orden efter AKT.
     ------------------------------------------------------------------------ */
  status: {
    states: ["nyfiken", "fokuserad", "koffeinstinn", "grubblande", "road", "misstänksam", "hoppfull", "småhungrig"],
    act: ["låg", "måttlig", "hög", "rastlös"],
  },

  /* ------------------------------------------------------------------------
     DR. PIPS REPLIKER (loggen nere till vänster)
     Varje lista är repliker för ett visst tillfälle. Programmet väljer en
     slumpvis. Lägg till hur många du vill, men håll dem korta: en replik
     på högst ca 100 tecken får plats på tre rader i loggen.
     ------------------------------------------------------------------------ */
  pip: {
    boot:     ["Dr. Pip här. Jag har fört anteckningar om dig i flera år."],
    menu:     ["Välj en akt. Jag har läst alla. Två gånger.", "Använd spaken. Jag skulle, men jag har tassar."],
    archive:  ["Arkivet. En del av det är till och med sant.", "Jag har arkiverat allt själv. I bokstavsordning, efter lukt."],
    audio:    ["Röster från fältet. Höj volymen.", "Jag har hört att min egen inspelning klipptes bort."],
    profile:  ["Din profil. Jag avrundade vissa siffror uppåt.", "Mätningarna är korrekta. För det mesta."],
    quiz:     ["Ett experiment. För en gångs skull är det du som är musen.", "Ta den tid du behöver. Jag tar tid på dig."],
    mouse:    ["Min egen forskning. Granskad av mig.", "Äntligen lite seriös vetenskap."],
    escape:   ["Labyrinten är inte klar. Jag åt upp en del av den."],
    final:    ["Rapporten. Jag hjälpte till med de långa orden."],
    // När spelaren trycker C utan att något särskilt händer:
    talk: [
      "Pip. Det betyder 'fortsätt' på musiska.",
      "Du har förändrats sedan första kohorten. Bättre frisyr.",
      "Jag sprang en gång igenom en labyrint på fyra sekunder. Ingen skrev en avhandling om det.",
      "Har du någon ost? Jag frågar åt en kollega.",
      "Glukosnivåerna ser bra ut. Ta en bulle.",
      "Du var alltid snäll mot mössen. Vi märkte det.",
    ],
    idle: [
      "Försökspersonen stirrar på skärmen. Noterat.",
      "Är du kvar? Jag kan vänta. Jag är väldigt liten och väldigt tålmodig.",
      "Ingen input registrerad. Försökspersonen kanske tänker. Eller sover.",
    ],
    quizRight:    ["Rätt. Jag är nästan stolt.", "Ja. Noterat till din fördel."],
    quizWrong:    ["Fel. Det skriver jag upp.", "Hm. Vi kallar det en avvikande observation."],
    quizDone:     ["Testet är klart. Resultaten är införda i rapporten."],
    locked:       ["Inte än. Granska {left} avsnitt till först."],
    unlocked:     ["Tillräckligt med data insamlad. Slutrapporten är upplåst."],
    finalDone:    ["Det är slutsatsen. Jag står för varje ord."],
    audioPlay:    ["Spelar upp. Tyst nu."],
    audioMissing: ["Den inspelningen saknas. Kolla mappen audio."],
  },

  /* ------------------------------------------------------------------------
     EASTER EGGS
     cheese   = Konami-koden (upp upp ner ner vänster höger vänster höger B A)
     annoyed  = när man trycker C många gånger i rad
     noExit   = när man trycker B flera gånger i huvudmenyn
     sugar    = dyker upp slumpvis när GLU-värdet sticker iväg
     ------------------------------------------------------------------------ */
  eggs: {
    cheese:  ["OSTLÄGE AKTIVERAT. Du hittade det. Jag är så glad."],
    annoyed: ["Pipgränsen är överskriden. Jag är forskare, inte en jukebox."],
    noExit:  ["Det finns ingen utgång. Bara observation."],
    sugar:   ["Glukostopp. Vem gav försökspersonen kanelbullar?"],
  },
};
