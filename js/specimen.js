/* ==========================================================================
   A.L.L.A.N. — KARAKTÄRSKORTET (SPECIMEN No. 001)
   ==========================================================================
   Allans kort, som utvecklas genom arkivets kapitel. Här ändrar du namn,
   nivåer, förmågor och stats. Du behöver aldrig röra app.js.

   Kortet visas automatiskt som första bevis i kapitel 1 och som sista bevis
   i varje annat kapitel som har en nivå nedan (och som inte är förseglat),
   så att Allan levlar upp när kapitlet är läst. Första gången en högre nivå visas
   spelas en LEVEL UP-animation. I arkivets kapitellista kommer man åt
   kortet när som helst med höger (▶) och kan bläddra bland de nivåer som
   hittills låsts upp.

   ÖVERST
     no    = specimennumret, t.ex. "001"
     name  = försökspersonens namn
     stats = vilka egenskaper som mäts, i ordning: [förkortning, namn]
     max   = skalans topp (mätarna fylls i förhållande till den)

   NIVÅER — en per kapitel
     chapter    = kapitlets nummer i arkivet (1–7)
     level      = nivån som visas på kortet
     evolution  = utvecklingsformens namn (rubrik, LEVEL UP-rutan)
     name       = raden efter namnet på kortet, t.ex. "Lomma-formen"
     class      = överraden på kortet, t.ex. "ORIGIN CLASS"
     src        = bilden i kortets fönster. Byt mot ett riktigt foto!
     focus      = (valfritt) vilken del av bilden som syns i fönstret,
                  "vänster% topp%". "50% 30%" visar mer av övre delen.
     color      = kortets bakgrundsfärg (marmoreras automatiskt)
     icon       = symbolen i "energicirklarna"
     type, origin, status = det gula bandet under bilden
     abilities  = förmågorna, som attacker på ett Pokémonkort:
                  { name, text, power }. text och power är valfria.
                  Förmågor som inte fanns på förra nivån får en NY-etikett
                  och visas som NEW ABILITY UNLOCKED när nivån låses upp.
     weakness, resistance, retreat = raden längst ner på kortet
     stats      = värdena, 0–max
     comment    = Dr. Pips kommentar i rutan längst ner på kortet
     levelUp    = vad Dr. Pip säger när nivån låses upp

   Sök efter BYT UT för att hitta platshållarna.
   ========================================================================== */

