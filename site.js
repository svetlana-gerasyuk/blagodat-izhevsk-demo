(() => {
  "use strict";

  const TG_URL = "https://t.me/+79524046545";
  const PHONE_TEL = "tel:+79524046545";
  const SHOP = "мастерскую «Благодать» (Ижевск, ул. Ярушки, 25)";

  // Каталог. Цен и сроков в данных нет, поэтому их нигде не показываем.
  const SERVICES = [
    { id: "tire",    g: "A", name: "Шиномонтаж до 24″",           text: "Снятие и установка шин на колёса диаметром до 24 дюймов.", img: "c-tire",      q: true,  size: "w7" },
    { id: "balance", g: "A", name: "Балансировка",                 text: "Балансировка колёс после шиномонтажа.",                       img: "c-balance",   q: true,  size: "w5" },
    { id: "repair",  g: "A", name: "Ремонт шин",                   text: "Ремонт повреждённых шин.",                                    img: "c-repair",    q: false, size: "w4" },
    { id: "rim",     g: "A", name: "Правка дисков",                text: "Правка любых дисков.",                                        img: "c-rim",       q: true,  size: "w4" },
    { id: "rimweld", g: "A", name: "Сварка дисков",                text: "Сварка любых дисков.",                                        img: "c-weld-rim",  q: true,  size: "w4" },
    { id: "moto",    g: "A", name: "Шиномонтаж и ремонт мотоколёс", text: "Шиномонтаж, балансировка и ремонт мотоколёс.",              img: "c-moto",      q: false, size: "wide" },
    { id: "argon",   g: "B", name: "Аргонная сварка",              text: "Сварка всех металлов в среде аргона.",                        img: "c-argon",     q: true,  size: "tall" },
    { id: "heat",    g: "B", name: "Ремонт теплообменников",       text: "Теплообменники из алюминия, меди и других металлов.",         img: "c-heat",      q: false, size: "s" },
    { id: "ac",      g: "B", name: "Ремонт трубок кондиционеров",  text: "Сварка и пайка трубок кондиционеров.",                        img: "c-ac",        q: false, size: "s" }
  ];
  const chosen = () => SERVICES.filter((s) => state.sel.has(s.id)).map((s) => s.id);
  const byId = Object.fromEntries(SERVICES.map((s) => [s.id, s]));
  const TIMES = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];
  const MONTHS = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
  const MON_S = ["янв", "фев", "мар", "апр", "мая", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
  const DOW_S = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"];
  const MAX_DAYS = 60;

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // ---------- состояние ----------
  const state = { sel: new Set(), date: null, time: null, step: 1, viewY: 0, viewM: 0 };

  const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
  const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const parseYmd = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  const today = () => startOfDay(new Date());
  const lastDay = () => { const d = today(); d.setDate(d.getDate() + MAX_DAYS); return d; };
  const dateLabel = (s) => { const d = parseYmd(s); return `${DOW_S[d.getDay()]}, ${d.getDate()} ${MON_S[d.getMonth()]}`; };

  // ---------- каталог ----------
  const checkSvg = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10.5l4 4 8-9" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function cardHtml(s, i) {
    return `<button type="button" class="card card--${s.size}" data-id="${s.id}" role="checkbox" aria-checked="false">
      <img src="assets/${s.img}.webp" alt="" loading="lazy" width="1000" height="750">
      <span class="card__shade" aria-hidden="true"></span>
      <span class="card__no" aria-hidden="true">${String(i + 1).padStart(2, "0")}</span>
      <span class="card__tick" aria-hidden="true">${checkSvg}</span>
      <span class="card__body">
        <b class="card__t">${s.name}</b>
        <span class="card__p">${s.text}</span>
        <span class="card__btn"><span class="off">Выбрать</span><span class="on">Выбрано</span></span>
      </span>
    </button>`;
  }

  function renderCatalog() {
    $("#catA").innerHTML = SERVICES.filter((s) => s.g === "A").map((s, i) => cardHtml(s, i)).join("");
    $("#catB").innerHTML = SERVICES.filter((s) => s.g === "B").map((s, i) => cardHtml(s, i + 6)).join("");
    $("#quickChips").innerHTML = SERVICES.filter((s) => s.q).slice(0, 5).map((s) => `<button type="button" class="chip" data-id="${s.id}" aria-pressed="false">${s.name}</button>`).join("");
    const chk = $("#chk");
    chk.innerHTML = ["A", "B"].map((g) => `<div class="chk__g"><p class="lbl">${g === "A" ? "Шиномонтаж и ремонт колёс" : "Сварочные и ремонтные работы"}</p>${
      SERVICES.filter((s) => s.g === g).map((s) => `<button type="button" class="opt" data-id="${s.id}" role="checkbox" aria-checked="false"><i aria-hidden="true">${checkSvg}</i><span>${s.name}</span></button>`).join("")
    }</div>`).join("");
  }

  function toggle(id) {
    if (state.sel.has(id)) state.sel.delete(id); else state.sel.add(id);
    syncSelection();
  }

  // одна точка правды: всё, что показывает выбор, перерисовывается отсюда
  function syncSelection() {
    const n = state.sel.size;
    $$("[data-id]").forEach((el) => {
      const on = state.sel.has(el.dataset.id);
      el.classList.toggle("is-on", on);
      if (el.hasAttribute("aria-checked")) el.setAttribute("aria-checked", on);
      if (el.hasAttribute("aria-pressed")) el.setAttribute("aria-pressed", on);
    });
    $("#pickN").textContent = n;
    $("#pick").hidden = n === 0 || modalOpen();
    $("#dockBook").textContent = n ? `Записаться · ${n}` : "Записаться";
    $("#sheetCount").textContent = n ? `Выбрано услуг: ${n}` : "";
    updateNext();
  }

  // ---------- модальное окно ----------
  const modal = $("#modal");
  const modalOpen = () => !modal.hidden;
  let lastFocus = null;
  const TITLES = { 1: "Выбор услуг", 2: "День и время", 3: "Контакты", 4: "Проверка заявки" };

  function openModal(step) {
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.body.classList.add("lock");
    $("#pick").hidden = true;
    requestAnimationFrame(() => modal.classList.add("is-open"));
    goStep(step || 1);
    setTimeout(() => $(".x", modal).focus(), 30);
  }
  function closeModal() {
    modal.classList.remove("is-open");
    document.body.classList.remove("lock");
    setTimeout(() => { modal.hidden = true; syncSelection(); }, 200);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function goStep(n) {
    state.step = n;
    $$(".pane", modal).forEach((p) => { p.hidden = +p.dataset.p !== n; p.classList.remove("in"); });
    const pane = $(`.pane[data-p="${n}"]`, modal);
    void pane.offsetWidth; pane.classList.add("in");
    $$("#stepper li").forEach((li) => {
      const s = +li.dataset.s;
      li.classList.toggle("is-cur", s === n);
      li.classList.toggle("is-done", s < n);
    });
    $("#mTitle").textContent = TITLES[n];
    $("#back").style.visibility = n === 1 ? "hidden" : "visible";
    $("#next").textContent = n === 4 ? (via() === "tg" ? "Открыть Telegram" : "Позвонить") : "Продолжить";
    if (n === 2) renderCal();
    if (n === 4) renderSummary();
    $(".sheet__body", modal).scrollTop = 0;
    updateNext();
  }

  const via = () => ($('input[name="via"]:checked') || {}).value || "tg";
  const phoneDigits = () => $("#fPhone").value.replace(/\D/g, "");
  const phoneOk = () => !phoneDigits() || phoneDigits().length >= 10;

  function stepValid(n) {
    if (n === 1) return state.sel.size > 0;
    if (n === 2) return !!state.date && !!state.time && parseYmd(state.date) >= today() && !timePast(state.date, state.time);
    if (n === 3) return phoneOk();
    return state.sel.size > 0 && !!state.date && !!state.time;
  }
  function updateNext() { $("#next").disabled = !stepValid(state.step); }

  // ---------- календарь ----------
  function renderCal() {
    const y = state.viewY, m = state.viewM;
    $("#calTitle").textContent = `${MONTHS[m]} ${y}`;
    const first = new Date(y, m, 1);
    const offset = (first.getDay() + 6) % 7;
    const days = new Date(y, m + 1, 0).getDate();
    const t = today(), max = lastDay();
    let html = "";
    for (let i = 0; i < offset; i++) html += "<span></span>";
    for (let d = 1; d <= days; d++) {
      const dt = new Date(y, m, d);
      const dis = dt < t || dt > max;
      const key = ymd(dt);
      html += `<button type="button" class="day${dis ? " is-dis" : ""}${key === state.date ? " is-on" : ""}${+dt === +t ? " is-today" : ""}" data-d="${key}" ${dis ? "disabled" : ""} aria-label="${d} ${MONTHS[m].toLowerCase()}">${d}</button>`;
    }
    $("#calDays").innerHTML = html;
    const prevOk = new Date(y, m, 1) > new Date(t.getFullYear(), t.getMonth(), 1);
    const nextOk = new Date(y, m + 1, 1) <= max;
    $("#calPrev").disabled = !prevOk;
    $("#calNext").disabled = !nextOk;
    renderTimes();
  }

  const timePast = (dateKey, time) => {
    const d = parseYmd(dateKey);
    if (+d !== +today()) return false;
    const [h, mi] = time.split(":").map(Number);
    const now = new Date();
    return h * 60 + mi <= now.getHours() * 60 + now.getMinutes();
  };

  function renderTimes() {
    $("#times").innerHTML = TIMES.map((t) => {
      const dis = !state.date || timePast(state.date, t);
      return `<button type="button" class="time${t === state.time ? " is-on" : ""}" data-t="${t}" ${dis ? "disabled" : ""}>${t}</button>`;
    }).join("");
    if (!state.date) $("#times").insertAdjacentHTML("beforeend", '<p class="hint hint--s">Сначала выберите день.</p>');
  }

  // ---------- заявка ----------
  function buildMessage() {
    const list = chosen().map((id, i) => `${i + 1}. ${byId[id].name}`).join("\n");
    const name = $("#fName").value.trim(), phone = $("#fPhone").value.trim(), note = $("#fNote").value.trim();
    const lines = [
      `Здравствуйте! Хочу записаться в ${SHOP}.`,
      "",
      `Услуги (${state.sel.size}):`,
      list,
      "",
      `Предпочтительное время: ${dateLabel(state.date)}, ${state.time} (прошу подтвердить, свободно ли).`
    ];
    if (name) lines.push(`Имя: ${name}`);
    if (phone) lines.push(`Телефон: ${phone}`);
    if (note) lines.push(`Комментарий: ${note}`);
    return lines.join("\n");
  }

  function renderSummary() {
    const rows = [
      ["Мастерская", "Благодать, Ижевск, ул. Ярушки, 25"],
      ["Услуги", chosen().map((id) => `<span class="pill">${byId[id].name}</span>`).join("")],
      ["Дата", dateLabel(state.date)],
      ["Время", `${state.time} <small>предпочтительное, мастерская подтвердит</small>`],
      ["Способ связи", via() === "tg" ? "Telegram" : "Звонок в мастерскую"]
    ];
    const name = $("#fName").value.trim(), phone = $("#fPhone").value.trim();
    if (name) rows.push(["Имя", esc(name)]);
    if (phone) rows.push(["Телефон", esc(phone)]);
    $("#sum").innerHTML = rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("");
    $("#msg").textContent = buildMessage();
    $("#sendHint").textContent = via() === "tg"
      ? "Текст заявки скопируется, откроется чат мастерской в Telegram. Вставьте текст и отправьте."
      : "Позвоните в мастерскую и назовите выбранные услуги и время.";
    $("#msg").hidden = via() !== "tg";
    const lbl = $$(".lbl", $('.pane[data-p="4"]'))[0];
    if (lbl) lbl.hidden = via() !== "tg";
  }
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  async function send() {
    if (!stepValid(4)) return;
    if (via() === "call") { location.href = PHONE_TEL; return; }
    const text = buildMessage();
    let copied = false;
    try { await navigator.clipboard.writeText(text); copied = true; } catch (_) {
      try { const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select(); copied = document.execCommand("copy"); ta.remove(); } catch (__) {}
    }
    $("#sendHint").textContent = copied
      ? "Текст скопирован. В Telegram вставьте его в сообщение и отправьте."
      : "Не удалось скопировать автоматически: выделите текст выше, скопируйте и вставьте в Telegram.";
    window.open(TG_URL, "_blank", "noopener");
  }

  // ---------- события ----------
  function bind() {
    document.addEventListener("click", (e) => {
      const card = e.target.closest(".card[data-id], .chip[data-id], .opt[data-id]");
      if (card) { toggle(card.dataset.id); return; }
      if (e.target.closest("[data-open-booking]")) { openModal(state.step > 1 && allValidBefore(state.step) ? state.step : 1); return; }
      if (e.target.closest("[data-close]")) { closeModal(); return; }
      const day = e.target.closest(".day:not(.is-dis)");
      if (day) {
        state.date = day.dataset.d;
        if (state.time && timePast(state.date, state.time)) state.time = null;
        renderCal(); updateNext(); return;
      }
      const tm = e.target.closest(".time:not(:disabled)");
      if (tm) { state.time = tm.dataset.t; renderTimes(); updateNext(); return; }
      if (e.target.closest("#calPrev")) { shiftMonth(-1); return; }
      if (e.target.closest("#calNext")) { shiftMonth(1); return; }
      const st = e.target.closest("#stepper li");
      if (st && modalOpen()) { const s = +st.dataset.s; if (s < state.step || (s > state.step && allValidBefore(s))) goStep(s); }
    });
    $("#next").addEventListener("click", () => { if (state.step < 4) goStep(state.step + 1); else send(); });
    $("#back").addEventListener("click", () => { if (state.step > 1) goStep(state.step - 1); });
    $$('input[name="via"]').forEach((r) => r.addEventListener("change", updateNext));
    $("#fPhone").addEventListener("input", () => { $("#phoneErr").hidden = phoneOk(); updateNext(); });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modalOpen()) closeModal();
      if (e.key === "Tab" && modalOpen()) trapFocus(e);
    });
    const burger = $(".burger");
    burger.addEventListener("click", () => {
      const open = document.body.classList.toggle("menu");
      burger.setAttribute("aria-expanded", open);
    });
    $$("#nav a").forEach((a) => a.addEventListener("click", () => { document.body.classList.remove("menu"); burger.setAttribute("aria-expanded", false); }));
  }
  function allValidBefore(s) { for (let i = 1; i < s; i++) if (!stepValid(i)) return false; return true; }
  function shiftMonth(dir) {
    const d = new Date(state.viewY, state.viewM + dir, 1);
    state.viewY = d.getFullYear(); state.viewM = d.getMonth(); renderCal();
  }
  function trapFocus(e) {
    const f = $$('button:not([disabled]), input, textarea, a[href]', modal).filter((x) => x.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  // ---------- появление при прокрутке ----------
  function reveal() {
    const els = $$(".reveal");
    if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) { els.forEach((e) => e.classList.add("in")); return; }
    const io = new IntersectionObserver((en) => en.forEach((x) => { if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); } }), { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    els.forEach((e, i) => { e.style.setProperty("--d", `${(i % 4) * 60}ms`); io.observe(e); });
  }

  // ---------- старт ----------
  const t0 = today();
  state.viewY = t0.getFullYear(); state.viewM = t0.getMonth();
  renderCatalog();
  bind();
  reveal();
  syncSelection();
  window.__blagodat = { state, buildMessage, SERVICES };
})();
