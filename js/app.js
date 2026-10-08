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
  };

  const C = CONTENT;
  const $ = (id) => document.getElementById(id);
  const el = {
    stage: $("stage"), title: $("main-title"), tag: $("main-tag"), body: $("main-body"),
    pager: $("main-pager"), hints: $("hints"), bandL: $("band-left"), bandR: $("band-right"),
    notes: [...$("notes").children], debug: $("debug"),
    nav: [...document.querySelectorAll("#topnav span")],
  };

  const state = {
    stack: [],             // skärmarna man har gått in i; den sista visas
    visited: new Set(),    // besökta sektioner
    read: new Set(),       // öppnade filer
    unlocked: false,
    filed: false,          // slutrapporten läst till slutet
    quizScore: null,
  };
  const SECTIONS = C.menu.filter((m) => m.id !== "final");

  /* ---------- Småhjälp ---------- */
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const pad2 = (n) => String(n).padStart(2, "0");
  const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
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
      score: state.quizScore === null ? "not tested" : `${state.quizScore} of ${C.quiz.questions.length}`,
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
    stamp:  () => { tone(110, 0.25, { type: "sawtooth", to: 40, vol: 0.14 }); tone(70, 0.3, { type: "square", to: 30, vol: 0.1 }); },
  };

  /* ==========================================================================
     DR. PIPS LOGG (EXPERIMENTAL NOTES)
     ========================================================================== */
  const notes = { lines: [], queue: [], busy: false, msg: 0, cols: 34 };

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
    rows.forEach((t) => notes.queue.push({ t, msg: notes.msg }));
    if (!notes.busy) typeNext();
  }

  function typeNext() {
    const next = notes.queue.shift();
    if (!next) { notes.busy = false; return; }
    notes.busy = true;
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
    $("st-hr").textContent = `${Math.round(vit.hr)} bpm`;
    $("st-temp").textContent = `${vit.temp.toFixed(1)} °C`;
    $("st-act").textContent = vit.act;
    $("st-glu").textContent = `${(vit.spike ? 9.4 + Math.random() * 0.6 : vit.glu).toFixed(1)} mmol/L`;
    $("st-state").textContent = vit.cheese ? "cheese" : vit.state;
  }

  function drawBand() {
    el.bandL.innerHTML = `SECTIONS<b>${state.visited.size} / ${SECTIONS.length}</b>`;
    el.bandR.innerHTML = `FINAL REPORT<b>${state.filed ? "FILED" : state.unlocked ? "READY" : "LOCKED"}</b>`;
  }

  // Knapptips i bandet. Varje tips är [knapp, text]; knapp är A, B, C, UD eller LR.
  const KEYS = {
    A: "A", B: "B", C: "C",
    UD: '<i class="tri u"></i><i class="tri d"></i>',
    LR: '<i class="tri l"></i><i class="tri r"></i>',
  };
  function setHints(list) {
    el.hints.innerHTML = list.map(([k, t]) => `<span><kbd>${KEYS[k]}</kbd>${esc(t)}</span>`).join("");
  }

  /* ==========================================================================
     MITTENPANELEN: gemensamma byggstenar
     ========================================================================== */
  function frame({ title, tag = "", html = "", pager = "" }) {
    el.title.textContent = title;
    el.tag.textContent = tag;
    el.body.innerHTML = html;
    el.pager.innerHTML = pager;
  }

  function pagerHtml(i, n) {
    if (n < 2) return "";
    return `<i class="tri l${i === 0 ? " off" : ""}"></i>PAGE ${i + 1} / ${n}<i class="tri r${i === n - 1 ? " off" : ""}"></i>`;
  }

  const textHtml = (paras) => `<div class="text">${paras.map((p) => `<p>${esc(p)}</p>`).join("")}</div>`;

  // Delar upp stycken på så många sidor som behövs för att allt ska få plats
  // i mittenpanelen. Mäter med de riktiga typsnitten, så inget hamnar utanför.
  function paginate(paras) {
    el.body.innerHTML = '<div class="text"></div>';
    const wrap = el.body.firstChild, max = el.body.clientHeight;
    const fits = () => wrap.offsetHeight <= max;
    const pages = [];
    let cur = [];
    const flush = () => { if (cur.length) pages.push(cur); cur = []; wrap.innerHTML = ""; };
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
          title: C.boot.title, tag: "BOOT",
          html: `<div class="boot">${lines.slice(0, shown).map((l) => `<p>${esc(l)}</p>`).join("")}${done() ? `<div class="prompt">${esc(C.boot.prompt)}</div>` : ""}</div>`,
        });
        if (!timer && !done()) timer = setInterval(() => {
          shown++; sfx.tick();
          if (done()) { clearInterval(timer); pipSay(pick(C.pip.boot)); }
          redraw(self);
        }, 520);
      },
      hints: () => [["A", done() ? "begin" : "skip"]],
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
      archive: () => fileList({ items: C.archive, key: "archive", title: "Archive", tag: "CASE FILES" }),
      mouse:   () => fileList({ items: C.mouse, key: "mouse", title: "Mouse Research", tag: "DR. PIP" }),
      audio: audioScreen, profile: profileScreen, quiz: quizScreen,
      escape:  () => reader({ pip: "escape", tag: "MODULE OFFLINE", sections: [C.escape] }),
      final: finalScreen,
    };
    return {
      draw() {
        const rows = C.menu.map((m, i) => {
          const locked = m.id === "final" && !state.unlocked;
          const meta = locked ? "LOCKED" : m.id === "final" ? (state.filed ? "FILED" : "READY") : state.visited.has(m.id) ? "VISITED" : "";
          return `<li class="${i === sel ? "sel" : ""}${locked ? " locked" : ""}"><span class="no">${pad2(i + 1)}</span><span class="label">${esc(m.label)}</span><span class="meta">${meta}</span></li>`;
        }).join("");
        frame({ title: C.menuTitle, tag: "SELECT RECORD", html: `<ul class="list menu">${rows}</ul><div class="menu-desc">${esc(C.menu[sel].desc)}</div>` });
      },
      hints: () => [["UD", "choose"], ["A", "open"], ["C", "ask Dr. Pip"]],
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

  /* ---------- Lista med filer (Archive och Mouse Research) ---------- */
  function fileList({ items, key, title, tag }) {
    const PER = 5;
    let sel = 0;
    return {
      pip: key,
      draw() {
        const page = Math.floor(sel / PER), pages = Math.ceil(items.length / PER);
        const rows = items.slice(page * PER, page * PER + PER).map((it, j) => {
          const i = page * PER + j;
          return `<li class="${i === sel ? "sel" : ""}"><span class="no">${esc(it.id)}</span><span class="label">${esc(it.title)}${it.date ? `<small>${esc(it.date)}</small>` : ""}</span><span class="meta">${state.read.has(key + i) ? "READ" : ""}</span></li>`;
        }).join("");
        frame({ title, tag, html: `<ul class="list files">${rows}</ul>`, pager: pagerHtml(page, pages) });
      },
      hints: () => [["UD", "choose"], ["A", "open"], ["B", "back"]],
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
      hints: () => (pages && pages.length > 1 ? [["LR", "page"], ["B", "back"]] : [["B", "back"]]),
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
          const meta = i === playing ? '<span class="bars"><i></i><i></i><i></i><i></i></span>PLAYING' : missing.has(i) ? "FILE NOT FOUND" : "";
          return `<li class="${i === sel ? "sel" : ""}"><span class="no">${pad2(i + 1)}</span><span class="label">${esc(it.title)}<small>${esc(it.note || "")}</small></span><span class="meta">${meta}</span></li>`;
        }).join("");
        frame({ title: "Audio Logs", tag: "FIELD RECORDINGS", html: `<ul class="list files">${rows}</ul>`, pager: pagerHtml(page, pages) });
      },
      hints: () => [["UD", "choose"], ["A", sel === playing ? "stop" : "play"], ["B", "back"]],
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
        frame({ title: pages[i].title, tag: "SUBJECT PROFILE", html: `<table class="rows">${rows}</table>`, pager: pagerHtml(i, pages.length) });
      },
      hints: () => [["LR", "page"], ["B", "back"]],
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
        if (phase === "intro") return frame({ title: C.quiz.title, tag: `${qs.length} QUESTIONS`, html: textHtml(C.quiz.intro) });
        if (phase === "done") {
          const res = C.quiz.results.filter((r) => score >= r.min).sort((a, b) => b.min - a.min)[0] || C.quiz.results[0];
          return frame({ title: res.title, tag: "ASSESSMENT COMPLETE", html: textHtml([fill(res.text, { score })]) });
        }
        const q = qs[n], fb = phase === "fb";
        const rows = q.options.map((o, i) => {
          const cls = fb ? (i === q.correct ? "sel right" : i === sel ? "wrong" : "") : i === sel ? "sel" : "";
          return `<li class="${cls}"><span class="no">${"ABCD"[i]}</span><span class="label">${esc(o)}</span></li>`;
        }).join("");
        frame({
          title: C.quiz.title, tag: `QUESTION ${n + 1} / ${qs.length}`,
          html: `<div class="quiz"><p class="lead">${esc(q.q)}</p><ul class="list quiz">${rows}</ul>${fb ? `<p class="fb">${esc(ok ? q.right : q.wrong)}</p>` : ""}</div>`,
        });
      },
      hints: () => phase === "q" ? [["UD", "choose"], ["A", "answer"], ["B", "abort"]]
        : phase === "done" ? [["A", "finish"], ["B", "back"]]
        : [["A", phase === "intro" ? "begin test" : "continue"], ["B", "abort"]],
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
    return reader({ pip: "final", tag: "FINAL REPORT", sections: F.pages, extra: [verdict] });
  }

  /* ==========================================================================
     INPUT: tangentbord och joystick ger samma "knappar"
     up, down, left, right, a, b, c
     ========================================================================== */
  let lastInput = Date.now(), lastAction = "-", debugOn = false;
  const KONAMI = "up,up,down,down,left,right,left,right,b,a";
  let recent = [];

  function act(a) {
    lastInput = Date.now();
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
    if (a === "c") return pipTalk();
    const cur = top();
    if (cur) cur.on(a);
  }

  const KEYMAP = {
    ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
    Enter: "a", " ": "a", Escape: "b", Backspace: "b", m: "c", M: "c",
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
      if (state.stack.length && top().on && Date.now() - lastInput > CONFIG.idleSeconds * 1000) {
        lastInput = Date.now();
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