CONTENT.specimen = {
  no: "001",
  name: "Allan",
  max: 100,
  stats: [
    ["INT", "Intelligens"],
    ["SOC", "Social förmåga"],
    ["CHA", "Karisma"],
    ["MUS", "Musikalitet"],
    ["END", "Uthållighet"],
    ["CHAOS", "Kaospotential"],
  ],

  levels: [
    /* ---------------------------------------------------------------- 1 */
    {
      chapter: 1,
      level: 1,
      evolution: "Lomma-exemplaret",
      name: "Lomma-formen",
      class: "ORIGIN CLASS",
      src: "images/archive/allanprofile1.jpg",
      focus: "50% 28%",
      color: "#86bcb0",
      icon: "≈",
      type: "Kustexemplar",
      origin: "Lomma, Skåne",
      status: "Under observation",
      abilities: [
        { name: "Academic Potential", text: "Läser in en termin på en helg. Motståndaren känner sig dum.", power: "90" },
        { name: "Alto Saxophone", text: "Spelar ett solo. Alla i närheten blir knäsvaga.", power: "30" },
        { name: "High Energy", text: "Deltar i fyra aktiviteter samtidigt. Kan inte stoppas.", power: "∞" },
      ],
      weakness: "Vila",
      resistance: "Tristess",
      retreat: "Aldrig",
      stats: { INT: 78, SOC: 34, CHA: 41, MUS: 62, END: 70, CHAOS: 12 },
      comment: "Vid första anblick ett relativt harmlöst exemplar. Forskargruppen har ännu ingen anledning till oro.",
      levelUp: "Ett nytt exemplar har registrerats. Relativt harmlöst. Jag skriver det med blyerts.",
    },

    /* ---------------------------------------------------------------- 2 */
    {
      chapter: 2,
      level: 2,
      evolution: "Saxmannen",
      name: "Saxmannen",
      class: "INFILTRATOR CLASS",
      src: "images/archive/profile2.png",
      focus: "50% 30%",
      color: "#b49bd3",
      icon: "♪",
      type: "Revyexemplar",
      origin: "Kattes källare, Lund",
      status: "Infiltration pågår",
      abilities: [
        { name: "Social Infiltration", text: "Blir en självklar del av gruppen innan någon märkt att han kommit.", power: "60" },
        { name: "Alto Saxophone", text: "Öppnar dörrar som källarens invånare aldrig hittade.", power: "40" },
        { name: "Pizza Diplomacy", text: "Sitter alltid i rätt ring kring rätt pizza.", power: "20" },
      ],
      weakness: "IB-läxor",
      resistance: "Källaren",
      retreat: "Ingen anledning",
      stats: { INT: 80, SOC: 68, CHA: 63, MUS: 74, END: 66, CHAOS: 29 },
      comment: "Försökspersonen har lämnat källaren. Det stod inte i studieplanen.",
      levelUp: "Det här gick betydligt fortare än väntat.",
    },

    /* ---------------------------------------------------------------- 3 */
    {
      chapter: 3,
      level: 3,
      evolution: "Krisgeneralen",
      name: "Krisgeneralen",
      class: "COMMAND CLASS",
      src: "images/archive/placeholder.svg",   // BYT UT
      color: "#dc977a",
      icon: "★",
      type: "Befälsexemplar",
      origin: "Katterevyn, Lund",
      status: "General 2016",
      abilities: [
        { name: "General's Speech", text: "Relativt formell och fjäskig. Hela revyn rörs till tårar.", power: "70" },
        { name: "Crisis Management", text: "Hittar en kris. Finns ingen skapar han en.", power: "50" },
        { name: "Emergency Summit", text: "Kallar till toppmöte på måndag. Utfallet är okänt.", power: "?" },
      ],
      weakness: "Ny rektor",
      resistance: "Jantelagen",
      retreat: "Bordlagt",
      stats: { INT: 81, SOC: 77, CHA: 79, MUS: 75, END: 58, CHAOS: 61 },
      comment: "Leder nu en organisation som han samtidigt analyserar. Inga jävsfrågor har noterats.",
      levelUp: "Exemplaret har uppnått generalsstatus. Forskargruppen är bekymrad.",
    },

    /* ---------------------------------------------------------------- 4 */
    {
      chapter: 4,
      level: 4,
      evolution: "Balgästen",
      name: "Balgästen",
      class: "FORMAL CLASS",
      src: "images/archive/placeholder.svg",   // BYT UT
      color: "#a3acd0",
      icon: "✦",
      type: "Frackexemplar",
      origin: "AF-borgen, Lund",
      status: "Vaken vid soluppgång",
      abilities: [
        { name: "White Tie Protocol", text: "Frack, vit väst, inga fläckar. Statistiskt osannolikt.", power: "70" },
        { name: "Party Gene", text: "Aktiveras efter midnatt. Avaktiveras vid soluppgång. Ibland.", power: "80" },
        { name: "Father Paparazzi", text: "Fäderna dokumenterar varje steg. +20 till CHA.", power: "20" },
      ],
      weakness: "Soluppgång",
      resistance: "Trötthet",
      retreat: "Kattestak",
      stats: { INT: 82, SOC: 88, CHA: 91, MUS: 75, END: 84, CHAOS: 70 },
      comment: "Ett ovanligt välklätt exemplar. Notera att även jag har klätt upp mig.",
      levelUp: "Frack. Fluga. Soluppgång. Exemplaret har nått sin festliga form.",
    },

    /* ---------------------------------------------------------------- 5 */
    {
      chapter: 5,
      level: 5,
      evolution: "Distanssocialiseraren",
      name: "Distansformen",
      class: "REMOTE CLASS",
      src: "images/archive/placeholder.svg",   // BYT UT
      color: "#93c4df",
      icon: "✉",
      type: "Fjärrexemplar",
      origin: "Okänd ort",
      status: "Övervakas på distans",
      abilities: [
        { name: "Long-Distance Friendship", text: "Håller kontakten över hundratals kilometer. Mätfel misstänks.", power: "60" },
        { name: "Snapchat Speed", text: "Snabbast på Snapchat. Det visste ni redan.", power: "50" },
        { name: "Party Gene", text: "Fungerar även på distans. Tyvärr.", power: "80" },
      ],
      weakness: "Tågtider",
      resistance: "Avstånd",
      retreat: "Nästa tåg",
      stats: { INT: 88, SOC: 85, CHA: 86, MUS: 70, END: 80, CHAOS: 64 },
      comment: "Observeras numera på distans. Försökspersonen verkar inte ha märkt någon skillnad.",
      levelUp: "Avståndet ökade. Kontakten gjorde det inte. Jag har kalibrerat om instrumenten två gånger.",
    },

    /* ---------------------------------------------------------------- 6 */
    {
      chapter: 6,
      level: 6,
      evolution: "Stockholms-Allan",
      name: "Stockholmsformen",
      class: "METROPOLITAN CLASS",
      src: "images/archive/placeholder.svg",   // BYT UT
      color: "#a2afbd",
      icon: "▲",
      type: "Huvudstadsexemplar",
      origin: "Stockholm",
      status: "Återförenad",
      abilities: [
        { name: "Spex Veteran", text: "Tar sig upp på scen även i huvudstaden. Helt, den här gången.", power: "60" },
        { name: "Capital Adaptation", text: "Står till vänster i rulltrappan. För det mesta.", power: "30" },
        { name: "Infinite Stamina", text: "Uthålligheten har passerat skalans övre gräns.", power: "∞" },
      ],
      weakness: "Hyresmarknaden",
      resistance: "Mörker kl. 15",
      retreat: "Skåne",
      stats: { INT: 90, SOC: 92, CHA: 90, MUS: 78, END: 97, CHAOS: 73 },
      comment: "Återförenad med tidigare identifierade vänner. Studien har blivit en gruppstudie.",
      levelUp: "Uthålligheten har passerat skalans övre gräns. Jag har beställt en ny skala.",
    },

    /* ---------------------------------------------------------------- 7 */
    {
      chapter: 7,
      level: 7,
      evolution: "Dr. Allan",
      name: "Doktorsformen",
      class: "DOCTOR CLASS",
      src: "images/archive/placeholder.svg",   // BYT UT
      color: "#b6dbc4",
      icon: "✚",
      type: "Fullt utvecklat exemplar",
      origin: "Lomma, via allt",
      status: "Doktor",
      abilities: [
        { name: "Doctorate", text: "Är numera doktor. På riktigt. Med papper.", power: "120" },
        { name: "Bedside Manner", text: "Lugnar patienter. Nämner aldrig årsböckerna.", power: "50" },
        { name: "Alto Saxophone", text: "Används vid speciella tillfällen. Effekten har inte avtagit.", power: "30" },
      ],
      weakness: "Årsböckerna",
      resistance: "Allt",
      retreat: "Har jour",
      stats: { INT: 99, SOC: 94, CHA: 95, MUS: 80, END: 98, CHAOS: 50 },
      comment: "Studien har pågått i tretton år. Exemplaret är fullt utvecklat. Tror vi.",
      levelUp: "Doktorn är nu doktor. Jag har fortfarande ingen examen. Jag är en mus.",
    },
  ],
};
