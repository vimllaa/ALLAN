/* ==========================================================================
   A.L.L.A.N. — ARKIVET
   ==========================================================================
   Här ligger allt innehåll i Archive: sju kapitel, och i varje kapitel en
   lista med bevis ("exhibits"). Du behöver aldrig röra app.js för att
   lägga till något här.

   KAPITEL
     title = namnet i listan
     years = årtal som visas till höger i listan, t.ex. "2013" eller "2016–2019"
     desc  = en kort rad som visas när kapitlet är markerat
     pip   = (valfritt) vad Dr. Pip säger när kapitlet öppnas.
             En text, eller en lista med flera som han väljer slumpvis bland.
     items = bevisen, i den ordning de ska visas. Ett kapitel utan bevis
             (items: []) visas som SEALED och går inte att öppna.

   BEVIS — varje bevis är ett block { type: "...", ... }
   Alla typer kan dessutom ha:
     title = rubrik (annars visas kapitlets namn)
     date  = valfri text, t.ex. "Maj 2013", visas uppe till höger
     label = byter ut ordet uppe till höger, t.ex. "POLAROID" i stället
             för "FOTOGRAFI"
     pip   = något Dr. Pip skriver i sin logg när beviset visas

     type: "image"   Fotografi.
                     src     = sökvägen, t.ex. "images/archive/lomma-01.jpg"
                     caption = (valfritt) bildtext under bilden
                     Tryck A för att se bilden i helskärm.

     type: "text"    Berättelse eller observation.
                     text = ett eller flera stycken. Långa texter delas
                            automatiskt upp på flera sidor.
                     image = (valfritt) bild som visas till höger om texten

     type: "chat"    Återfunnen konversation.
                     me       = (valfritt) namnet vars meddelanden ska stå
                                till höger, som i en mobil
                     messages = lista med { from: "Namn", text: "...", time: "21:04" }
                                (time är valfritt)

     type: "post"    Arkiverat inlägg från sociala medier.
                     platform, author = t.ex. "Facebook", "Allan"
                     text     = ett eller flera stycken
                     image    = (valfritt) bild i inlägget
                     likes    = (valfritt) antal gilla-markeringar
                     comments = (valfritt) lista med { from: "Namn", text: "..." }

     type: "pip"     Dr. Pips fältanteckning.
                     text = ett eller flera stycken

     type: "dossier" Hemligstämplade dokument, ett litet arkiv i arkivet.
                     Blir ett försättsblad, ett uppslag per dokument och
                     (valfritt) en jämförande analys sist.
                     warning = (valfritt) varningsruta innan man får läsa.
                               Där kan man också välja att hoppa över hela
                               beviset.
                     warningGo, warningSkip = (valfritt) texterna på de två
                               valen i varningsrutan
                     skipPip = (valfritt) Dr. Pips kommentar om man hoppar över
                     kicker, heading, text = försättsbladets överrad, rubrik
                                             och stycken
                     docs    = dokumenten, vart och ett med:
                       name       = namnet i innehållsförteckningen
                       title      = rubriken på uppslaget
                       year       = årtal
                       src        = bilden
                       redact     = (valfritt) svarta censurstaplar över bilden,
                                    [vänster, topp, bredd, höjd] i procent
                       verdict    = Dr. Pips bedömning (stor text)
                       level, levelLabel = mätaren för socialt inflytande
                       findings   = korta rader med iakttagelser
                       epithet    = smeknamn, visas i analysen
                       transcript = avskrift av dokumentets text. Skriv █ för
                                    det som ska vara censurerat.
                       pip        = Dr. Pips kommentar i loggen
                     summary = (valfritt) { title, text, pip }

                     I förstoringen trycker man A flera gånger för att zooma
                     närmare, och flyttar runt med spaken.

                     gate    = (valfritt) säkerhetsfråga efter varningen, som
                               måste besvaras för att komma in:
                       question = frågan
                       options  = tre svar, visas som 1, X och 2
                       answer   = vilket som är rätt: 0 = 1, 1 = X, 2 = 2
                       right, wrong = Dr. Pips kommentarer. En
                                  text, eller en lista att välja bland.

     type: "crisis"  Mötesprotokoll: utvalda chattutdrag med Dr. Pips
                     marginalanteckningar.
                     Blir ett försättsblad med dagordning, ett uppslag per
                     punkt och (valfritt) ett beslut sist.
                     kicker, heading, text = försättsbladets överrad, rubrik
                                             och stycken
                     status   = (valfritt) raden längst ner under dagordningen
                     me       = namnet vars meddelanden ska stå till höger
                     roles    = (valfritt) titlar efter namnen,
                                t.ex. { Allan: "Generalen" }
                     excerpts = utdragen, vart och ett med:
                       name       = punkten på dagordningen
                       title      = rubriken på uppslaget
                       level, levelLabel = krismätaren, 0–5
                       messages   = som för "chat". Skriv [[så här]] runt det
                                    Dr. Pip ska stryka under; första [[ ]]
                                    hör till första anteckningen osv.
                                    Skriv █ för det som ska vara censurerat.
                       notes      = Dr. Pips anteckningar i marginalen
                       pip        = Dr. Pips kommentar i loggen
                     summary = (valfritt) { title, label, text, decision, stamp, pip }

                     Tryck A för att visa nästa markering och anteckning
                     (och stämpeln i slutsatsen).

   FOTOALBUM — type: "album"
     Först ett uppslag med texten och upp till tre bilder utspridda, sedan
     en sida per bild. Tryck A på en bild för att förstora den.
       kicker   = (valfritt) överraden ovanför texten
       text     = ett eller flera stycken
       timeline = (valfritt) true ger en himmel från natt till soluppgång
       photos   = bilderna, var och en med:
         src     = bilden
         caption = bildtext
         note    = (valfritt) Dr. Pips anteckning bredvid bilden
         stamp   = (valfritt) klockslag i hörnet, som en gammal kamera
         pip     = (valfritt) Dr. Pips kommentar i loggen

   KAPITEL
     frack = (valfritt) true ger Dr. Pip fluga och hatt i hela kapitlet

   KAPITELOMSLAG — type: "cover"
     En stor bild som först står släckt. A tänder ljuset, nästa A går vidare.
     Passar bäst med en bild som har genomskinlig bakgrund (png).
       kicker, heading = överraden och rubriken ovanför bilden
       src     = bilden
       text    = (valfritt) en rad under bilden
       action  = (valfritt) knapptipset för A, annars "tänd ljusen". Med windows
                 visas det också stort på bilden.
       hint    = (valfritt) kortare variant av action för bandet längst ner
       litPip  = (valfritt) Dr. Pips kommentar när ljuset tänds
       sound   = (valfritt) ljudfil som spelas när ljuset tänds
       size    = (valfritt) bildens storlek i pixlar, t.ex. [1600, 600]
       windows = (valfritt) fönster som tänds ett i taget när ljuset tänds.
                 En rad fönster per rad: [[x1, x2, ...], y, bredd, höjd, rundbåge?]
                 i bildens pixlar (mät i t.ex. Förhandsvisning). I några av de
                 större fönstren dansar det folk.
       fireworks = (valfritt) true ger fyrverkerier på himlen när det blivit kväll

   FÖRFLYTTNINGSKARTA — type: "map"
     En karta över Skåne. Första A zoomar in och ritar rutten, sedan visas
     en iakttagelse per A och sist stämpeln.
       kicker, text = överraden och styckena bredvid kartan
       from, to     = orterna, t.ex. "Lomma" och "Lund". Orterna som finns
                      på kartan står i SKANE i app.js.
       fromNote, toNote = (valfritt) liten röd rad under ortnamnet
       zoom     = (valfritt) förstoringen, annars 4
       routeLabel = (valfritt) rubriken över "Lomma → Lund", annars
                    "MIGRATION ROUTE"
       routePip = (valfritt) Dr. Pips kommentar när rutten ritas
       facts    = iakttagelserna, var och en med:
         label, value = rubrik och värde
         level    = (valfritt) 1–5 ger en mätare under värdet
         pip      = (valfritt) Dr. Pips kommentar
       stamp    = (valfritt) stämpeln, som kommer med sista iakttagelsen

   MAPP FÖRE ETT NYTT AVSNITT
   Vilket bevis som helst kan få folder: { ... }. Då visas först en mapp
   som man öppnar med A innan beviset börjar.
     tab    = texten på fliken, t.ex. "ÄRENDE 004"
     kicker, title, sub = de tre raderna på etiketten
     stamp  = (valfritt) stämpeln på framsidan
     note   = (valfritt) handskriven rad längst ner
     pip    = (valfritt) Dr. Pips kommentar i loggen

   KARAKTÄRSKORTET — type: "specimen"
     Allans kort ligger i specimen.js och visas automatiskt först i kapitel
     1 och sist i varje annat kapitel som har en nivå där. Vill du ha det på ett annat ställe i ett
     kapitel, lägg { type: "specimen" } där. level = (valfritt) vilken nivå.

   BILDER
   Lägg bilderna i mappen images/archive/. Gör dem gärna högst ca 1600 px
   breda, så laddar de snabbt på Raspberry Pi:n. Saknas en bild visas
   "FOTOGRAFI SAKNAS" och filnamnet i stället.

   Sök efter BYT UT för att hitta platshållarna.
   ========================================================================== */

