/* ==========================================================================
   A.L.L.A.N. — INNEHÅLL
   ==========================================================================
   Här ligger ALLA texter: menyn, ärendefiler, ljudfiler, quizfrågor,
   Dr. Pips repliker och slutrapporten. Du behöver aldrig röra app.js för
   att ändra innehåll.

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
    title: "System Start",
    lines: [
      "A.L.L.A.N. LONGITUDINAL OBSERVATION SYSTEM v2.3.1",
      "Waking observation core ............ OK",
      "Checking brass fittings ............ OK",
      "Calibrating curiosity sensors ...... OK",
      "Loading subject records ............ 4 812 entries",
      "Locating laboratory mouse .......... FOUND (asleep)",
      "Waking laboratory mouse ............ OK (reluctant)",
      "Subject detected: ALLAN",
      "Observation period: many years. Ethics approval: pending.",
    ],
    prompt: "PRESS  A  TO BEGIN",
  },

  /* ------------------------------------------------------------------------
     HUVUDMENYN
     Ändra gärna label (namnet) och desc (raden under menyn).
     Ändra INTE id. nav styr vilket ord i toppmenyn som lyser:
     "archive", "observation", "audio", "experiments" eller "reports".
     ------------------------------------------------------------------------ */
  menuTitle: "Main Index",
  menu: [
    { id: "archive",  nav: "archive",     label: "Archive",          desc: "Case files collected on the subject." },
    { id: "audio",    nav: "audio",       label: "Audio Logs",       desc: "Recorded field notes and messages." },
    { id: "profile",  nav: "observation", label: "Subject Profile",  desc: "Everything the machine knows about Allan." },
    { id: "quiz",     nav: "experiments", label: "Experiments",      desc: "A short cognitive assessment." },
    { id: "mouse",    nav: "observation", label: "Mouse Research",   desc: "Independent studies by Dr. Pip." },
    { id: "escape",   nav: "experiments", label: "Escape Protocol",  desc: "Containment exercise. Under construction." },
    { id: "final",    nav: "reports",     label: "Final Report",     desc: "Conclusions of the observation." },
  ],

  /* ------------------------------------------------------------------------
     ARCHIVE — ärendefiler
     Lägg till en ny fil genom att kopiera ett helt block { ... }, klistra
     in det sist i listan och ändra texterna.
       id    = kort beteckning som visas till vänster
       date  = valfri text, t.ex. ett årtal
       title = rubriken
       text  = ett eller flera stycken
     ------------------------------------------------------------------------ */
  archive: [
    {
      id: "CF-001",
      date: "BYT UT: år",
      title: "First Contact",
      text: [
        "The subject was first observed in his natural habitat. Initial notes describe him as curious, well-mannered and suspiciously good at explaining things.",
        "[BYT UT: skriv här hur ni träffades, gärna i samma torra forskarton.]",
        "Recommendation at the time: continue observation. This recommendation has never been withdrawn.",
      ],
    },
    {
      id: "CF-002",
      date: "The thesis years",
      title: "Prolonged Exposure to Research",
      text: [
        "The subject voluntarily entered a doctoral programme. No coercion was detected. Researchers remain puzzled.",
        "Over the following years he was observed pipetting, re-pipetting, reading the same paragraph eleven times, and saying \"it is almost done\" with decreasing conviction.",
        "Despite this, the subject continued to treat patients, answer messages from friends and show up when it mattered. This is considered statistically unusual.",
      ],
    },
    {
      id: "CF-003",
      date: "BYT UT: datum",
      title: "Field Observation",
      text: [
        "[BYT UT: ett minne från en resa, en fest eller en helt vanlig kväll som blev minnesvärd.]",
        "Observers noted elevated laughter levels for several hours afterwards. No adverse effects were recorded.",
      ],
    },
    {
      id: "CF-004",
      date: "Ongoing",
      title: "Dietary Analysis",
      text: [
        "Primary fuel source: coffee. Secondary fuel source: more coffee. Tertiary fuel source: whatever was left in the department kitchen.",
        "Note the irony of a man studying glucose metabolism while living on cinnamon buns during deadline weeks. The machine does not judge. The mouse does, a little.",
      ],
    },
    {
      id: "CF-005",
      date: "BYT UT: datum",
      title: "Incident Report",
      text: [
        "[BYT UT: den där historien som alltid berättas. Ni vet vilken.]",
        "The subject maintains that it was not his fault. The archive takes no position, but has kept the photographs.",
      ],
    },
    {
      id: "CF-006",
      date: "Classified",
      title: "A Note from the Observers",
      text: [
        "This file is not scientific.",
        "[BYT UT: en genuin hälsning. Vad Allan betyder för dig, och varför du byggde en hel maskin för att säga det.]",
      ],
    },
  ],

  /* ------------------------------------------------------------------------
     AUDIO LOGS — ljudfiler
     1. Lägg ljudfilen i mappen audio/ (mp3, ogg eller wav).
     2. Lägg till en rad här med exakt samma filnamn.
     Saknas filen visas "FILE NOT FOUND" i stället för att något kraschar.
     ------------------------------------------------------------------------ */
  audio: [
    { title: "Log 01 — Opening Statement",  note: "BYT UT: vem som pratar", file: "audio/log01.mp3" },
    { title: "Log 02 — Field Recording",    note: "BYT UT: vem som pratar", file: "audio/log02.mp3" },
    { title: "Log 03 — Message for Subject", note: "BYT UT: vem som pratar", file: "audio/log03.mp3" },
  ],

  /* ------------------------------------------------------------------------
     SUBJECT PROFILE
     Varje block är en sida. rows är par av ["Etikett", "Värde"].
     Högst 8 rader per sida får plats.
     ------------------------------------------------------------------------ */
  profile: [
    {
      title: "Identity",
      rows: [
        ["Designation", "Subject A"],
        ["Name", "Allan"],
        ["Species", "Homo sapiens (var. medicus)"],
        ["Occupation", "Physician, PhD candidate"],
        ["Status", "Pre-defence"],
        ["Habitat", "Clinic, lab, wherever the coffee is"],
        ["Threat level", "Minimal (rises when hungry)"],
      ],
    },
    {
      title: "Measured Traits",
      rows: [
        ["Curiosity", "97 %"],
        ["Kindness", "Off the chart (chart replaced twice)"],
        ["Patience", "High with patients, low with printers"],
        ["Coffee dependency", "Clinically significant"],
        ["Sleep", "Data missing"],
        ["Humour", "Dry, well tolerated"],
        ["BYT UT: egenskap", "BYT UT: värde"],
      ],
    },
    {
      title: "Thesis",
      rows: [
        ["Title", "Sweet Beginnings, Lasting Consequences"],
        ["Field", "Maternal diabetes, cardiometabolic outcomes in offspring"],
        ["Model organism", "Mus musculus (see: Dr. Pip)"],
        ["Pages", "Too many"],
        ["Defence date", "BYT UT: datum"],
        ["Predicted outcome", "Pass, with applause"],
      ],
    },
  ],

  /* ------------------------------------------------------------------------
     EXPERIMENTS — quiz
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
    title: "Cognitive Assessment",
    intro: [
      "The subject will now be tested. Answer honestly. Results are permanent and will be entered into the Final Report.",
      "There is no time limit. The mouse is watching.",
    ],
    questions: [
      {
        q: "What is the primary energy source of a PhD candidate?",
        options: ["Glucose", "Coffee", "Sleep", "Hope"],
        correct: 1,
        right: "Correct. Hope was depleted in year two.",
        wrong: "Incorrect. The answer is coffee. It has always been coffee.",
      },
      {
        q: "The molecular formula of glucose is:",
        options: ["C6H12O6", "C2H5OH", "H2O", "Fe2O3"],
        correct: 0,
        right: "Correct. It is also printed on the wall behind you.",
        wrong: "Incorrect. The subject has written a thesis on this. Concerning.",
      },
      {
        q: "Reviewer 2 asks for \"minor revisions\". This means:",
        options: ["A few typos", "Three new experiments", "Start over", "Nobody knows"],
        correct: 3,
        right: "Correct. Nobody has ever known.",
        wrong: "Incorrect. Nobody knows, least of all Reviewer 2.",
      },
      {
        q: "Which species has contributed most to the subject's thesis?",
        options: ["Homo sapiens", "Mus musculus", "Supervisors", "The coffee machine"],
        correct: 1,
        right: "Correct. Dr. Pip accepts your gratitude.",
        wrong: "Incorrect. Dr. Pip is deeply offended.",
      },
      {
        q: "Someone asks \"So when are you finished with the PhD?\" The correct response is:",
        options: ["A precise date", "A long sigh", "\"Soon\"", "Change the subject"],
        correct: 2,
        right: "Correct. \"Soon\" has been the answer since the beginning.",
        wrong: "Incorrect. The accepted answer is \"soon\", repeated yearly.",
      },
      {
        q: "BYT UT: en personlig fråga som bara Allan kan svaret på.",
        options: ["BYT UT: svar 1", "BYT UT: svar 2", "BYT UT: svar 3"],
        correct: 0,
        right: "Correct. The observers are impressed.",
        wrong: "Incorrect. The observers remember it differently.",
      },
    ],
    results: [
      { min: 0, title: "Result: Inconclusive", text: "The subject scored {score} of {quizTotal}. Further testing is recommended, preferably after coffee." },
      { min: 3, title: "Result: Promising",    text: "The subject scored {score} of {quizTotal}. Adequate cognitive function detected." },
      { min: 5, title: "Result: Exceptional",  text: "The subject scored {score} of {quizTotal}. The machine suspects he has seen the answers." },
    ],
  },

  /* ------------------------------------------------------------------------
     MOUSE RESEARCH — Dr. Pips egna studier
     Fungerar precis som Archive: kopiera ett block för att lägga till.
     ------------------------------------------------------------------------ */
  mouse: [
    {
      id: "STUDY 01",
      title: "Cheese Allocation Under Uncertainty",
      text: [
        "Hypothesis: the subject will share his lunch with a mouse if the mouse looks sufficiently academic.",
        "Method: I wore a very small lab coat.",
        "Result: no cheese was obtained. However, the subject apologised to me, which no other human has done. Significance: p < 0.05, emotionally.",
      ],
    },
    {
      id: "STUDY 02",
      title: "The Subject's Response to Deadlines",
      text: [
        "Over several years I recorded the subject's activity as a function of time remaining.",
        "Finding: productivity follows an exponential curve. Ninety percent of the thesis was produced in the final ten percent of the time. The remaining ten percent was the acknowledgements.",
        "I was not mentioned in the acknowledgements. I have noted this.",
      ],
    },
    {
      id: "STUDY 03",
      title: "On Being Observed",
      text: [
        "It is unusual for a mouse to publish on a human. Usually it is the other way round.",
        "After many years in his laboratory I can report the following: he was careful. He was gentle when nobody was grading it. He said good morning to the cages.",
        "Conclusion: of all the humans available for study, I would choose this one again.",
      ],
    },
  ],

  /* ------------------------------------------------------------------------
     ESCAPE PROTOCOL — spelet (platshållare tills vidare)
     ------------------------------------------------------------------------ */
  escape: {
    title: "Escape Protocol",
    text: [
      "CONTAINMENT EXERCISE: NOT YET CALIBRATED.",
      "This module is under construction. The maze has been ordered, the cheese has been budgeted, and the mouse has been briefed.",
      "Return later. The subject is not permitted to escape before the defence anyway.",
    ],
  },

  /* ------------------------------------------------------------------------
     FINAL REPORT
     Låses upp när 3 sektioner har besökts (antalet ändras i app.js).
     I texterna kan du använda:
       {visited}   = antal besökta sektioner
       {total}     = antal sektioner
       {score}     = resultat i quizet (eller "not tested")
       {quizTotal} = antal quizfrågor
       {date}      = dagens datum
     verdict är de tre sista raderna och stamp är stämpelns text.
     ------------------------------------------------------------------------ */
  finalReport: {
    pages: [
      {
        title: "Summary of Observation",
        text: [
          "Report filed {date}.",
          "After a longitudinal study spanning many years, the A.L.L.A.N. system has completed its observation of the subject. During this session {visited} of {total} records were reviewed. Cognitive assessment: {score}.",
          "The data are noisy, the methods questionable and the sample size is one. The conclusions are nevertheless firm.",
        ],
      },
      {
        title: "Findings",
        text: [
          "1. The subject asks good questions and listens to the answers.",
          "2. The subject finishes what he starts, eventually.",
          "3. The subject makes the people around him slightly better at being people.",
          "[BYT UT: lägg till egna fynd, så många du vill.]",
        ],
      },
    ],
    verdictTitle: "Conclusion",
    verdict: [
      "Excellent researcher.",
      "Exceptional friend.",
      "Further observation recommended.",
    ],
    stamp: "APPROVED",
  },

  /* ------------------------------------------------------------------------
     STATUSPANELEN uppe till höger
     states = orden som dyker upp efter STATE. act = orden efter ACT.
     ------------------------------------------------------------------------ */
  status: {
    states: ["curious", "focused", "caffeinated", "pondering", "amused", "suspicious", "hopeful", "peckish"],
    act: ["low", "moderate", "high", "fidgeting"],
  },

  /* ------------------------------------------------------------------------
     DR. PIPS REPLIKER (loggen EXPERIMENTAL NOTES nere till vänster)
     Varje lista är repliker för ett visst tillfälle. Programmet väljer en
     slumpvis. Lägg till hur många du vill, men håll dem korta: en replik
     på högst ca 100 tecken får plats på tre rader i loggen.
     ------------------------------------------------------------------------ */
  pip: {
    boot:     ["Dr. Pip here. I have been taking notes on you for years."],
    menu:     ["Pick a file. I have read them all. Twice.", "Use the stick. I would, but I have paws."],
    archive:  ["The archive. Some of it is even true.", "I filed these myself. Alphabetically, by smell."],
    audio:    ["Voices from the field. Turn it up.", "I am told my own recording was cut."],
    profile:  ["Your profile. I rounded some numbers up.", "The measurements are accurate. Mostly."],
    quiz:     ["An experiment. For once you are the mouse.", "Take your time. I am timing you."],
    mouse:    ["My own research. Peer reviewed by me.", "Finally, some serious science."],
    escape:   ["The maze is not ready. I ate part of it."],
    final:    ["The report. I helped with the long words."],
    // När spelaren trycker C utan att något särskilt händer:
    talk: [
      "Squeak. That is mouse for 'carry on'.",
      "You have changed since the first cohort. Better hair.",
      "I once ran a maze in four seconds. Nobody wrote a thesis about it.",
      "Do you have any cheese? Asking for a colleague.",
      "Glucose levels look fine. Have a bun.",
      "You were always kind to the mice. We noticed.",
    ],
    idle: [
      "Subject is staring at the screen. Noted.",
      "Still there? I can wait. I am very small and very patient.",
      "No input detected. Subject may be thinking. Or asleep.",
    ],
    quizRight:    ["Correct. I am almost proud.", "Yes. Noted in your favour."],
    quizWrong:    ["Wrong. I am writing that down.", "Hm. We will call that an outlier."],
    quizDone:     ["Test complete. Results entered in the report."],
    locked:       ["Not yet. Review {left} more section(s) first."],
    unlocked:     ["Enough data collected. Final Report unlocked."],
    finalDone:    ["That is the conclusion. I stand by every word."],
    audioPlay:    ["Playing. Shh."],
    audioMissing: ["That tape is missing. Check the audio folder."],
  },

  /* ------------------------------------------------------------------------
     EASTER EGGS
     cheese   = Konami-koden (upp upp ner ner vänster höger vänster höger B A)
     annoyed  = när man trycker C många gånger i rad
     noExit   = när man trycker B flera gånger i huvudmenyn
     sugar    = dyker upp slumpvis när GLU-värdet sticker iväg
     ------------------------------------------------------------------------ */
  eggs: {
    cheese:  ["CHEESE MODE ENGAGED. You found it. I am so happy."],
    annoyed: ["Squeak limit exceeded. I am a scientist, not a jukebox."],
    noExit:  ["There is no exit. Only observation."],
    sugar:   ["Glucose spike. Who gave the subject cinnamon buns?"],
  },
};
