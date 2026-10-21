/* ==========================================================================
   A.L.L.A.N. — logik, navigering, input och ljud
   Texterna ligger i content.js. Här ändrar du bara inställningarna nedan.
   ========================================================================== */
(function () {
  "use strict";

  /* ------------------------------------------------------------------------
     INSTÄLLNINGAR
     Tryck D i programmet för att se vilka nummer dina knappar har,
     och skriv in dem här.
     ------------------------------------------------------------------------ */
  const CONFIG = {
    buttons: {
      A: 0,   // välj
      B: 1,   // tillbaka
      C: 2,   // musen pratar
    },
    axisX: 0,          // joystickens vänster/höger-axel
    axisY: 1,          // joystickens upp/ner-axel
    invertX: false,    // sätt true om vänster och höger är omkastade
    invertY: false,    // sätt true om upp och ner är omkastade
    deadzone: 0.5,     // hur långt spaken måste föras innan det räknas
    dpad: { up: 12, down: 13, left: 14, right: 15 },  // om joysticken rapporteras som knappar

    repeatDelay: 420,  // ms innan en riktning börjar upprepas när spaken hålls
    repeatRate: 150,   // ms mellan upprepningarna

    sound: true,       // false = inga pip och klick
    volume: 0.6,       // 0–1, gäller både effekter och ljudloggar

    unlockAfter: 3,    // antal besökta sektioner innan Final Report låses upp
    idleSeconds: 50,   // sekunder utan input innan Dr. Pip säger något
    idleTimes: 3,      // hur många gånger han pratar för sig själv innan han tystnar
  };

  const C = CONTENT;
  const $ = (id) => document.getElementById(id);
  const el = {
    stage: $("stage"), title: $("main-title"), tag: $("main-tag"), body: $("main-body"),
    pager: $("main-pager"), hints: $("hints"), bandL: $("band-left"), bandR: $("band-right"),
    notes: [...$("notes").children], debug: $("debug"), zoom: $("zoom"), alert: $("alert"),
    nav: [...document.querySelectorAll("#topnav span")],
  };

  const state = {
    stack: [],             // skärmarna man har gått in i; den sista visas
    visited: new Set(),    // besökta sektioner
    read: new Set(),       // öppnade filer
    unlocked: false,
    filed: false,          // slutrapporten läst till slutet
    quizScore: null,
    specimen: 0,           // högsta nivå på Allans kort som har visats
  };
  const SECTIONS = C.menu.filter((m) => m.id !== "final");

  /* ---------- Småhjälp ---------- */
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const pad2 = (n) => String(n).padStart(2, "0");
  const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAJ", "JUN", "JUL", "AUG", "SEP", "OKT", "NOV", "DEC"];
  const dateText = (d) => `${MONTHS[d.getMonth()]} ${pad2(d.getDate())} ${d.getFullYear()}`;

  // Väljer en slumpvis replik, men aldrig samma två gånger i rad.
  const lastPick = new Map();
  function pick(list) {
    if (!list || !list.length) return "";
    let i = Math.floor(Math.random() * list.length);
    if (list.length > 1 && i === lastPick.get(list)) i = (i + 1) % list.length;
    lastPick.set(list, i);
    return list[i];
  }

  // Byter ut {visited}, {score} osv. i texterna.
  function fill(text, extra) {
    const vals = Object.assign({
      visited: state.visited.size,
      total: SECTIONS.length,
      score: state.quizScore === null ? "ej testad" : `${state.quizScore} av ${C.quiz.questions.length}`,
      quizTotal: C.quiz.questions.length,
      date: dateText(new Date()),
    }, extra);
    return String(text).replace(/\{(\w+)\}/g, (m, k) => (k in vals ? vals[k] : m));
  }

  /* ==========================================================================
     LJUD (små pip gjorda i webbläsaren, inga filer behövs)
     ========================================================================== */
  let ac = null;
  function tone(freq, dur, o = {}) {
    if (!CONFIG.sound) return;
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      if (ac.state !== "running") { ac.resume(); return; }
      const t = ac.currentTime + (o.at || 0);
      const osc = ac.createOscillator(), g = ac.createGain();
      osc.type = o.type || "square";
      osc.frequency.setValueAtTime(freq, t);
      if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + dur);
      g.gain.setValueAtTime((o.vol || 0.05) * CONFIG.volume, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(g).connect(ac.destination);
      osc.start(t); osc.stop(t + dur + 0.02);
    } catch (e) { /* inget ljud är inget fel */ }
  }
  const sfx = {
    move:   () => tone(740, 0.035),
    select: () => { tone(660, 0.05); tone(990, 0.08, { at: 0.05 }); },
    back:   () => { tone(520, 0.05); tone(350, 0.08, { at: 0.05 }); },
    error:  () => tone(140, 0.22, { type: "sawtooth", vol: 0.07 }),
    tick:   () => tone(1900, 0.012, { vol: 0.015 }),
    squeak: () => { tone(2300, 0.07, { type: "sine", to: 3300, vol: 0.06 }); tone(2700, 0.09, { type: "sine", to: 3700, vol: 0.06, at: 0.1 }); },
    unlock: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.14, { at: i * 0.1, type: "triangle", vol: 0.08 })),
    folder: () => { tone(260, 0.16, { type: "triangle", to: 520, vol: 0.06 }); tone(180, 0.12, { type: "triangle", vol: 0.04, at: 0.14 }); },
    note:   () => { tone(1250, 0.04, { type: "triangle", vol: 0.06 }); tone(1650, 0.06, { type: "triangle", vol: 0.05, at: 0.05 }); },
    route:  () => [392, 494, 587, 784].forEach((f, i) => tone(f, 0.18, { at: 0.5 + i * 0.32, type: "triangle", vol: 0.05 })),
    levelup: () => { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.12, { at: i * 0.08, type: "square", vol: 0.05 })); tone(1568, 0.4, { at: 0.45, type: "triangle", vol: 0.07 }); },
    stamp:  () => { tone(110, 0.25, { type: "sawtooth", to: 40, vol: 0.14 }); tone(70, 0.3, { type: "square", to: 30, vol: 0.1 }); },
  };

  // Spelar en ljudfil, t.ex. "sound/wow.mp3". Saknas filen händer ingenting.
  function playSound(src) {
    if (!CONFIG.sound) return;
    try { const a = new Audio(src); a.volume = CONFIG.volume; a.play().catch(() => {}); } catch (e) { /* inget ljud är inget fel */ }
  }

  /* ==========================================================================
     DR. PIPS LOGG (EXPERIMENTAL NOTES)
     ========================================================================== */
  const notes = { lines: [], queue: [], busy: false, msg: 0, typing: 0, cols: 34 };

  function measureNotes() {
    const probe = document.createElement("span");
    probe.textContent = "M".repeat(20);
    el.notes[0].appendChild(probe);
    const w = probe.getBoundingClientRect().width / 20, row = el.notes[0].getBoundingClientRect().width;
    probe.remove();
    if (w > 0) notes.cols = Math.max(16, Math.floor(row / w) - 1);
  }

  function pipSay(text) {
    if (!text) return;
    notes.msg++;
    const words = String(text).split(/\s+/), rows = [];
    let line = "> ";
    for (const w of words) {
      if (line.length + w.length > notes.cols && line.trim() !== ">") { rows.push(line.trimEnd()); line = "  "; }
      line += w + " ";
    }
    rows.push(line.trimEnd());
    // Repliken han skriver just nu får skrivas klart, men de som fortfarande
    // väntar slängs, så att kön inte växer när man bläddrar snabbt.
    notes.queue = notes.queue.filter((q) => q.msg === notes.typing);
    rows.forEach((t) => notes.queue.push({ t, msg: notes.msg }));
    if (!notes.busy) typeNext();
  }

  function typeNext() {
    const next = notes.queue.shift();
    if (!next) { notes.busy = false; return; }
    notes.busy = true;
    notes.typing = next.msg;
    const row = { t: "", msg: next.msg };
    notes.lines.push(row);
    if (notes.lines.length > el.notes.length) notes.lines.shift();
    const step = notes.queue.length > 3 ? 3 : 1;   // skriv fortare om mycket väntar
    let i = 0;
    const timer = setInterval(() => {
      i += step;
      row.t = next.t.slice(0, i);
      drawNotes();
      if (i % 3 === 0) sfx.tick();
      if (i >= next.t.length) { clearInterval(timer); setTimeout(typeNext, 70); }
    }, 22);
  }

  function drawNotes() {
    el.notes.forEach((div, i) => {
      const row = notes.lines[i];
      div.textContent = row ? row.t : "";
      div.className = (row && row.msg === notes.msg ? "new" : "") + (row && i === notes.lines.length - 1 ? " cur" : "");
    });
  }

  let cPresses = [];
  function pipTalk() {
    const now = Date.now();
    cPresses = cPresses.filter((t) => now - t < 6000);
    cPresses.push(now);
    sfx.squeak();
    if (cPresses.length >= 6) { cPresses = []; pipSay(pick(C.eggs.annoyed)); return; }
    const cur = top(), own = cur && C.pip[cur.pip];
    pipSay(own && Math.random() < 0.4 ? pick(own) : pick(C.pip.talk));
  }

  /* ==========================================================================
     RAMEN RUNT MITTEN: toppmeny, klocka, status, band
     ========================================================================== */
  function setNav(key) { el.nav.forEach((s) => s.classList.toggle("on", s.dataset.nav === key)); }

  function tickClock() {
    const d = new Date();
    $("clock-date").textContent = dateText(d);
    $("clock-time").textContent = `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
  }

  const vit = { hr: 64, temp: 36.8, glu: 5.2, act: C.status.act[0], state: C.status.states[0], spike: 0, lastSpike: 0, cheese: 0 };
  function tickStatus() {
    const walk = (v, d, lo, hi) => clamp(v + (Math.random() * 2 - 1) * d, lo, hi);
    vit.hr = walk(vit.hr, 2.2, 54, 84);
    vit.temp = walk(vit.temp, 0.07, 36.4, 37.3);
    vit.glu = walk(vit.glu, 0.15, 4.4, 6.3);
    if (Math.random() < 0.15) vit.act = pick(C.status.act);
    if (Math.random() < 0.12) vit.state = pick(C.status.states);
    // Easter egg: sockertopp någon gång ibland
    const now = Date.now();
    if (!vit.spike && state.stack.length > 1 && now - vit.lastSpike > 240000 && Math.random() < 0.01) {
      vit.spike = 6; vit.lastSpike = now; pipSay(pick(C.eggs.sugar));
    }
    if (vit.spike) vit.spike--;
    if (vit.cheese && now > vit.cheese) { vit.cheese = 0; el.stage.classList.remove("cheese"); }
    $("st-hr").textContent = `${Math.round(vit.hr)} /min`;
    $("st-temp").textContent = `${vit.temp.toFixed(1)} °C`;
    $("st-act").textContent = vit.act;
    $("st-glu").textContent = `${(vit.spike ? 9.4 + Math.random() * 0.6 : vit.glu).toFixed(1)} mmol/L`;
    $("st-state").textContent = vit.cheese ? "cheese" : vit.state;
  }

  function drawBand() {
    el.bandL.innerHTML = `SEKTIONER<b>${state.visited.size} / ${SECTIONS.length}</b>`;
    el.bandR.innerHTML = `SLUTRAPPORT<b>${state.filed ? "ARKIVERAD" : state.unlocked ? "KLAR" : "LÅST"}</b>`;
  }

  // Knapptips i bandet. Varje tips är [knapp, text]; knapp är A, B, C, UD eller LR.
  const KEYS = {
    A: "A", B: "B", C: "C",
    UD: '<i class="tri u"></i><i class="tri d"></i>',
    LR: '<i class="tri l"></i><i class="tri r"></i>',
    ALL: '<i class="tri l"></i><i class="tri u"></i><i class="tri d"></i><i class="tri r"></i>',
  };
  function setHints(list) {
    el.hints.innerHTML = list.map(([k, t]) => `<span><kbd data-k="${k}">${KEYS[k]}</kbd>${esc(t)}</span>`).join("");
  }

  /* ==========================================================================
     MITTENPANELEN: gemensamma byggstenar
     ========================================================================== */
  function frame({ title, tag = "", html = "", pager = "" }) {
    el.title.textContent = title;
    el.tag.textContent = tag;
    // Samma sida som redan visas ritas inte om, så att bilder inte laddas om
    // och blinkar till när A bara lägger på en klass (t.ex. på ett omslag).
    if (html !== el.body._html || el.body.firstChild !== el.body._first) {
      el.body.innerHTML = html;
      el.body._html = html;
      el.body._first = el.body.firstChild;
    }
    el.pager.innerHTML = pager;
  }

  function pagerHtml(i, n, label = `SIDA ${i + 1} / ${n}`) {
    if (n < 2) return "";
    return `<i class="tri l${i === 0 ? " off" : ""}"></i>${label}<i class="tri r${i === n - 1 ? " off" : ""}"></i>`;
  }

  const textHtml = (paras, cls = "text") => `<div class="${cls}">${paras.map((p) => `<p>${esc(p)}</p>`).join("")}</div>`;

  // Delar upp stycken på så många sidor som behövs för att allt ska få plats
  // i mittenpanelen. Mäter med de riktiga typsnitten, så inget hamnar utanför.
  // cls = klassen på omslaget, om texten ska se annorlunda ut (se Dr. Pips anteckningar).
  // shell = (valfritt) funktion som får sidans nummer och ger sidans HTML med en tom
  // .flow där texten ska in. Texten fyller då bara den rutan (se årsböckerna).
  function paginate(paras, cls = "text", shell = null) {
    const pages = [];
    const setup = () => {
      if (shell) {
        el.body.innerHTML = shell(pages.length);
        const w = el.body.querySelector(".flow");
        return [w, () => w.offsetHeight <= w.parentNode.clientHeight];
      }
      el.body.innerHTML = `<div class="${cls}"></div>`;
      const w = el.body.firstChild, max = el.body.clientHeight;
      return [w, () => w.offsetHeight <= max];
    };
    let [wrap, fits] = setup();
    let cur = [];
    const flush = () => { if (cur.length) pages.push(cur); cur = []; [wrap, fits] = setup(); };
    for (const para of paras) {
      let rest = String(para);
      while (rest) {
        const p = document.createElement("p");
        p.textContent = rest;
        wrap.appendChild(p);
        if (fits()) { cur.push(rest); break; }
        // Stycket får inte plats: ta så många ord som ryms och fortsätt på nästa sida.
        const words = rest.split(" ");
        let lo = 0, hi = words.length - 1;
        while (lo < hi) {
          const mid = Math.ceil((lo + hi) / 2);
          p.textContent = words.slice(0, mid).join(" ");
          if (fits()) lo = mid; else hi = mid - 1;
        }
        if (!cur.length && lo === 0) lo = 1;
        if (lo >= 8 || !cur.length) {
          cur.push(words.slice(0, lo).join(" "));
          rest = words.slice(lo).join(" ");
        }
        flush();
      }
    }
    flush();
    return pages.length ? pages : [[]];
  }

  // Som paginate, men för färdiga HTML-bitar (t.ex. chattmeddelanden) som inte
  // får delas. Ger tillbaka en färdig HTML-sträng per sida.
  function paginateBlocks(blocks, cls) {
    el.body.innerHTML = `<div class="${cls}"></div>`;
    const wrap = el.body.firstChild, max = el.body.clientHeight, pages = [];
    let cur = [];
    for (const b of blocks) {
      wrap.insertAdjacentHTML("beforeend", b);
      if (wrap.offsetHeight > max && cur.length) { pages.push(cur); cur = []; wrap.innerHTML = b; }
      cur.push(b);
    }
    if (cur.length) pages.push(cur);
    return (pages.length ? pages : [[]]).map((p) => `<div class="${cls}">${p.join("")}</div>`);
  }

  /* ---------- Navigering mellan skärmar ---------- */
  const top = () => state.stack[state.stack.length - 1];
  function render() {
    const cur = top();
    setNav(cur.nav || null);
    cur.draw();
    setHints(cur.hints());
  }
  function go(screen) { state.stack.push(screen); render(); }
  function back() {
    if (state.stack.length < 2) return;
    const old = state.stack.pop();
    if (old.leave) old.leave();
    sfx.back();
    render();
  }
  function redraw(screen) { if (top() === screen) render(); }

  function markVisited(id) {
    state.visited.add(id);
    if (!state.unlocked && state.visited.size >= CONFIG.unlockAfter) {
      state.unlocked = true;
      setTimeout(() => { sfx.unlock(); pipSay(pick(C.pip.unlocked)); }, 900);
    }
    drawBand();
  }

  /* ==========================================================================
     SKÄRMAR
     Varje skärm har: draw() som ritar, on(knapp) som reagerar på input och
     hints() som ger knapptipsen. nav = vilket ord i toppmenyn som lyser.
     ========================================================================== */

  /* ---------- Uppstart ---------- */
  function bootScreen() {
    let shown = 0, timer = null;
    const lines = C.boot.lines, done = () => shown >= lines.length;
    const self = {
      draw() {
        frame({
          title: C.boot.title, tag: "UPPSTART",
          html: `<div class="boot">${lines.slice(0, shown).map((l) => `<p>${esc(l)}</p>`).join("")}${done() ? `<div class="prompt">${esc(C.boot.prompt)}</div>` : ""}</div>`,
        });
        if (!timer && !done()) timer = setInterval(() => {
          shown++; sfx.tick();
          if (done()) { clearInterval(timer); pipSay(pick(C.pip.boot)); }
          redraw(self);
        }, 520);
      },
      hints: () => [["A", done() ? "börja" : "hoppa över"]],
      on(a) {
        if (a !== "a") return;
        if (!done()) { shown = lines.length; clearInterval(timer); pipSay(pick(C.pip.boot)); render(); return; }
        sfx.select();
        state.stack = [];
        go(menuScreen());
        pipSay(pick(C.pip.menu));
      },
    };
    return self;
  }

  /* ---------- Huvudmeny ---------- */
  function menuScreen() {
    let sel = 0, bCount = 0;
    const open = {
      archive: archiveIndex,
      mouse:   () => fileList({ items: C.mouse, key: "mouse", title: "Musforskning", tag: "DR. PIP" }),
      audio: audioScreen, profile: profileScreen, quiz: quizScreen,
      escape:  () => reader({ pip: "escape", tag: "MODUL UR DRIFT", sections: [C.escape] }),
      final: finalScreen,
    };
    return {
      draw() {
        const rows = C.menu.map((m, i) => {
          const locked = m.id === "final" && !state.unlocked;
          const meta = locked ? "LÅST" : m.id === "final" ? (state.filed ? "ARKIVERAD" : "KLAR") : state.visited.has(m.id) ? "BESÖKT" : "";
          return `<li class="${i === sel ? "sel" : ""}${locked ? " locked" : ""}"><span class="no">${pad2(i + 1)}</span><span class="label">${esc(m.label)}</span><span class="meta">${meta}</span></li>`;
        }).join("");
        frame({ title: C.menuTitle, tag: "VÄLJ AVSNITT", html: `<ul class="list menu">${rows}</ul><div class="menu-desc">${esc(C.menu[sel].desc)}</div>` });
      },
      hints: () => [["UD", "välj"], ["A", "öppna"], ["C", "fråga Dr. Pip"]],
      on(a) {
        if (a === "up" || a === "down") {
          sel = (sel + (a === "up" ? -1 : 1) + C.menu.length) % C.menu.length;
          sfx.move(); render();
        } else if (a === "a") {
          const m = C.menu[sel];
          if (m.id === "final" && !state.unlocked) {
            sfx.error();
            pipSay(fill(pick(C.pip.locked), { left: CONFIG.unlockAfter - state.visited.size }));
            return;
          }
          sfx.select();
          if (m.id !== "final") markVisited(m.id);
          const screen = open[m.id]();
          screen.nav = m.nav;
          go(screen);
          pipSay(pick(C.pip[m.id]));
        } else if (a === "b") {
          if (++bCount >= 3) { bCount = 0; pipSay(pick(C.eggs.noExit)); }
        }
      },
    };
  }

  /* ---------- Lista med filer (Mouse Research) ---------- */
  function fileList({ items, key, title, tag }) {
    const PER = 5;
    let sel = 0;
    return {
      pip: key,
      draw() {
        const page = Math.floor(sel / PER), pages = Math.ceil(items.length / PER);
        const rows = items.slice(page * PER, page * PER + PER).map((it, j) => {
          const i = page * PER + j;
          return `<li class="${i === sel ? "sel" : ""}"><span class="no">${esc(it.id)}</span><span class="label">${esc(it.title)}${it.date ? `<small>${esc(it.date)}</small>` : ""}</span><span class="meta">${state.read.has(key + i) ? "LÄST" : ""}</span></li>`;
        }).join("");
        frame({ title, tag, html: `<ul class="list files">${rows}</ul>`, pager: pagerHtml(page, pages) });
      },
      hints: () => [["UD", "välj"], ["A", "öppna"], ["B", "tillbaka"]],
      on(a) {
        const n = items.length;
        if (a === "up" || a === "down") { sel = (sel + (a === "up" ? -1 : 1) + n) % n; sfx.move(); render(); }
        else if (a === "left" || a === "right") { sel = clamp(sel + (a === "left" ? -PER : PER), 0, n - 1); sfx.move(); render(); }
        else if (a === "a" && n) {
          sfx.select();
          state.read.add(key + sel);
          const r = reader({ pip: key, tag: items[sel].id, sections: [items[sel]] });
          r.nav = this.nav;
          go(r);
        } else if (a === "b") back();
      },
    };
  }

  /* ---------- Archive: kapitellistan ----------
     Innehållet ligger i archive.js. */
  function archiveIndex() {
    const A = C.archive, chs = A.chapters;
    let sel = 0;
    return {
      pip: "archive",
      draw() {
        const rows = chs.map((ch, i) => {
          const sealed = !ch.items.length;
          return `<li class="${i === sel ? "sel" : ""}${sealed ? " locked" : ""}"><span class="no">${pad2(i + 1)}</span><span class="label">${esc(ch.title)}</span><span class="meta">${sealed ? "FÖRSEGLAD" : esc(ch.years || "")}</span></li>`;
        }).join("");
        const ch = chs[sel], n = ch.items.length;
        const count = chapterItems(ch, sel).length;
        const status = !n ? "ÄNNU EJ AVHEMLIGAT" : `${count} BEVIS${state.read.has("archive" + sel) ? " · LÄST" : ""}`;
        frame({
          title: A.title, tag: A.tag,
          html: `<ul class="list menu">${rows}</ul><div class="menu-desc">${specimenBadge()}${esc(ch.desc || "")}<span class="small">${status}</span></div>`,
        });
      },
      hints: () => [["UD", "välj"], ["A", "öppna"], ["LR", "kortet"], ["B", "tillbaka"]],
      on(a) {
        const n = chs.length;
        if (a === "up" || a === "down") { sel = (sel + (a === "up" ? -1 : 1) + n) % n; sfx.move(); render(); }
        else if (a === "right" || a === "left") {
          sfx.select();
          const r = specimenScreen();
          r.nav = this.nav;
          go(r);
        }
        else if (a === "b") back();
        else if (a === "a") {
          const ch = chs[sel];
          if (!ch.items.length) { sfx.error(); pipSay(pick(A.sealed)); return; }
          sfx.select();
          state.read.add("archive" + sel);
          if (ch.pip) pipSay(pick([].concat(ch.pip)));
          const r = archiveRecord(ch, sel);
          r.nav = this.nav;
          go(r);
        }
      },
    };
  }

  /* ---------- Archive: ett kapitel med bevis ----------
     Varje bevis blir en eller flera sidor. Vänster/höger bläddrar,
     A förstorar en bild, B går tillbaka till kapitellistan. */
  const EXHIBIT_LABEL = { image: "FOTOGRAFI", text: "HANDLING", chat: "ÅTERFUNNA MEDDELANDEN", post: "ARKIVERAT INLÄGG", pip: "FÄLTANTECKNING" };
  const paras = (t) => [].concat(t || []);
  const imgHtml = (src) => `<div class="frame" data-src="${esc(src)}"><img src="${esc(src)}" alt=""></div>`;

  // Varje typ ger en lista med färdiga sidor (HTML).
  const EXHIBIT = {
    image: (it) => [`<figure class="exhibit-img">${imgHtml(it.src)}${it.caption ? `<figcaption>${esc(it.caption)}</figcaption>` : ""}</figure>`],
    // Med image: texten till vänster och bilden till höger på varje sida.
    text: (it) => it.image
      ? paginate(paras(it.text), "text beside").map((p) => `<div class="text-img">${textHtml(p, "text beside")}${imgHtml(it.image)}</div>`)
      : paginate(paras(it.text)).map((p) => textHtml(p)),
    pip: (it) => paginate(paras(it.text), "text pip-note").map((p) => textHtml(p, "text pip-note")),
    chat: (it) => paginateBlocks(it.messages.map((m, i) => {
      const same = i > 0 && it.messages[i - 1].from === m.from;   // samma avsändare igen: namnet döljs (se .msg.same i style.css)
      return `<div class="msg${it.me && m.from === it.me ? " me" : ""}${same ? " same" : ""}"><div class="msg-from">${esc(m.from || "")}${m.time ? ` · ${esc(m.time)}` : ""}</div><div class="msg-text">${esc(m.text)}</div></div>`;
    }), "chat"),
    post: (it) => {
      const text = paras(it.text).map((t) => `<p class="post-text">${esc(t)}</p>`);
      const head = `<div class="post-head"><b>${esc(it.author || "")}</b><span>${esc([it.platform, it.date].filter(Boolean).join(" · "))}</span></div>`;
      const comments = it.comments || [];
      const stats = it.likes != null || comments.length ? [`<div class="post-stats">${it.likes != null ? `${it.likes} GILLAR` : ""}${it.likes != null && comments.length ? " · " : ""}${comments.length ? `${comments.length} KOMMENTARER` : ""}</div>`] : [];
      return paginateBlocks([
        head + (text[0] || ""), ...text.slice(1),
        ...(it.image ? [`<div class="post-img">${imgHtml(it.image)}</div>`] : []),
        ...stats,
        ...comments.map((c) => `<p class="post-comment"><b>${esc(c.from)}</b>${esc(c.text)}</p>`),
      ], "post");
    },
  };

  /* ---------- Archive: hemligstämplade dokument (type: "dossier") ----------
     Försättsblad, ett uppslag per dokument (bild + Dr. Pips bedömning +
     avskrift) och sist en jämförande analys. */
  const LETTERS = "ABCDEFGHIJ";
  const redactText = (html) => html.replace(/█+/g, '<span class="redact">$&</span>');
  const meterHtml = (level, max, label) =>
    `<div class="meter"><span>SOCIALT INFLYTANDE</span><span class="meter-bar">${Array.from({ length: max }, (_, n) => `<i class="${n < level ? "on" : ""}" style="animation-delay:${0.3 + n * 0.25}s"></i>`).join("")}</span><b>${esc(label || "")}</b></div>`;
  const docHtml = (d) =>
    `<div class="frame doc-frame" data-src="${esc(d.src)}"><div class="doc" style="aspect-ratio:${d.ratio || "3 / 4"}"><img src="${esc(d.src)}" alt="">` +
    (d.redact || []).map(([l, t, w, h]) => `<i class="redact-box" style="left:${l}%;top:${t}%;width:${w}%;height:${h}%"></i>`).join("") +
    `<span class="classified">HEMLIGSTÄMPLAT</span></div></div>`;

  function dossierPages(it) {
    const docs = it.docs || [];
    const out = [];
    out.push({ html: `<div class="dossier"><div class="dossier-main">
        <div class="dossier-head">${esc(it.kicker || "ARKIVDOKUMENT")}</div>
        <h2>${esc(it.heading || it.title || "")}</h2>
        ${textHtml(paras(it.text))}
      </div><div class="dossier-side">
        <div class="small">INNEHÅLL</div>
        <ul>${docs.map((d, n) => `<li><b>BILAGA ${LETTERS[n]}</b>${esc(d.name || "")}</li>`).join("")}${it.summary ? `<li><b>ANALYS</b>${esc(it.summary.title || "")}</li>` : ""}</ul>
        <span class="classified big">KONFIDENTIELLT</span>
      </div></div>` });

    docs.forEach((d, n) => {
      const ref = `BILAGA ${LETTERS[n]}${d.year ? ` · ${d.year}` : ""}`;
      const shell = (page) => `<div class="doc-page">${docHtml(d)}<div class="doc-side">
          ${page === 0 ? `<p class="doc-verdict">${esc(d.verdict || "")}</p>
          ${d.level ? meterHtml(d.level, docs.length, d.levelLabel) : ""}
          <ul class="doc-findings">${(d.findings || []).map((f) => `<li>${esc(f)}</li>`).join("")}</ul>` : ""}
          <div class="small">${page === 0 ? "AVSKRIFT" : "AVSKRIFT, FORTS."}</div>
          <div class="doc-transcript"><div class="flow transcript"></div></div>
        </div></div>`;
      const parts = paginate(paras(d.transcript), "", shell);
      parts.forEach((ps, page) => {
        const html = shell(page).replace('<div class="flow transcript"></div>',
          `<div class="flow transcript">${redactText(ps.map((t) => `<p>${esc(t)}</p>`).join(""))}</div>`);
        out.push({ html, sub: { title: d.title || ref, label: ref, src: d.src, doc: d, caption: d.verdict,
          pip: page === 0 ? d.pip : null, stampSound: page === 0 } });
      });
    });

    if (it.summary) {
      const sm = it.summary;
      out.push({ html: `<div class="analysis"><table class="rows compare">
          <tr><td>BILAGA</td><td>ÅR</td><td>EPITET</td><td>INFLYTANDE</td></tr>
          ${docs.map((d, n) => `<tr><td>${LETTERS[n]}</td><td>${esc(d.year || "")}</td><td>${esc(d.epithet || "")}</td><td>${meterHtml(d.level || 0, docs.length, d.levelLabel)}</td></tr>`).join("")}
        </table>${textHtml(paras(sm.text), "text conclusion")}</div>`,
        sub: { title: sm.title || "Jämförande analys", label: sm.label || "JÄMFÖRANDE ANALYS", pip: sm.pip } });
    }
    return out;
  }
  EXHIBIT.dossier = dossierPages;

  /* ---------- Archive: återfunnen kriskommunikation (type: "crisis") ----------
     Försättsblad, ett uppslag per utdrag (chatten till vänster, Dr. Pips
     marginalanteckningar till höger) och sist en slutsats. [[text]] i ett
     meddelande blir en markering som hör ihop med anteckningen med samma
     nummer. Markeringar och anteckningar visas en i taget när man trycker A
     (se data-step och revealed i archiveRecord). */
  const crisisMeter = (name, level, max, label) =>
    `<div class="meter"><span>${esc(name)}</span><span class="meter-bar">${Array.from({ length: max }, (_, n) => `<i class="${n < level ? "on" : ""}" style="animation-delay:${0.3 + n * 0.18}s"></i>`).join("")}</span><b>${esc(label || "")}</b></div>`;
  const crisisBar = (ex, max) => `<div class="crisis-bar">${crisisMeter("UPPLEVD KRISNIVÅ", ex.level || 0, max, ex.levelLabel)}${crisisMeter("FAKTISK SAMHÄLLSBETYDELSE", 0, max, "SPEX")}</div>`;

  function crisisPages(it) {
    const exs = it.excerpts || [], max = 5, roles = it.roles || {};
    const out = [];
    out.push({ html: `<div class="dossier protocol"><div class="dossier-main">
        <div class="dossier-head">${esc(it.kicker || "INTERN KORRESPONDENS")}</div>
        <h2>${esc(it.heading || it.title || "")}</h2>
        ${textHtml(paras(it.text))}
      </div><div class="dossier-side">
        <div class="small">DAGORDNING</div>
        <ol>${exs.map((e, n) => `<li><b>§ ${n + 1}</b>${esc(e.name || "")}</li>`).join("")}</ol>
        ${it.status ? `<div class="protocol-status">${esc(it.status)}</div>` : ""}
      </div></div>` });

    exs.forEach((e, n) => {
      let k = 0;
      const mark = (html) => redactText(html).replace(/\[\[(.+?)\]\]/g, (m, t) => { k++; return `<mark data-step="${k}"><sup>${k}</sup>${t}</mark>`; });
      const msgs = (e.messages || []).map((m, i) => {
        const same = i > 0 && e.messages[i - 1].from === m.from;
        const who = [m.from, roles[m.from], m.time].filter(Boolean).map(esc).join(" · ");
        return `<div class="msg${it.me && m.from === it.me ? " me" : ""}${same ? " same" : ""}"><div class="msg-from">${who}</div><div class="msg-text">${mark(esc(m.text))}</div></div>`;
      }).join("");
      const notes = (e.notes || []).map((t, j) => `<div class="anno" data-step="${j + 1}"><b>${j + 1}</b><p>${esc(t)}</p></div>`).join("");
      const steps = Math.max(k, (e.notes || []).length);
      out.push({ html: `<div class="crisis">${crisisBar(e, max)}<div class="crisis-body">
          <div class="chat crisis-chat">${msgs}</div>
          <div class="crisis-notes"><div class="small">DR. PIPS MARGINALANTECKNINGAR</div>${notes}<div class="anno-wait small">A · GRANSKA</div></div>
        </div></div>`,
        sub: { title: e.title || `§ ${n + 1} ${e.name || ""}`, label: `DAGORDNINGEN § ${n + 1}${e.label ? ` · ${e.label}` : ""}`, pip: e.pip, steps } });
    });

    if (it.summary) {
      const sm = it.summary;
      out.push({ html: `<div class="crisis-end"><table class="rows compare">
          <tr><td>§</td><td>ÄRENDE</td><td>UPPLEVD KRISNIVÅ</td></tr>
          ${exs.map((e, n) => `<tr><td>${n + 1}</td><td>${esc(e.name || "")}</td><td>${crisisMeter("", e.level || 0, max, e.levelLabel)}</td></tr>`).join("")}
        </table>${textHtml(paras(sm.text), "text conclusion")}${sm.decision ? `<div class="protocol-decision"><b>BESLUT</b>${esc(sm.decision)}</div>` : ""}${sm.stamp ? `<span class="stamp crisis-stamp" data-step="1" data-sound="stamp">${esc(sm.stamp)}</span>` : ""}</div>`,
        sub: { title: sm.title || "Slutsats", label: sm.label || "SLUTSATS", pip: sm.pip, steps: sm.stamp ? 1 : 0 } });
    }
    return out;
  }
  EXHIBIT.crisis = crisisPages;

  /* ---------- Archive: kapitelomslag (type: "cover") ----------
     En stor bild som först står släckt. A tänder den (data-step, se
     revealed i archiveRecord) och nästa A går vidare. */
  EXHIBIT.cover = (it) => [{ html: `<div class="cover-page" data-step="1">
      <div class="cover-head"><div class="dossier-head">${esc(it.kicker || "")}</div><h2>${esc(it.heading || it.title || "")}</h2></div>
      <div class="cover-art"><i class="cover-glow"></i>${it.windows ? coverScene(it) : `<img src="${esc(it.src)}" alt="">`}</div>
      ${it.text ? `<p class="cover-text">${esc(it.text)}</p>` : ""}
    </div>`, sub: { steps: 1, stepHint: it.hint || it.action || "tänd ljusen", src: null } }];
  // Upplysta fönster (cover.windows): tänds i slumpvis ordning, några förblir
  // mörka, några flimrar eller släcks då och då, och i vissa dansar det folk.
  const DANCER = `<svg viewBox="0 0 40 80"><circle cx="20" cy="12" r="7"/><path d="M11 24 Q20 19 29 24 L32 64 Q20 68 8 64 Z"/>` +
    `<rect class="arm" x="7" y="22" width="5" height="24" rx="2.5"/><rect class="arm r" x="28" y="22" width="5" height="24" rx="2.5"/></svg>`;
  function coverScene(it) {
    const [W, H] = it.size || [1600, 600];
    const pct = (v, t) => `${(v / t * 100).toFixed(3)}%`;
    const rnd = (a, b) => (a + Math.random() * (b - a)).toFixed(2);
    const wins = it.windows.flatMap(([xs, y, w, h, arch]) => xs.map((x) => {
      const fx = Math.random();
      const dancer = h >= 32 && Math.random() < 0.35
        ? `<div class="dancer" style="--bob:${rnd(0.35, 0.6)}s;--sway:${rnd(0.7, 1.3)}s;--wave:${rnd(0.4, 0.9)}s">${DANCER}</div>` : "";
      const light = Math.random() < 0.15 ? "" : `<div class="light">${dancer}</div>`;
      return `<div class="win${arch ? " arch" : ""}${fx < 0.1 ? " flicker" : fx < 0.2 ? " blink" : ""}" ` +
        `style="left:${pct(x, W)};top:${pct(y, H)};width:${pct(w, W)};height:${pct(h, H)};--d:${rnd(1.2, 4.5)}s;--b:${rnd(7, 15)}s">${light}</div>`;
    })).join("");
    const mask = `url('${esc(it.src)}')`;
    return `<div class="cover-scene" style="--ar:${W / H}"><img src="${esc(it.src)}" alt="">` +
      `<i class="cover-night" style="-webkit-mask-image:${mask};mask-image:${mask}"></i>${wins}${it.fireworks ? fireworks() : ""}` +
      `<div class="cover-cta"><kbd>A</kbd>${esc(it.action || "tänd ljusen")}</div></div>`;
  }
  // Fyrverkerier på himlen ovanför byggnaden: varje smäll är tolv gnistor
  // som skjuts ut åt alla håll och sedan upprepas med egen takt.
  const FW_SPOTS = [[9, 6], [21, -6], [46, 4], [61, -4], [76, 6], [90, -8]];
  const FW_COLORS = ["#ffd36b", "#ff7ab8", "#8fe3ff", "#fff4d6", "#ff9a3c", "#b58cff"];
  function fireworks() {
    return FW_SPOTS.map(([x, y], n) => {
      const sparks = Array.from({ length: 12 }, (_, k) => `<b style="--a:${k * 30}deg"></b>`).join("");
      return `<i class="fw" style="left:${x}%;top:${y}%;--c:${FW_COLORS[n]};--fd:${(n * 0.7 + Math.random() * 0.6).toFixed(2)}s;--fp:${(2.6 + Math.random() * 1.6).toFixed(2)}s">${sparks}</i>`;
    }).join("");
  }
  // Dr. Pips kommentar och (valfritt) ett ljud när ljuset tänds.
  function lightsOn(it) {
    if (it.sound) playSound(it.sound); else sfx.unlock();
    if (it.litPip) pipSay(pick([].concat(it.litPip)));
  }

  /* ---------- Archive: fotoalbum (type: "album") ----------
     Först ett uppslag med texten och bilderna utspridda, sedan en sida per
     bild med bildtext och Dr. Pips anteckning. Med stamp får bilden en
     datumstämpel som en gammal digitalkamera, och med timeline visas en
     himmel som går från natt till soluppgång medan man bläddrar. */
  const polaroid = (ph, cls = "") => `<figure class="polaroid ${cls}">${imgHtml(ph.src)}${ph.stamp ? `<span class="photo-stamp">${esc(ph.stamp)}</span>` : ""}</figure>`;
  function albumPages(it) {
    const photos = it.photos || [], n = photos.length;
    const out = [{ html: `<div class="album-intro${it.timeline ? " night" : ""}"><div class="album-text">
        ${it.kicker ? `<div class="dossier-head">${esc(it.kicker)}</div>` : ""}
        ${textHtml(paras(it.text))}
      </div><div class="album-collage">${photos.slice(0, 3).map((ph, k) => polaroid(ph, `c${k + 1}`)).join("")}</div></div>` }];
    photos.forEach((ph, k) => {
      const sky = it.timeline ? `<div class="sky"><span>NATT</span><div class="sky-bar"><i style="left:${n > 1 ? (k / (n - 1)) * 100 : 100}%"></i></div><span>SOLUPPGÅNG</span></div>` : "";
      out.push({ html: `<div class="album-page${it.timeline ? " night" : ""}">${polaroid(ph, "big")}<div class="album-side">
          <div class="small">BILD ${k + 1} / ${n}</div>
          ${ph.caption ? `<p class="album-caption">${esc(ph.caption)}</p>` : ""}
          ${ph.note ? `<div class="anno shown"><b>P</b><p>${esc(ph.note)}</p></div>` : ""}
          ${sky}
          <div class="album-thumbs">${photos.map((t, j) => `<i class="${j === k ? "on" : ""}"></i>`).join("")}</div>
        </div></div>`,
        sub: { src: ph.src, caption: ph.caption, pip: ph.pip, label: `${it.label || "FOTOALBUM"} · BILD ${k + 1}` } });
    });
    return out;
  }
  EXHIBIT.album = albumPages;

  /* ---------- Archive: förflyttningskarta (type: "map") ----------
     En stiliserad karta över Skåne. Första A zoomar in och ritar rutten
     mellan from och to, följande A visar en iakttagelse i taget och sist
     stämpeln (data-step, se revealed i archiveRecord). Kartan är ritad i
     egna enheter: x = (lon − 12,4) · 0,5635 · 200, y = (56,52 − lat) · 200. */
  const SKANE = {
    W: 260, H: 255,
    coast: [[62, 14], [50.7, 17], [42.8, 15], [33.8, 11], [24.8, 16], [23.7, 24], [29.3, 32], [36.1, 40], [45.1, 46], [51.8, 53], [45.1, 59],
      [33.8, 60], [24.8, 54], [16.9, 48], [11.3, 44], [5.1, 44], [6.8, 50], [13.5, 54], [16.9, 64], [20.3, 74], [28.2, 84], [32.7, 94], [37.2, 104],
      [45.1, 118], [48.5, 130], [53, 138], [58.6, 148], [62, 154], [71, 160], [74.4, 166], [75.5, 171], [72.1, 178], [65.4, 182], [59.7, 188],
      [58.6, 198], [60.9, 208], [59.7, 216], [54.1, 218], [48.5, 218], [45.1, 224], [48.5, 227], [58.6, 224], [67.6, 224], [76.6, 228], [84.5, 230],
      [95.8, 232], [109.3, 236], [124, 230], [140.9, 224], [160, 218], [174.7, 220], [187.1, 226], [199.5, 222], [211.9, 208], [220.9, 194],
      [220.9, 184], [214.1, 174], [207.4, 164], [202.9, 152], [202.9, 140], [208.5, 128], [214.1, 118], [225.4, 106], [234.4, 100], [242.3, 96],
      [243.4, 80], [236.7, 64], [231, 48], [223.1, 34], [214.1, 20], [205.1, 10], [191.6, 8], [174.7, 12], [157.8, 10], [140.9, 14], [124, 20],
      [107.1, 14], [84.5, 16], [73.3, 12]],
    denmark: [[-12, 82], [0, 82], [13.5, 84], [23.7, 95], [21.4, 114], [18, 134], [20.3, 160], [29.3, 176], [24.8, 190], [11.3, 194], [0, 208], [-12, 208]],
    // namn: [x, y, etiketten till vänster?]
    towns: {
      Lomma: [75, 168.6, 1], Lund: [89, 163], "Malmö": [67.6, 183, 1], Helsingborg: [33.8, 95], Landskrona: [48.5, 130],
      "Ängelholm": [51.8, 56], "Eslöv": [101.4, 136], "Hässleholm": [154.4, 72], Kristianstad: [197.8, 98, 1],
      Ystad: [160, 218], Trelleborg: [85.7, 229], Simrishamn: [219.8, 193, 1],
    },
    seas: [["ÖRESUND", 40, 150], ["HANÖBUKTEN", 232, 134], ["ÖSTERSJÖN", 196, 244], ["KATTEGATT", 32, 30], ["DANMARK", 10, 150, -90]],
  };
  const outline = (pts) => `M${pts.map((p) => p.join(",")).join(" L")}Z`;
  function mapPages(it) {
    const { W, H, towns } = SKANE, s = it.zoom || 4;
    const a = towns[it.from], b = towns[it.to];
    const cx = (a[0] + b[0]) / 2, cy = (a[1] + b[1]) / 2;
    const z = ([x, y]) => [(x - cx) * s + W / 2, (y - cy) * s + H / 2];
    const tx = W / 2 - cx * s, ty = H / 2 - cy * s;
    // Allt utom själva landet ligger ovanpå och flyttas till sitt inzoomade läge,
    // så att text och punkter behåller sin storlek.
    const at = (p) => { const q = z(p); return `--x0:${p[0]};--y0:${p[1]};--x1:${q[0].toFixed(1)};--y1:${q[1].toFixed(1)}`; };
    const pins = Object.entries(towns).map(([name, p]) => {
      const cls = name === it.from ? " from" : name === it.to ? " to" : "", left = p[2];
      const note = name === it.from ? it.fromNote : name === it.to ? it.toNote : "";
      const anchor = left ? 'x="-3.5" text-anchor="end"' : 'x="3.5"';
      return `<g class="pin${cls}" style="${at(p)}">${cls ? '<circle class="ring" r="4"/>' : ""}<circle r="${cls ? 1.8 : 1.3}"/>` +
        `<text ${anchor} y="2">${esc(name.toUpperCase())}</text>${note ? `<text class="pin-note" ${anchor} y="9">${esc(note)}</text>` : ""}</g>`;
    }).join("");
    const seas = SKANE.seas.map(([t, x, y, rot]) => `<g class="pin" style="${at([x, y])}"><text class="sea"${rot ? ` transform="rotate(${rot})"` : ""}>${esc(t)}</text></g>`).join("");
    const grid = [12.5, 13, 13.5, 14, 14.5].map((lon) => { const x = ((lon - 12.4) * 112.7).toFixed(1); return `<line x1="${x}" y1="-40" x2="${x}" y2="${H + 40}"/>`; }).join("") +
      [55.5, 55.75, 56, 56.25].map((lat) => { const y = ((56.52 - lat) * 200).toFixed(1); return `<line x1="-40" y1="${y}" x2="${W + 40}" y2="${y}"/>`; }).join("");
    // Rutten ritas i det inzoomade läget, kortad i ändarna och med en liten båge.
    const [p, q] = [z(a), z(b)], d = Math.hypot(q[0] - p[0], q[1] - p[1]);
    const ux = (q[0] - p[0]) / d, uy = (q[1] - p[1]) / d;
    const r0 = [p[0] + ux * 6, p[1] + uy * 6], r1 = [q[0] - ux * 7, q[1] - uy * 7];
    const c = [(p[0] + q[0]) / 2 + uy * d * 0.28, (p[1] + q[1]) / 2 - ux * d * 0.28];
    const route = `M${r0.map((v) => v.toFixed(1))} Q${c.map((v) => v.toFixed(1))} ${r1.map((v) => v.toFixed(1))}`;
    const facts = it.facts || [], last = facts.length + 1;
    const svg = `<svg viewBox="0 0 ${W} ${H}" style="--tx:${tx.toFixed(1)};--ty:${ty.toFixed(1)};--s:${s}">
        <defs>
          <marker id="map-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 Z"/></marker>
          <mask id="map-draw" maskUnits="userSpaceOnUse"><path d="${route}" pathLength="1"/></mask>
        </defs>
        <g class="map-world"><g class="map-grid">${grid}</g><path class="land dk" d="${outline(SKANE.denmark)}"/><path class="land" d="${outline(SKANE.coast)}"/></g>
        ${seas}${pins}
        <g class="map-route"><path d="${route}" mask="url(#map-draw)" marker-end="url(#map-arrow)"/></g>
      </svg>`;
    const html = `<div class="map-page"><div class="map" data-step="1" data-sound="route">${svg}
        <div class="map-scale"><span class="z0">SKALA 1 : 1 000 000</span><span class="z1">FÖRSTORING ${s * 100} %</span></div>
        <div class="map-cta small">A · SPÅRA FÖRFLYTTNINGEN</div>
        ${it.stamp ? `<span class="stamp map-stamp" data-step="${last}" data-sound="stamp">${esc(it.stamp)}</span>` : ""}
      </div><div class="map-side">
        ${it.kicker ? `<div class="dossier-head">${esc(it.kicker)}</div>` : ""}
        ${textHtml(paras(it.text), "text map-text")}
        <div class="map-fact" data-step="1"><span>${esc(it.routeLabel || "MIGRATION ROUTE")}</span><b>${esc(it.from)} → ${esc(it.to)}</b></div>
        ${facts.map((f, n) => `<div class="map-fact" data-step="${n + 2}"><span>${esc(f.label)}</span><b>${esc(f.value)}</b>${f.level ? `<span class="meter-bar">${Array.from({ length: 5 }, (_, k) => `<i class="${k < f.level ? "on" : ""}" style="animation-delay:${0.2 + k * 0.18}s"></i>`).join("")}</span>` : ""}</div>`).join("")}
      </div></div>`;
    const stepPips = [it.routePip, ...facts.map((f) => f.pip)];
    if (it.stamp) stepPips[last - 1] = stepPips[last - 1] || it.stampPip;
    return [{ html, sub: { steps: last, stepPips } }];
  }
  EXHIBIT.map = mapPages;

  /* ---------- Archive: mapp före ett nytt avsnitt (folder: { ... }) ----------
     Vilket bevis som helst kan få en mapp som första sida. A slår upp mappen
     och går vidare till beviset. */
  function folderPage(it) {
    const f = it.folder;
    return { html: `<div class="folder-page"><div class="folder" data-step="1" data-sound="folder">
        <div class="folder-back"><span class="folder-tab">${esc(f.tab || "")}</span></div>
        <div class="folder-paper"></div><div class="folder-paper two"></div>
        <div class="folder-front">
          <div class="folder-label"><small>${esc(f.kicker || "")}</small><b>${esc(f.title || it.title || "")}</b><span>${esc(f.sub || "")}</span></div>
          ${f.stamp ? `<span class="folder-stamp">${esc(f.stamp)}</span>` : ""}
          ${f.note ? `<span class="folder-note">${esc(f.note)}</span>` : ""}
        </div>
      </div><div class="folder-hint small">A · ÖPPNA MAPPEN</div></div>`,
      sub: { label: f.label || "NYTT ÄRENDE", pip: f.pip, steps: 1, autoNext: true } };
  }

  /* ---------- Allans karaktärskort (type: "specimen") ----------
     Innehållet ligger i specimen.js. Kortet till vänster i Pokémonstil,
     fältmätningen (stats och utvecklingskedjan) till höger. Kortet visas
     först i kapitel 1 och sist i varje annat kapitel som har en nivå, så att
     Allan levlar upp när kapitlet är läst. Första gången en högre nivå
     visas spelas LEVEL UP (se specimenReveal). */
  const SPEC = C.specimen;
  const specLevel = (n) => SPEC.levels.find((l) => l.level === n) || SPEC.levels[0];
  const specPrev = (lv) => SPEC.levels[SPEC.levels.indexOf(lv) - 1] || null;
  const lvl = (n) => pad2(n);
  // Kapitlets bevis, med kortet först (första nivån) eller sist (övriga).
  function chapterItems(ch, idx) {
    const lv = SPEC.levels.find((l) => l.chapter === idx + 1);
    if (!lv || !ch.items.length) return ch.items;
    const items = ch.items.map((it) => (it.type === "specimen" && !it.level ? { ...it, level: lv.level } : it));
    if (items.some((it) => it.type === "specimen")) return items;
    const card = { type: "specimen", level: lv.level };
    return lv === SPEC.levels[0] ? [card, ...items] : [...items, card];
  }
  const newAbilities = (lv, from) => {
    const had = new Set(from ? from.abilities.map((ab) => ab.name) : []);
    return from ? lv.abilities.filter((ab) => !had.has(ab.name)) : [];
  };
  const energy = (lv, n = 1) => `<span class="pk-energy">${Array.from({ length: n }, () => `<i>${esc(lv.icon || "◆")}</i>`).join("")}</span>`;

  // from = nivån som NY-etiketterna jämförs med (annars förra nivån).
  function specimenCard(lv, from = specPrev(lv)) {
    const prev = specPrev(lv), fresh = new Set(newAbilities(lv, from).map((ab) => ab.name));
    const abilities = lv.abilities.map((ab, n) => `<div class="pk-ab${fresh.has(ab.name) ? " new" : ""}" ">
        ${energy(lv, Math.min(n + 1, 2))}
        <div class="pk-ab-text"><b>${esc(ab.name)}</b>${fresh.has(ab.name) ? '<em class="pk-new">NY</em>' : ""} ${esc(ab.text || "")}</div>
        <span class="pk-power">${esc(ab.power || "")}</span>
      </div>`).join("");
    return `<div class="pk-card" style="--tint:${esc(lv.color || "#86bcb0")}"><div class="pk-inner">
        <div class="pk-stage">${prev ? `UTVECKLAS UR ${esc(prev.evolution.toUpperCase())}` : esc(`LEVEL ${lvl(lv.level)} · ${lv.class || ""}`)}</div>
        <div class="pk-head"><div class="pk-name">${esc(SPEC.name)}<span>– ${esc(lv.name)}</span></div>
          <div class="pk-lvl"><small>LVL</small>${lvl(lv.level)}${energy(lv)}</div></div>
        <div class="pk-pic frame" data-src="${esc(lv.src)}"><img src="${esc(lv.src)}" alt=""${lv.focus ? ` style="object-position:${esc(lv.focus)}"` : ""}>${prev ? `<span class="pk-class">${esc(lv.class || "")}</span>` : ""}<i class="pk-scan"></i></div>
        <div class="pk-strip">${esc(lv.type)}. Ursprung: ${esc(lv.origin)}. Status: ${esc(lv.status)}.</div>
        <div class="pk-abs">${abilities}</div>
        <div class="pk-wrr"><span><small>svaghet</small>${esc(lv.weakness || "–")}</span><span><small>resistens</small>${esc(lv.resistance || "–")}</span><span><small>reträtt</small>${esc(lv.retreat || "–")}</span></div>
        <div class="pk-flavor">”${esc(lv.comment || "")}” <span>– Dr. Pip</span><b>LVL ${lvl(lv.level)} #${esc(SPEC.no)}</b></div>
        <div class="pk-foot"><span>Illus. Dr. Pip</span><span>© A.L.L.A.N. Lab 2013–2026</span><span>${SPEC.levels.indexOf(lv) + 1}/${SPEC.levels.length}</span></div>
      </div></div>`;
  }

  // Fältmätningen bredvid kortet. from = nivån som staplarna jämförs med.
  function specimenSheet(lv, from = specPrev(lv)) {
    const stats = SPEC.stats.map(([k, name]) => {
      const v = lv.stats[k] || 0, f = from ? from.stats[k] || 0 : null, d = f === null ? 0 : v - f;
      return `<div class="stat${k === "CHAOS" ? " chaos" : ""}" data-k="${esc(k)}"><b>${esc(k)}</b><span>${esc(name)}</span>
        <i class="stat-bar"><i style="width:${clamp(v / SPEC.max * 100, 0, 100)}%;--from:${f === null ? 0 : clamp(f / SPEC.max * 100, 0, 100)}%"></i></i>
        <em>${v}</em><small class="${d > 0 ? "up" : d < 0 ? "down" : ""}">${d ? (d > 0 ? "+" : "−") + Math.abs(d) : ""}</small></div>`;
    }).join("");
    const chain = SPEC.levels.map((l) => {
      const known = l.level <= Math.max(lv.level, state.specimen);
      return `<li class="${l === lv ? "cur" : known ? "on" : ""}"><i>${known ? lvl(l.level) : "?"}</i></li>`;
    }).join("");
    const next = SPEC.levels[SPEC.levels.indexOf(lv) + 1];
    return `<div class="spec-sheet">
        <div class="dossier-head">FÄLTMÄTNING · SPECIMEN No. ${esc(SPEC.no)}</div>
        <div class="spec-evo"><small>EVOLUTION</small><b>${esc(lv.evolution)}</b><span>LVL ${lvl(lv.level)}</span></div>
        <div class="stats">${stats}</div>
        <div class="spec-chain"><ol>${chain}</ol><span class="small">NÄSTA FORM: ${next ? (next.level <= state.specimen ? esc(next.evolution.toUpperCase()) : "???") : "FULLT UTVECKLAD"}</span></div>
      </div>`;
  }

  const specimenHtml = (lv) => `<div class="specimen" data-level="${lv.level}">${specimenCard(lv)}${specimenSheet(lv)}</div>`;

  EXHIBIT.specimen = (it) => {
    const lv = specLevel(it.level || 1);
    return [{ html: specimenHtml(lv), sub: { title: it.title || `${SPEC.name} – ${lv.evolution}`, label: it.label || `SPECIMEN No. ${SPEC.no} · LVL ${lvl(lv.level)}`, specimen: lv.level, src: null, pip: null } }];
  };

  // Första gången en högre nivå visas: LEVEL UP-rutan, staplarna växer från
  // den förra nivån och de nya förmågorna lyser upp. Första kortet någonsin
  // blir i stället en registrering av ett nytt exemplar.
  function specimenReveal(level) {
    if (level <= state.specimen) return;
    const root = el.body.querySelector(".specimen");
    if (!root) return;
    const from = state.specimen ? specLevel(state.specimen) : null, lv = specLevel(level);
    state.specimen = level;
    // Ritas om mot nivån man kommer ifrån. frame() låter sidan vara kvar
    // så länge man står på den, så animationen spelas bara den här gången.
    root.outerHTML = `<div class="specimen" data-level="${lv.level}">${specimenCard(lv, from)}${specimenSheet(lv, from)}</div>`;
    el.body._first = el.body.firstChild;
    watchImages(el.body);
    const spec = el.body.firstChild, gained = newAbilities(lv, from);
    const banner = from
      ? `<div class="lvl-head">LEVEL UP!</div><div class="lvl-from">LVL ${lvl(from.level)} <i class="tri r"></i> LVL ${lvl(lv.level)}</div>
         <div class="lvl-evo">${esc(from.evolution)} har utvecklats till <b>${esc(lv.evolution)}</b></div>
         ${gained.map((g) => `<div class="lvl-ab">NEW ABILITY UNLOCKED: <b>${esc(g.name.toUpperCase())}</b></div>`).join("")}
         ${lv.levelUp ? `<div class="lvl-pip">Dr. Pip: ”${esc([].concat(lv.levelUp)[0])}”</div>` : ""}`
      : `<div class="lvl-head small-head">NYTT EXEMPLAR REGISTRERAT</div><div class="lvl-from">SPECIMEN No. ${esc(SPEC.no)} · LVL ${lvl(lv.level)}</div>
         <div class="lvl-evo">${esc(SPEC.name)} – ${esc(lv.name)}</div>`;
    spec.insertAdjacentHTML("beforeend", `<div class="lvl-banner${from ? "" : " register"}"><div class="lvl-box">${banner}</div></div>`);
    spec.classList.add(from ? "levelup" : "register");
    setTimeout(from ? sfx.levelup : sfx.unlock, 250);
    if (lv.levelUp) pipSay(pick([].concat(lv.levelUp)));
  }

  // Lilla åtkomstpunkten i arkivets kapitellista.
  function specimenBadge() {
    const lv = specLevel(Math.max(1, state.specimen));
    return `<span class="spec-badge"><i>${esc(lv.icon || "◆")}</i>SPECIMEN ${esc(SPEC.no)}<b>LVL ${lvl(lv.level)}</b><i class="tri r"></i></span>`;
  }

  /* ---------- Allans kort, fristående (höger i arkivets kapitellista) ----------
     Visar kortets senaste nivå. Vänster/höger bläddrar bland de nivåer som
     har låsts upp. */
  function specimenScreen() {
    const levels = SPEC.levels.filter((l) => l.level <= Math.max(1, state.specimen));
    let i = levels.length - 1;
    return {
      pip: "archive",
      draw() {
        const lv = levels[i];
        frame({ title: `${SPEC.name} – ${lv.evolution}`, tag: `SPECIMEN No. ${SPEC.no} · EVOLUTIONSHISTORIK`, html: specimenHtml(lv),
          pager: pagerHtml(i, levels.length, `LVL ${lvl(lv.level)} / ${lvl(SPEC.levels.length)}`) });
        watchImages(el.body);
      },
      hints: () => [...(levels.length > 1 ? [["LR", "bläddra nivåer"]] : []), ["B", "tillbaka"]],
      on(a) {
        if (a === "b") return back();
        const to = a === "left" ? i - 1 : a === "right" ? i + 1 : i;
        if (to === i || to < 0 || to >= levels.length) return;
        i = to; sfx.move(); render();
      },
    };
  }

  // Visar "FOTOGRAFI SAKNAS" i ramen om en bild saknas.
  function watchImages(root) {
    root.querySelectorAll(".frame img").forEach((img) => { img.onerror = () => img.closest(".frame").classList.add("missing"); });
  }

  // Förstoringen har tre steg; i de två största flyttar man runt med spaken.
  const ZOOM = [1, 2.2, 4];

  function archiveRecord(ch, idx) {
    const items = chapterItems(ch, idx);
    let pages = null, i = 0, zoom = false, zl = 0, px = 0.5, py = 0.5;
    const said = new Set(), warned = new Set();
    // Hur många steg (markeringar, anteckningar, stämplar) som visats per sida.
    const revealed = new Map();
    let fresh = 0;
    const stepsLeft = () => { const p = pages[i]; return (p.it.steps || 0) - (revealed.get(p.key) || 0); };
    // En sida kan vara färdig HTML eller { html, sub }, där sub ersätter
    // fält i beviset (rubrik, etikett, bild, Dr. Pips kommentar) för just den sidan.
    const build = () => {
      pages = [];
      items.forEach((it, ex) => {
        const parts = (EXHIBIT[it.type] || EXHIBIT.text)(it);
        if (it.folder) parts.unshift(folderPage(it));
        parts.forEach((part, k) => {
          const o = typeof part === "string" ? { html: part } : part;
          pages.push({ it: { ...it, ...o.sub }, ex, part: k, parts: parts.length, html: o.html, key: o.sub ? `${ex}.${k}` : ex });
        });
      });
    };
    const zoomSrc = () => pages[i].it.src || pages[i].it.image;
    const warning = () => { const p = pages[i]; return p.part === 0 && p.it.warning && !warned.has(p.ex); };
    // Varningen kan man antingen gå igenom eller använda för att hoppa över
    // hela beviset. Säkerhetsfrågan (gate) kommer efter varningen; gDone är
    // true under den korta stund rutan visar ÅTKOMST BEVILJAD.
    const passed = new Set(), gWrong = new Set();
    let wSel = 0, gSel = 0, gDone = false, gShake = false;
    const gate = () => { const p = pages[i]; return p.part === 0 && p.it.gate && !warning() && !passed.has(p.ex); };
    const locked = (n) => { const p = pages[n]; return (p.it.warning && !warned.has(p.ex)) || (p.it.gate && !passed.has(p.ex)); };
    const choice = (cls, mark, text) => `<li class="${cls}"><b>${esc(String(mark))}</b>${esc(text)}</li>`;
    function warningHtml(it) {
      const opts = [it.warningGo || "Fortsätt på egen risk", it.warningSkip || "Hoppa över det här avsnittet"];
      return `<div class="alert-box choice"><div class="alert-head">VARNING</div><p>${esc(it.warning)}</p><ul>${opts.map((t, n) => choice(n === wSel ? "sel" : "", n ? "»" : "A", t)).join("")}</ul></div>`;
    }
    function gateHtml(g) {
      const rows = g.options.map((t, n) => choice(`${n === gSel && !gDone ? "sel" : ""}${gWrong.has(n) ? " wrong" : ""}${gDone && n === g.answer ? " right" : ""}`, "1X2"[n] || n + 1, t)).join("");
      return `<div class="alert-box choice${gShake ? " shake" : ""}"><div class="alert-head${gDone ? " ok" : ""}">${gDone ? "ÅTKOMST BEVILJAD" : esc(g.title || "SÄKERHETSKONTROLL")}</div><p>${esc(g.question)}</p><ul>${rows}</ul></div>`;
    }
    // Ritar bara om rutan, inte sidan bakom, så att inget flimrar när man väljer.
    // still = rutan visas redan och ska inte tona in igen.
    function drawAlert(still) {
      const it = pages[i].it;
      el.alert.hidden = !warning() && !gate();
      el.alert.innerHTML = warning() ? warningHtml(it) : gate() ? gateHtml(it.gate) : "";
      if (still && el.alert.firstChild) el.alert.firstChild.classList.add("still");
      gShake = false;
      setHints(top().hints());
    }
    function gateDone() {
      const ex = pages[i].ex;
      gDone = true; drawAlert(true);
      setTimeout(() => { passed.add(ex); gDone = false; gSel = 0; gWrong.clear(); if (pages[i].ex === ex && !el.alert.hidden) render(); }, 1400);
    }
    function applyZoom() {
      const t = el.zoom.querySelector(".doc, .frame img"), box = el.zoom.querySelector(".frame");
      if (!t || !box) return;
      const s = ZOOM[zl];
      const mx = Math.max(0, (t.offsetWidth * s - box.clientWidth) / 2);
      const my = Math.max(0, (t.offsetHeight * s - box.clientHeight) / 2);
      t.style.transform = `translate(${(0.5 - px) * 2 * mx}px, ${(0.5 - py) * 2 * my}px) scale(${s})`;
    }
    return {
      pip: "archive",
      draw() {
        if (!pages) build();
        const p = pages[i], it = p.it;
        el.stage.classList.toggle("frack", !!ch.frack);   // Dr. Pip klär upp sig (se #pip-frack)
        const label = `BEVIS ${p.ex + 1} / ${items.length}${p.parts > 1 ? ` · ${p.part + 1}/${p.parts}` : ""}`;
        frame({
          title: it.title || ch.title,
          tag: [it.label || EXHIBIT_LABEL[it.type] || "HANDLING", it.date].filter(Boolean).join(" · "),
          html: p.html,
          pager: pagerHtml(i, pages.length, label),
        });
        watchImages(el.body);
        if (it.specimen) specimenReveal(it.specimen);
        if (it.steps) {
          const r = revealed.get(p.key) || 0;
          el.body.querySelectorAll("[data-step]").forEach((e) => {
            const k = +e.dataset.step;
            e.classList.toggle("shown", k <= r);
            e.classList.toggle("fresh", k === fresh);
          });
          el.body.firstChild.classList.toggle("started", r > 0);   // mätarna fylls bara första gången
          el.body.firstChild.classList.toggle("done", r >= it.steps);
          fresh = 0;
        }
        el.zoom.hidden = !zoom;
        if (zoom) {
          el.zoom.innerHTML = `${it.doc ? docHtml(it.doc) : imgHtml(zoomSrc())}${it.caption ? `<p>${esc(it.caption)}</p>` : ""}<div class="small">${zl ? `ZOOM ${ZOOM[zl]}× · ` : ""}A · ZOOMA  /  B · STÄNG</div>`;
          watchImages(el.zoom);
          const img = el.zoom.querySelector("img");
          if (img) img.addEventListener("load", applyZoom);
          applyZoom();
        }
        el.alert.hidden = !warning() && !gate();
        if (!el.alert.hidden) { el.alert.innerHTML = warning() ? warningHtml(it) : gateHtml(it.gate); gShake = false; return; }
        if (it.pip && !said.has(p.key)) { said.add(p.key); pipSay(pick([].concat(it.pip))); }
        if (it.stampSound && !said.has("stamp" + p.key)) { said.add("stamp" + p.key); setTimeout(sfx.stamp, 450); }
      },
      hints() {
        if (pages && warning()) return [["UD", "välj"], ["A", "bekräfta"], ["B", "avbryt"]];
        if (pages && gate()) return gDone ? [] : [["UD", "välj"], ["A", "svara"], ["B", "avbryt"]];
        if (zoom) return [...(zl ? [["ALL", "flytta"]] : []), ["A", zl < ZOOM.length - 1 ? "zooma in" : "zooma ut"], ["B", "stäng"]];
        const h = pages && pages.length > 1 ? [["LR", "bläddra"]] : [];
        if (pages && stepsLeft() > 0) h.push(["A", pages[i].it.stepHint || (pages[i].it.autoNext ? "öppna" : "granska")]);
        else if (pages && zoomSrc()) h.push(["A", "förstora"]);
        return [...h, ["B", "kapitel"]];
      },
      leave() { el.zoom.hidden = true; el.alert.hidden = true; el.stage.classList.remove("frack"); },
      on(a) {
        const abort = () => { wSel = gSel = 0; gWrong.clear(); sfx.back(); if (i > 0) { i--; render(); } else back(); };
        if (warning()) {
          if (a === "up" || a === "down") { wSel = 1 - wSel; sfx.move(); drawAlert(true); }
          else if (a === "b") abort();
          else if (a === "a" && wSel === 0) { warned.add(pages[i].ex); sfx.select(); if (gate()) drawAlert(true); else render(); }
          else if (a === "a") {
            // Hoppa över hela beviset: till första sidan i nästa bevis, eller tillbaka till listan.
            const ex = pages[i].ex, it = pages[i].it, next = pages.findIndex((p) => p.ex > ex);
            wSel = 0; sfx.select();
            if (next < 0) { if (it.skipPip) pipSay(pick([].concat(it.skipPip))); return back(); }
            // Kommentaren om att man hoppade över får gå före nästa sidas.
            if (it.skipPip) { pipSay(pick([].concat(it.skipPip))); said.add(pages[next].key); }
            i = next; render();
          }
          return;
        }
        if (gate()) {
          const g = pages[i].it.gate;
          if (gDone) return;
          if (a === "up" || a === "down") { gSel = (gSel + (a === "up" ? -1 : 1) + g.options.length) % g.options.length; sfx.move(); drawAlert(true); }
          else if (a === "a") {
            if (gSel === g.answer) { sfx.unlock(); pipSay(pick([].concat(g.right || []))); gateDone(); }
            else if (!gWrong.has(gSel)) { gWrong.add(gSel); gShake = true; sfx.error(); pipSay(pick([].concat(g.wrong || []))); drawAlert(true); }
            else sfx.error();
          }
          else if (a === "b") abort();
          return;
        }
        if (zoom) {
          if (a === "b") { zoom = false; zl = 0; px = py = 0.5; sfx.back(); return render(); }
          if (a === "a") { zl = (zl + 1) % ZOOM.length; if (!zl) px = py = 0.5; sfx.select(); return render(); }
          if (zl) {
            const step = 0.2 / zl;
            if (a === "left") px = Math.max(0, px - step);
            if (a === "right") px = Math.min(1, px + step);
            if (a === "up") py = Math.max(0, py - step);
            if (a === "down") py = Math.min(1, py + step);
            sfx.tick(); applyZoom();
          }
          return;
        }
        if (a === "b") return back();
        if (a === "a" && stepsLeft() > 0) {
          const key = pages[i].key;
          fresh = (revealed.get(key) || 0) + 1;
          revealed.set(key, fresh);
          const page = pages[i], sound = (page.html.match(new RegExp(`data-step="${fresh}" data-sound="(\\w+)"`)) || [])[1];
          if (sound === "stamp") setTimeout(sfx.stamp, 150); else if (sfx[sound]) sfx[sound](); else if (page.it.type === "cover") lightsOn(page.it); else sfx.note();
          const sp = (page.it.stepPips || [])[fresh - 1];
          if (sp) pipSay(pick([].concat(sp)));
          // Mappen går vidare av sig själv när den har slagits upp.
          if (page.it.autoNext && stepsLeft() <= 0) setTimeout(() => {
            if (pages[i] === page && el.body.querySelector(".folder.shown") && i < pages.length - 1) { i++; render(); }
          }, 900);
          return render();
        }
        if (a === "a" && zoomSrc()) { zoom = true; sfx.select(); return render(); }
        let to = a === "left" ? i - 1 : a === "right" || a === "a" ? i + 1 : i;
        if (to === i || to < 0 || to >= pages.length) return;
        // Bakåt in i ett låst bevis (t.ex. ett som hoppades över): börja från dess första sida.
        if (to < i && pages[to].ex !== pages[i].ex && locked(to)) to = pages.findIndex((p) => p.ex === pages[to].ex);
        i = to; sfx.move(); render();
      },
    };
  }

  /* ---------- Textläsare med sidor ----------
     sections: [{ title, text: [stycken] }]. extra: färdiga sidor som läggs sist. */
  function reader({ pip, tag = "", sections, extra = [] }) {
    let pages = null, i = 0;
    const build = () => {
      pages = [];
      sections.forEach((s) => paginate(s.text.map((t) => fill(t))).forEach((paras) => pages.push({ title: s.title, html: textHtml(paras) })));
      pages.push(...extra);
    };
    return {
      pip,
      draw() {
        if (!pages) build();
        const p = pages[i];
        frame({ title: p.title, tag, html: p.html, pager: pagerHtml(i, pages.length) });
        if (p.onShow) p.onShow();
      },
      hints: () => (pages && pages.length > 1 ? [["LR", "bläddra"], ["B", "tillbaka"]] : [["B", "tillbaka"]]),
      leave() { pages.forEach((p) => p.onLeave && p.onLeave()); },
      on(a) {
        if (a === "b") return back();
        const to = a === "left" ? i - 1 : a === "right" || a === "a" ? i + 1 : i;
        if (to === i || to < 0 || to >= pages.length) return;
        if (pages[i].onLeave) pages[i].onLeave();
        i = to; sfx.move(); render();
      },
    };
  }

  /* ---------- Audio Logs ---------- */
  function audioScreen() {
    const PER = 5, items = C.audio, missing = new Set();
    let sel = 0, playing = -1, player = null;
    const stop = () => { if (player) { player.onended = player.onerror = null; player.pause(); player = null; } playing = -1; };
    const self = {
      pip: "audio",
      draw() {
        const page = Math.floor(sel / PER), pages = Math.ceil(items.length / PER);
        const rows = items.slice(page * PER, page * PER + PER).map((it, j) => {
          const i = page * PER + j;
          const meta = i === playing ? '<span class="bars"><i></i><i></i><i></i><i></i></span>SPELAS' : missing.has(i) ? "FIL SAKNAS" : "";
          return `<li class="${i === sel ? "sel" : ""}"><span class="no">${pad2(i + 1)}</span><span class="label">${esc(it.title)}<small>${esc(it.note || "")}</small></span><span class="meta">${meta}</span></li>`;
        }).join("");
        frame({ title: "Ljudloggar", tag: "FÄLTINSPELNINGAR", html: `<ul class="list files">${rows}</ul>`, pager: pagerHtml(page, pages) });
      },
      hints: () => [["UD", "välj"], ["A", sel === playing ? "stoppa" : "spela"], ["B", "tillbaka"]],
      leave: stop,
      on(a) {
        const n = items.length;
        if (a === "up" || a === "down") { sel = (sel + (a === "up" ? -1 : 1) + n) % n; sfx.move(); render(); }
        else if (a === "b") back();
        else if (a === "a" && n) {
          if (sel === playing) { stop(); render(); return; }
          stop();
          const i = sel;
          player = new Audio(items[i].file);
          player.volume = CONFIG.volume;
          player.onended = () => { stop(); redraw(self); };
          player.onerror = () => { stop(); missing.add(i); sfx.error(); pipSay(pick(C.pip.audioMissing)); redraw(self); };
          playing = i;
          missing.delete(i);
          player.play().then(() => pipSay(pick(C.pip.audioPlay))).catch(() => {});
          render();
        }
      },
    };
    return self;
  }

  /* ---------- Subject Profile ---------- */
  function profileScreen() {
    let i = 0;
    const pages = C.profile;
    return {
      pip: "profile",
      draw() {
        const rows = pages[i].rows.map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join("");
        frame({ title: pages[i].title, tag: "FÖRSÖKSPERSONENS PROFIL", html: `<table class="rows">${rows}</table>`, pager: pagerHtml(i, pages.length) });
      },
      hints: () => [["LR", "bläddra"], ["B", "tillbaka"]],
      on(a) {
        if (a === "b") return back();
        const to = a === "left" ? i - 1 : a === "right" || a === "a" ? i + 1 : i;
        if (to === i || to < 0 || to >= pages.length) return;
        i = to; sfx.move(); render();
      },
    };
  }

  /* ---------- Experiments (quiz) ---------- */
  function quizScreen() {
    const qs = C.quiz.questions;
    let phase = "intro", n = 0, sel = 0, score = 0, ok = false;
    return {
      pip: "quiz",
      draw() {
        if (phase === "intro") return frame({ title: C.quiz.title, tag: `${qs.length} FRÅGOR`, html: textHtml(C.quiz.intro) });
        if (phase === "done") {
          const res = C.quiz.results.filter((r) => score >= r.min).sort((a, b) => b.min - a.min)[0] || C.quiz.results[0];
          return frame({ title: res.title, tag: "TEST SLUTFÖRT", html: textHtml([fill(res.text, { score })]) });
        }
        const q = qs[n], fb = phase === "fb";
        const rows = q.options.map((o, i) => {
          const cls = fb ? (i === q.correct ? "sel right" : i === sel ? "wrong" : "") : i === sel ? "sel" : "";
          return `<li class="${cls}"><span class="no">${"ABCD"[i]}</span><span class="label">${esc(o)}</span></li>`;
        }).join("");
        frame({
          title: C.quiz.title, tag: `FRÅGA ${n + 1} / ${qs.length}`,
          html: `<div class="quiz"><p class="lead">${esc(q.q)}</p><ul class="list quiz">${rows}</ul>${fb ? `<p class="fb">${esc(ok ? q.right : q.wrong)}</p>` : ""}</div>`,
        });
      },
      hints: () => phase === "q" ? [["UD", "välj"], ["A", "svara"], ["B", "avbryt"]]
        : phase === "done" ? [["A", "avsluta"], ["B", "tillbaka"]]
        : [["A", phase === "intro" ? "starta testet" : "fortsätt"], ["B", "avbryt"]],
      on(a) {
        if (a === "b") return back();
        if (phase === "q" && (a === "up" || a === "down")) {
          const len = qs[n].options.length;
          sel = (sel + (a === "up" ? -1 : 1) + len) % len;
          sfx.move(); return render();
        }
        if (a !== "a") return;
        if (phase === "intro") { phase = "q"; sfx.select(); }
        else if (phase === "q") {
          ok = sel === qs[n].correct;
          if (ok) { score++; sfx.select(); } else sfx.error();
          pipSay(pick(ok ? C.pip.quizRight : C.pip.quizWrong));
          phase = "fb";
        } else if (phase === "fb") {
          sfx.move();
          if (++n < qs.length) { phase = "q"; sel = 0; }
          else { phase = "done"; state.quizScore = score; pipSay(pick(C.pip.quizDone)); }
        } else return back();
        render();
      },
    };
  }

  /* ---------- Final Report ---------- */
  function finalScreen() {
    const F = C.finalReport;
    let timer = null;
    const verdict = {
      title: F.verdictTitle,
      html: `<div class="verdict">${F.verdict.map((v) => `<p>${esc(v)}</p>`).join("")}</div><div class="stamp">${esc(F.stamp)}</div>`,
      onShow() {
        clearTimeout(timer);
        // Stämpeln slår ner efter att de tre raderna har tonat fram (se .stamp i style.css).
        timer = setTimeout(() => {
          sfx.stamp();
          if (!state.filed) { state.filed = true; drawBand(); pipSay(pick(C.pip.finalDone)); }
          // Här kan kvittoskrivaren kopplas in senare.
        }, 3900);
      },
      onLeave() { clearTimeout(timer); },
    };
    return reader({ pip: "final", tag: "SLUTRAPPORT", sections: F.pages, extra: [verdict] });
  }

  /* ==========================================================================
     INPUT: tangentbord och joystick ger samma "knappar"
     up, down, left, right, a, b, c
     ========================================================================== */
  let lastInput = Date.now(), idleCount = 0, lastAction = "-", debugOn = false;
  const KONAMI = "up,up,down,down,left,right,left,right,b,a";
  let recent = [];

  function act(a) {
    lastInput = Date.now();
    idleCount = 0;
    lastAction = a;
    recent.push(a);
    recent = recent.slice(-10);
    if (recent.join() === KONAMI) {
      recent = [];
      vit.cheese = Date.now() + 25000;
      el.stage.classList.add("cheese");
      sfx.unlock();
      pipSay(pick(C.eggs.cheese));
    }
    const cur = top();
    if (a === "c") pipTalk();
    else if (cur) cur.on(a);
    flashHint(a);
  }

  // Låter knappen i bandet blinka till när den trycks.
  const HINT_OF = { a: "A", b: "B", c: "C", up: "UD", down: "UD", left: "LR", right: "LR" };
  function flashHint(a) {
    const k = el.hints.querySelector(`kbd[data-k="${HINT_OF[a]}"]`);
    if (!k) return;
    k.classList.add("hit");
    setTimeout(() => k.classList.remove("hit"), 160);
  }

  const KEYMAP = {
    ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
    Enter: "a", " ": "a", Escape: "b", Backspace: "b", m: "c", M: "c",
    a: "a", A: "a", b: "b", B: "b", c: "c", C: "c",   // samma bokstäver som knapparna på skärmen
  };
  window.addEventListener("keydown", (e) => {
    if (e.key === "d" || e.key === "D") { debugOn = !debugOn; el.debug.hidden = !debugOn; return; }
    const a = KEYMAP[e.key];
    if (!a) return;
    e.preventDefault();
    act(a);
  });

  const DIRS = ["up", "down", "left", "right"], held = {};
  function pollPad(t) {
    const pads = navigator.getGamepads ? [...navigator.getGamepads()] : [];
    const pad = pads.find((p) => p && p.connected);
    const now = {};
    if (pad) {
      const btn = (i) => !!(pad.buttons[i] && pad.buttons[i].pressed);
      const x = (pad.axes[CONFIG.axisX] || 0) * (CONFIG.invertX ? -1 : 1);
      const y = (pad.axes[CONFIG.axisY] || 0) * (CONFIG.invertY ? -1 : 1);
      now.left = x < -CONFIG.deadzone || btn(CONFIG.dpad.left);
      now.right = x > CONFIG.deadzone || btn(CONFIG.dpad.right);
      now.up = y < -CONFIG.deadzone || btn(CONFIG.dpad.up);
      now.down = y > CONFIG.deadzone || btn(CONFIG.dpad.down);
      now.a = btn(CONFIG.buttons.A);
      now.b = btn(CONFIG.buttons.B);
      now.c = btn(CONFIG.buttons.C);
    }
    for (const k of ["up", "down", "left", "right", "a", "b", "c"]) {
      if (!now[k]) { delete held[k]; continue; }
      if (!held[k]) { held[k] = t + CONFIG.repeatDelay; act(k); }
      else if (DIRS.includes(k) && t >= held[k]) { held[k] = t + CONFIG.repeatRate; act(k); }
    }
    if (debugOn) drawDebug(pad);
    requestAnimationFrame(pollPad);
  }

  function drawDebug(pad) {
    const lines = ["FELSÖKNING (D stänger)", `Senaste: ${lastAction}`];
    if (!pad) lines.push("Ingen joystick hittad.", "Tryck på en knapp på den", "så brukar den dyka upp.");
    else {
      const down = pad.buttons.map((b, i) => (b.pressed ? i : null)).filter((i) => i !== null);
      lines.push(pad.id.slice(0, 38), `Knappar nere: ${down.length ? down.join(", ") : "-"}`);
      lines.push(`Axlar: ${pad.axes.map((v, i) => `${i}:${v.toFixed(1)}`).join("  ")}`);
      lines.push(`Inställt: A=${CONFIG.buttons.A} B=${CONFIG.buttons.B} C=${CONFIG.buttons.C}  X=${CONFIG.axisX} Y=${CONFIG.axisY}`);
    }
    el.debug.textContent = lines.join("\n");
  }

  /* ==========================================================================
     START
     ========================================================================== */
  function fit() {
    const s = Math.min(window.innerWidth / 1024, window.innerHeight / 600);
    el.stage.style.left = (window.innerWidth - 1024 * s) / 2 + "px";
    el.stage.style.top = (window.innerHeight - 600 * s) / 2 + "px";
    el.stage.style.transform = `scale(${s})`;
  }

  function start() {
    measureNotes();
    drawBand();
    tickClock(); setInterval(tickClock, 1000);
    tickStatus(); setInterval(tickStatus, 1300);
    setInterval(() => {
      // Väntar dubbelt så länge för varje gång han pratat i tomma luften, och
      // tystnar helt efter idleTimes gånger tills någon rör en knapp igen.
      const wait = CONFIG.idleSeconds * 1000 * 2 ** idleCount;
      if (state.stack.length && top().on && idleCount < CONFIG.idleTimes && Date.now() - lastInput > wait) {
        lastInput = Date.now();
        idleCount++;
        pipSay(pick(C.pip.idle));
      }
    }, 1000);
    requestAnimationFrame(pollPad);

    // Genvägar när man testar: index.html#skip hoppar över uppstarten,
    // index.html#keys=down,a trycker dessutom på knapparna i tur och ordning.
    const hash = decodeURIComponent(location.hash.slice(1));
    const keys = (hash.match(/keys=([\w,]+)/) || [])[1];
    if (hash.includes("skip") || keys) go(menuScreen()); else go(bootScreen());
    if (keys) keys.split(",").forEach((k, i) => setTimeout(() => act(k), 80 * (i + 1)));
  }

  fit();
  window.addEventListener("resize", fit);
  // Vänta på typsnitten så att sidbrytningen mäts med rätt bokstäver.
  const faces = ['400 12px "Plex Mono"', '500 12px "Plex Mono"', 'italic 500 12px "Cormorant"', 'italic 600 12px "Cormorant"'];
  (document.fonts ? Promise.all(faces.map((f) => document.fonts.load(f))) : Promise.resolve()).then(start, start);
})();