CONTENT.archive = {
  title: "Arkiv",
  tag: "ÄRENDEN 2013–2026",

  // Vad Dr. Pip säger om man försöker öppna ett kapitel som saknar bevis.
  sealed: [
    "Förseglat. Inte ens jag har nyckeln.",
    "Den akten är fortfarande hemligstämplad. Jag har försökt gnaga upp den.",
  ],

  chapters: [
    /* ---------------------------------------------------------------- 1 */
    {
      title: "Lommaexemplaret",
      years: "2013",
      desc: "Ursprunget. En liten ort, en saxofon och fjärde våningen.",
      pip: [
        "Kapitel ett. Jag var mycket yngre. Det var han också.",
        "De tidiga åren. Hantera bevisen varsamt. En del av dem bär fluga.",
      ],
      items: [
        {
          type: "image",
          title: "Tidigaste återfunna fotografiet",
          date: "FÖRE GYMNASIET",
          label: "FOTOGRAFI",
          src: "images/archive/FirstPhotoAllanBefoeGymnsier.jpg",
          caption: "Försökspersonen i full orkestermundering, beväpnad med altsaxofon. Sjömansmössan ska inte tolkas som någon form av koppling till flottan. Vi har kontrollerat.",
          pip: "Notera blicken. Lugn. Fokuserad. Håller saxofonen som om det vore hans käraste ägodel.",
        },
        {
          type: "text",
          title: "Dokumenterad TV-medverkan",
          label: "MEDIEREGISTER",
          text: [
            "Redan innan studien inleddes medverkade försökspersonen i Sveriges smartaste barn.",
            "Det bekräftar två saker: Subjektets intelligens är tidigt dokumenterad, och han utsattes för offentlig observation långt före Dr. Pips forskning.",
            "Arkivet uppskattar inte konkurrensen.",
          ],
          image: "images/archive/AllanITv.png",
        },
        {
          type: "pip",
          title: "Fältanteckning 001 – De första misstankarna",
          label: "FÄLTANTECKNING",
          text: [
            "Registrerade aktiviteter under Lommateiden: Basket, saxofon, skola och TV-medverkan.",
            "Hur försökspersonen hann med allt detta är fortfarande oklart.",
            "Dr. Pip misstänker en onormalt hög energinivå.",
          ],
          pip: "Arkiverat under: Siffrorna går inte ihop.",
        },
        {
          type: "map",
          title: "Den stora migrationen",
          label: "FÖRFLYTTNINGSRAPPORT",
          kicker: "MIGRATION ROUTE · SYDVÄSTRA SKÅNE",
          text: [
            "Försökspersonen lämnade kustsamhället Lomma och förflyttade sig inåt landet, mot Lund.",
            "Avståndet var kort. Konsekvenserna blev långvariga.",
          ],
          from: "Lomma",
          fromNote: "KUSTEN",
          to: "Lund",
          toNote: "INLANDET",
          pip: "Subjektets ursprung är lokaliserat. Lomma. Jag har markerat det i rött så att ingen missar det.",
          routePip: "Förstoring 400 %. Sträckan är fortfarande blygsam. Jag zoomar inte mer, det blir bara pinsamt.",
          facts: [
            { label: "DISTANS", value: "Blygsam (ca 1 mil)", pip: "En mil. Jag har själv sprungit längre i mitt hjul. På en tisdag." },
            { label: "KULTURELL OMSTÄLLNING", value: "Betydande", level: 4, pip: "Från strandpromenad till kullerstenar och studentnationer. Omställningen bedöms som omvälvande." },
            { label: "OBSERVATION", value: "Subjektet lämnade kusten för inlandet.", pip: "En blygsam förflyttning i kilometer. Ett avgörande steg i forskningsmaterialet." },
          ],
          stamp: "MIGRATION BEKRÄFTAD",
        },
        {
          type: "text",
          title: "Destination: Katedralskolan",
          label: "INSKRIVNINGSRAPPORT",
          text: [
            "Väl framme i Lund skrevs försökspersonen in på IB-programmet vid Katedralskolan.",
            "Enligt våra fältobservationer sågs IB-eleverna sällan lämna Kattes källare.",
            "Vissa forskare ifrågasatte om de över huvud taget fick göra det.",
          ],
        },
        {
          type: "image",
          title: "IB-exemplaret",
          date: "IB-TIDEN",
          label: "FOTOGRAFI",
          src: "images/archive/AllanMusicalIBKid.jpg",
          caption: "Försökspersonen iklädd skjorta och fluga. Notera instrumentet. Det är inte en saxofon.",
          pip: "Det där är en gitarr. Våra register nämner bara saxofon. Antingen har han lärt sig ännu ett instrument, eller så börjar mina misstankar stämma…",
        },
        {
          type: "text",
          title: "Infiltrationen påbörjas",
          label: "INCIDENTRAPPORT",
          text: [
            "Enligt samtliga rimliga beräkningar borde arbetsbelastningen på IB-programmet ha lämnat försökspersonen helt utan fritid.",
            "Ändå lyckades subjektet ta sig in i Katterevyn, Katedralskolans anrika och socialt eftertraktade gymnasispex.",
            "Infiltrationsmetod: Saxofon.",
            "En dörr hade öppnats som de flesta invånarna i källaren aldrig ens hittade.",
          ],
          pip: "En försöksperson. Sitta i källaren hela dagarna. Revy på kvällarna. Jag börjar ana ett mönster.",
        },
        {
          type: "pip",
          title: "Fältanteckning 002 – Sammanfattning av första akten",
          label: "FÄLTANTECKNING",
          text: [
            "Slut på Lommaakten.",
            "Vid en genomgång av bevismaterialet framträder ett tydligt mönster.",
            "Försökspersonen tar sig in i ett nytt sammanhang, och innan någon riktigt har förstått hur det gått till verkar han redan vara en självklar del av gruppen.",
            "Jag har därför beslutat att inleda en långtidsstudie.",
            "Att den skulle pågå i tretton år hade jag inte räknat med. Sådant borde framgå av uppdragsbeskrivningen.",
            "Fortsättning följer: Infiltrationen av Katterevyn.",
          ],
        },
      ],
    },

    /* ---------------------------------------------------------------- 2 */
    {
      title: "Infiltrationen av Katterevyn",
      years: "SOCIAL EXPANSION · 2014–2016",
      desc: "En IB-elev, en saxofon och ett osannolikt maktövertagande.",
      pip: "Ah, Katterevyn. Det var här saker och ting började spåra ur.",
      items: [
        {
          type: "image",
          title: "Bevis på lyckad infiltration",
          label: "ARKIVFOTO",
          src: "images/archive/AllanJoinsRevyn.jpg",
          caption: "Försökspersonen (mitten, randig tröja) omgiven av revymedlemmar. Pizza har observerats. Gruppen tycks ha accepterat honom.",
          pip: "Infiltrationen lyckades. Försökspersonen uppvisar inga tecken på att vilja återvända till källaren.",
        },
        {
          type: "dossier",
          title: "Katterevyns årsböcker",
          label: "ARKIVDOKUMENT · KATTEREVYN 2014–2016",
          warning: "Materialet innehåller historiska uppgifter som kan skada försökspersonens nuvarande anseende som respekterad läkare och forskare.",
          warningGo: "Öppna årsböckerna på egen risk",
          warningSkip: "Hoppa över årsböckerna",
          skipPip: "Klokt val. Vissa saker ska man inte veta om sin läkare.",
          gate: {
            question: "Endast behöriga får öppna mappen. Vad heter gruppchatten som Allan, Linn och Vilma delar?",
            options: ["allavisomälskarkatterevyn", "Gossipgang", "Allans Änglar"],
            answer: 1,
            right: ["Korrekt. Behörigheten är bekräftad. Gossipen kan börja.", "Rätt svar. Du är uppenbarligen insatt."],
            wrong: ["Fel. Försöket har loggats.", "Nej. Säkerheten har underrättats. Säkerheten är jag.", "Fel igen? Jag börjar tvivla på din behörighet."],
          },
          kicker: "ARKIVDOKUMENT · KATTEREVYN 2014–2016",
          heading: "Årsböckerna",
          text: [
            "Under granskningen av Katterevyn har forskargruppen kommit över ett antal tidigare okända dokument.",
            "Varje år sammanställde revymedlemmarna en årsbok innehållande fotografier och personbeskrivningar av samtliga deltagare.",
            "Materialet ger en unik inblick i hur försökspersonen uppfattades av sin omgivning.",
            "Vi har valt att publicera utdrag ur dessa dokument i sin ursprungliga form.",
          ],
          pip: "Mycket värdefullt material. För första gången har vi tillgång till andra individers observationer av försökspersonen. Deras vetenskapliga metoder kan dock ifrågasättas.",
          docs: [
            {
              name: "Årsbok 2014",
              title: "Den första årsboken",
              year: "2014",
              src: "images/archive/arsbok-1.jpg",
              redact: [[29.3, 88.2, 17, 2.8]],
              verdict: "Tidig dokumentation av försökspersonen.",
              level: 1,
              levelLabel: "RYKTE",
              epithet: "Sexguden",
              findings: [
                "Epitet: Sexguden, Saxman/Sexman, king",
                "Primärt verktyg: altsaxofon",
                "Källans objektivitet: obefintlig",
              ],
              transcript: [
                "ALLAN ZHAO",
                "Allan. Sexguden. Zhao… Young, wild and free, men före alla dessa är han den sötaste asiaten Revyn någonsin skådat. Rykten går att han kan sno din flickvän om hon hör honom spela saxofon. En sann Saxman/Sexman som kan göra varje tjej alldeles knäsvag, vilket vi fick bevis på under Kaspyxet där man kan säga han var at the top of his game… Låt oss heller inte förbise att han har fått spela på varje tjejs instrument i bandet förutom ████ ██████ om ni förstår vad jag menar. Allan du är en riktig king!",
              ],
              pip: "Första årsboken. Notera epiteten. Jag har valt att inte undersöka dem närmare.",
            },
            {
              name: "Årsbok 2015",
              title: "Den andra årsboken",
              year: "2015",
              src: "images/archive/arsbok-2.jpg",
              verdict: "Ökad social aktivitet och växande inflytande.",
              level: 2,
              levelLabel: "SCEN",
              epithet: "Albatrossen97",
              findings: [
                "Placering: Bandet",
                "Första scenframträdande (delvis: halva försökspersonen)",
                "Kodnamn: albatrossen97",
                "Hookträdet: inga registrerade fynd",
              ],
              transcript: [
                "ALLAN ZHAO – BANDET",
                "Snabbast på Snapchat, men det visste ni säkert redan? Annars så se till att adda albatrossen97 (på egen risk dock, det publiceras stora mängder dumplings och andra ”kinesiska” saker som Allan själv så fint uttrycker det). Sexguden fick för första gången detta året även ta plats på scen, eller halva Allan iallafall, och drog av ett par toner på saxen som måste fått alla flickor (och pojkar) att smälta. Ändå ekar det tomt efter Allan Zhao i hookträdet, vad är det för plan du smider egentligen? Visserligen vet vi alla att leka svår lönar sig i längden, så tanken är kanske att leva ut till fullo nästa år? Förhoppningsvis får vi se dig mer på listan nästa år!",
              ],
              pip: "Försökspersonen har tagit sig upp på scenen. Än så länge bara till hälften. Det är så det börjar.",
            },
            {
              name: "Årsbok 2016",
              title: "Den sista årsboken",
              year: "2016",
              src: "images/archive/arsbok-3.jpg",
              verdict: "Försökspersonen har uppnått generalsstatus. Forskargruppen är bekymrad.",
              level: 3,
              levelLabel: "GENERAL",
              epithet: "Generalen",
              findings: [
                "Titel: General 2016",
                "Omfång: helsida, egen rubrik, egen signatur",
                "Självskattning: ”relativt formell och fjäskig”",
              ],
              transcript: [
                "GENERALEN HAR ORDET!",
                "Ja, vad ska man säga? Ett hektiskt år är över, och jag har ingen aning om vad jag ens ska skriva här. För vad kan jag skriva, som gör året rättvisa? Ett år som svängt, som haft toppar och som haft dalar, som haft tårar och som haft skratt, som egentligen haft allting. Ni har säkerligen märkt att jag bäst uttrycker mig i skrift när jag är relativt formell och fjäskig, så det här får väl bli likadant.",
                "Ni alla har varit helt underbara under årets gång, och jag har njutit av varenda timme, minut, sekund av revyn. Året som nyss varit har verkligen överträffat alla mina förväntningar på ett sätt som jag inte trodde varit möjligt, helt otroligt, och jag kan bara tacka er alla för det. För det hade ju inte varit samma sak utan en enda av er, oavsett vad ni tror själva – alla har bidragit till att göra revyn så underbar som den har varit. Efter lördagsföreställningen så kände jag lycka och stolthet, men även tomhet – revyn för mig, och för alla treor, är slut. Vi kommer aldrig mer att vara med och göra om detta, något som jag avundas er tvåor och ettor enormt. Ta vara på de år ni har kvar och gör dem legendariska, för det här skapar verkligen minnen för livet.",
                "Jag vill avsluta med att säga tack. Tack, till er alla, för att ni varit med och skapat detta. Tack, för att ni gav mig möjligheten att avsluta mina 3 år på Katedralskolan på ett så underbart sätt. Tack, för att just NI sökte revyn och kom med. Man brukar ju säga att det viktigaste är att ha kul, och det är något som jag ändå tror att vi haft under året – och det gör mig stolt som general, över oss alla, för vi har ju verkligen uppnått någonting detta år – någonting bra.",
                "TACK, och PoK – och massa kärlek",
                "Eder General 2016",
                "– Allan Zhao",
              ],
              pip: "Tre år. Från rykte till general. Jag har sett råttor ta över laboratorier långsammare.",
            },
          ],
          summary: {
            title: "Jämförande analys",
            text: [
              "På tre år har försökspersonen gått från rykte, via scenen, till högsta befäl.",
              "Ingen av årsböckerna förklarar hur det gick till. Det är just det som oroar forskargruppen.",
            ],
            pip: "Slutsats: det här var aldrig en revy. Det var ett maktövertagande i tre akter.",
          },
        },
        {
          type: "crisis",
          title: "Generalens krishantering",
          label: "INTERNT MÖTESPROTOKOLL · KATTEREVYN 2016",
          folder: {
            tab: "ÄRENDE 004",
            kicker: "INTERN KORRESPONDENS · 2016",
            title: "Generalens krishantering",
            sub: "Mötesprotokoll · Katterevyn",
            stamp: "BRÅDSKANDE",
            note: "Läs med allvarlig min. /P",
            pip: "En ny mapp. Den är märkt brådskande. Det var den inte.",
          },
          kicker: "INTERN KORRESPONDENS · 2016 · ÄRENDE 004",
          heading: "Kris i ledningen",
          text: [
            "Generalens mandatperiod präglades inte bara av saxofonsolon och festligheter. Ett antal interna meningsskiljaktigheter krävde hans omedelbara uppmärksamhet.",
            "Forskargruppen har granskat en Messenger-konversation där Katterevyns framtid diskuteras med ett allvar som vanligtvis reserveras för regeringskriser.",
            "Samtliga inblandade gick fortfarande i gymnasiet.",
          ],
          status: "STATUS: ÄRENDET UNDER BEHANDLING",
          pip: "Kanal: Messenger. Dagordning: skolans sociala maktstruktur. Organisationens verksamhet: spex.",
          me: "Vilma",
          roles: { Allan: "Generalen", Vilma: "Rådgivare" },
          excerpts: [
            {
              name: "Revyns status som elitorganisation",
              title: "§ 1 Revyns status som elitorganisation",
              level: 2,
              levelLabel: "ALLVARLIG",
              messages: [
                { from: "Allan", text: "Japp, och problemet som finns är [[revyns status på katte]], känner jag iallafall. Just nu känns det, tyvärr, som revyn är [[\"eliten\"]], eller den grupp som flest elever strävar efter att kunna få vara med i." },
              ],
              notes: [
                "Problemet är alltså inte att revyn har för låg status. Problemet är att den har för hög. Ett unikt dilemma.",
                "Eliten? Organisationens huvudsakliga verksamhet var att sätta upp ett spex. Fascinerande självbild.",
                "Avsändaren var vid tillfället själv general i nämnda elit. Inga jävsfrågor har noterats.",
              ],
              pip: "Försökspersonen analyserar maktstrukturerna i en organisation han själv leder.",
            },
            {
              name: "Internationella jämförelser",
              title: "§ 2 Internationella jämförelser",
              level: 3,
              levelLabel: "INTERNATIONELL",
              messages: [
                { from: "Allan", text: "Tycker faktiskt också att vi i Sverige är lite bortklemade med att alltid få vara med på allting genom jantelagen - hade detta varit t.ex. [[i Kina]] hade denna diskussion aldrig uppstått. Dock så tycker jag att det är bra att man inkluderar alla, missförstå mig inte, men när det börjar bli ett problem och när [[folk inte längre är barn]] så är det mer ett hinder än ett hjälpmedel" },
                { from: "Allan", text: "[[är inte så bra på att formulera mig]] men tror att du förstår min grundidé ändå 🙂" },
              ],
              notes: [
                "Diskussionen har nått utrikespolitisk nivå. Antagningen till ett gymnasiespex jämförs nu med Folkrepubliken Kina.",
                "”När folk inte längre är barn.” Avsändaren gick i gymnasiet.",
                "Har just levererat ett samhällsfilosofiskt manifest. Ber om ursäkt för sin formuleringsförmåga.",
              ],
              pip: "Jantelagen har identifierats som ett hot mot spexet. Jag antecknar.",
            },
            {
              name: "Ny skolledning",
              title: "§ 3 Ny skolledning",
              level: 5,
              levelLabel: "HISTORISK",
              messages: [
                { from: "Vilma", text: "Ja nä men förstår precis, och tror att denna diskussionen uppkommer varje år dessutom så [[man kanske inte ska ta det allt för allvarligt heller!]]" },
                { from: "Allan", text: "[[Nej]], skillnaden är att skolan i år har fått en [[ny rektor som inte är insatt i själva kulturen]] och förstår vad revyn är. ███████ har själv sagt att vi inte lägger tillräckligt med fokus på själva spexet, vilket jag tycker är grymt tråkigt." },
              ],
              notes: [
                "Den enda förnuftiga rösten i hela materialet.",
                "Den avfärdas med ett enda ord.",
                "En ny rektor som inte förstår revyns kultur. En tragedi av närmast historiska proportioner, uppenbarligen.",
              ],
              pip: "Rådgivaren föreslog lugn. Generalen valde kris.",
            },
            {
              name: "Toppmöte på måndag",
              title: "§ 4 Toppmöte på måndag",
              level: 4,
              levelLabel: "TOPPMÖTE",
              messages: [
                { from: "Allan", text: "[…] för just nu lägger både jag och många fler ner tid som vi inte har på detta, [[relativt meningslösa tjafset]] 🙂" },
                { from: "Allan", text: "[[(Inte meningslöst i att det inte betyder något, utan att det inte hade behövt uppstå)]]" },
                { from: "Allan", text: "Men ska som sagt [[prata med alla på måndag]]. hoppas kunna lämna goda nyheter efter det 🙂" },
              ],
              notes: [
                "Ett ögonblick av klarsyn.",
                "Tillbakadraget i nästa meddelande. Officiell rättelse utfärdad.",
                "Toppmöte inplanerat till måndag. Nationen väntar på goda nyheter.",
              ],
              pip: "Krisen deeskaleras. Delvis. Med smiley.",
            },
          ],
          summary: {
            title: "Forskargruppens slutsats",
            label: "PROTOKOLLETS JUSTERING",
            text: [
              "Efter noggrann granskning kan forskargruppen konstatera att ett anmärkningsvärt antal gymnasieelever tycks ha betraktat Katterevyn som en institution av avgörande samhällsbetydelse.",
              "Dr. Pip har ännu inte förstått varför.",
            ],
            decision: "Ärendet bordläggs till måndagens toppmöte. Utfallet är okänt. Revyn finns kvar.",
            stamp: "BORDLAGT",
            pip: "Tryck A för att bordlägga ärendet. Det verkar vara så man gör.",
          },
        },
      ],
    },

    /* ---------------------------------------------------------------- 3 */
    {
      title: "Katterevyincidenten",
      years: "BYT UT",
      desc: "BYT UT: en rad om kapitlet.",
      items: [
        {
          type: "text",
          title: "Incidentrapport",
          date: "BYT UT: datum",
          text: [
            "[BYT UT: den där historien som alltid berättas. Ni vet vilken.]",
            "Försökspersonen hävdar att det inte var hans fel. Arkivet tar inte ställning, men har sparat fotografierna.",
          ],
        },
      ],
    },

    /* ---------------------------------------------------------------- 4 */
    {
      title: "Vad vore väl en bal på AF-borgen?",
      years: "STUDENTBAL · 2016",
      desc: "Frack, fäder med kameror och en natt som aldrig tog slut.",
      pip: "En borg. Försökspersonen har uppenbarligen höjt ambitionsnivån.",
      frack: true,   // Dr. Pip bär fluga och hatt i hela kapitlet
      items: [
        {
          type: "cover",
          title: "AF-borgen",
          label: "KAPITEL 4 · LUND",
          kicker: "AKADEMISKA FÖRENINGEN · LUND",
          heading: "Vad vore väl en bal på AF-borgen?",
          src: "images/archive/af-borgen.png",
          text: "Forskargruppen har spårat försökspersonen till en borg i centrala Lund. Klädkod: frack. Syfte: okänt.",
          sound: "sound/anime-wow-sound-effect.mp3",
          litPip: "Ljusen är tända. Balen kan börja. Jag har klätt upp mig för tillfället.",
          action: "starta festen",
          hint: "festa",
          fireworks: true,
          size: [1600, 600],
          windows: [
            // Högra flygeln
            [[864, 926, 989, 1052, 1115, 1177, 1239, 1302, 1364], 459, 38, 49, true],
            [[870, 932, 995, 1058, 1121, 1183, 1246, 1309, 1371], 375, 28, 47, true],
            [[873, 934, 997, 1060, 1123, 1185, 1248, 1311, 1373], 318, 23, 26],
            // Högra hörntornet
            [[1446, 1473, 1499], 200, 16, 22, true],
            [[1446, 1473, 1499], 252, 16, 25, true],
            [[1446, 1498], 317, 19, 24],
            [[1446, 1498], 375, 20, 43, true],
            [[1446, 1498], 461, 20, 45, true],
            // Mittornet
            [[747, 772, 798], 202, 14, 21, true],
            [[747, 772, 798], 255, 14, 24, true],
            [[747, 796], 319, 18, 24],
            [[750, 795], 379, 19, 43, true],
            [[750, 795], 464, 19, 45, true],
            // Entrén
            [[636, 656, 676], 357, 15, 36, true],
            // Stora tornet
            [[484, 537], 199, 12, 32, true],
            [[484, 537], 317, 12, 32, true],
            [[484, 537], 458, 14, 47, true],
            // Vänstra delen
            [[271, 294, 333, 357, 394, 418], 358, 17, 43, true],
            [[239, 265, 289, 313, 337, 361, 385, 409, 432], 285, 13, 26, true],
            [[269, 331, 393], 441, 47, 64, true],
            [[122], 441, 43, 56, true],
            [[117, 137, 156, 175], 345, 11, 32, true],
            [[119, 138, 156], 240, 11, 28, true],
          ],
        },
        {
          type: "album",
          title: "Vad vore väl en bal på AF-borgen?",
          label: "SOCIAL OBSERVATION · 2016",
          kicker: "SOCIAL OBSERVATION · 2016",
          text: [
            "Efter tre år på Katedralskolan, ett betydande antal studietimmar och minst en revykris var det äntligen dags för studentbal.",
            "Dr. Pip fick för första gången i sin karriär klä upp sig i frack. Han har inte tagit av sig den sedan dess.",
            "Försökspersonen anlände tillsammans med Vilma, en sedan tidigare identifierad vän från Katterevyn. Forskargruppen kan även dokumentera att två långa, ståtliga kvinnor har etablerat sig i försökspersonens vänkrets.",
            "Antalet fotografier som togs under kvällen bedöms ha varit omfattande.",
          ],
          pip: "Ett ovanligt välklätt exemplar. Notera att även jag har klätt upp mig.",
          photos: [
            {
              src: "images/archive/allanandVilmaPRom.jpg",
              caption: "Försökspersonen i frack, tillsammans med Vilma.",
              note: "Vit fluga. Vit väst. Inga fläckar. Den statistiska sannolikheten för detta är låg.",
              pip: "Ett ovanligt välklätt exemplar.",
            },
            {
              src: "images/archive/allanvilmalinnprom.jpg",
              caption: "Försökspersonen med sällskap på väg in.",
              note: "Två långa, ståtliga kvinnor har observerats i försökspersonens omedelbara närhet. Det här är ingen slump.",
              pip: "Vänkretsen har utökats. Den genomsnittliga längden likaså.",
            },
            {
              src: "images/archive/pappornaprom.jpg",
              caption: "Fäderna i arbete.",
              note: "Faderlig stolthet uppmättes till nivåer långt över det normala. Antalet fotografier bedöms ha varit omfattande.",
              pip: "Faderlig stolthet uppmättes till nivåer långt över det normala.",
            },
          ],
        },
        {
          type: "album",
          title: "Efterfesten",
          label: "NATTOBSERVATION · 2016",
          kicker: "NATTOBSERVATION · 2016",
          timeline: true,   // himlen från natt till soluppgång
          text: [
            "Studentbalen tog så småningom slut. Det gjorde däremot inte kvällen.",
            "Försökspersonen och ett större antal vänner fortsatte till Kattestak, där natten övergick i morgon och solen till slut gick upp.",
            "Tidiga tecken på försökspersonens senare så väldokumenterade partygen kunde konstateras.",
          ],
          pip: "Klockan är okänd. Solen har gått upp. Försökspersonen är fortfarande socialt aktiv. Anmärkningsvärt.",
          // BYT UT: lägg bilderna från Kattestak i images/archive/ med dessa namn
          photos: [
            {
              src: "images/archive/kattestak-1.jpg",
              stamp: "00:47",
              caption: "Ankomst till Kattestak.",
              note: "Energinivå: hög. Frack: fortfarande på.",
            },
            {
              src: "images/archive/kattestak-2.jpg",
              stamp: "02:31",
              caption: "Natten fortskrider.",
              note: "Inga tecken på trötthet. Forskargruppen börjar däremot bli trött.",
            },
            {
              src: "images/archive/kattestak-3.jpg",
              stamp: "04:12",
              caption: "Solen går upp över Lund.",
              note: "Försökspersonen är fortfarande socialt aktiv. Partygenen bekräftad.",
              pip: "Klockan är okänd. Solen har gått upp. Anmärkningsvärt.",
            },
          ],
        },
        {
          type: "pip",
          title: "En sista anteckning",
          label: "FÄLTANTECKNING · AVSLUTAD GYMNASIEPERIOD",
          text: [
            "Efter tre års observationer på Katedralskolan avslutas nu ett viktigt kapitel i försökspersonens liv.",
            "Nya vänskapsband har etablerats, flera märkliga beteenden dokumenterats och misstankarna om en ovanligt hög energikapacitet kvarstår.",
            "Härifrån kommer försökspersonen och flera av hans närmaste vänner att fortsätta till olika städer.",
            "Frågan är vad som händer med relationerna när avståndet ökar.",
          ],
          pip: "Studien fortsätter. Jag hoppas innerligt att nästa fas innebär mindre nattarbete.",
        },
      ],
    },

    /* ---------------------------------------------------------------- 5 */
    {
      title: "Övervakning på distans",
      years: "BYT UT",
      desc: "BYT UT: en rad om kapitlet.",
      items: [],
    },

    /* ---------------------------------------------------------------- 6 */
    {
      title: "Återföreningen i Stockholm",
      years: "BYT UT",
      desc: "BYT UT: en rad om kapitlet.",
      items: [],
    },

    /* ---------------------------------------------------------------- 7 */
    {
      title: "Doktorn blir doktor",
      years: "2026",
      desc: "BYT UT: en rad om kapitlet.",
      items: [],
    },
  ],
};
