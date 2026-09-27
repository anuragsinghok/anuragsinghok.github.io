// Language switch + chapter dots. Works even if WebGL is unavailable.
(function () {
  var root = document.documentElement;
  var titles = {
    ja: "Anurag Singh | 日本在住エンジニア — Engineer in Japan",
    en: "Anurag Singh | Engineer in Japan — looking to join a team in Tokyo"
  };
  function setLang(l) {
    root.dataset.lang = l;
    root.lang = l;
    document.title = titles[l];
    try { localStorage.setItem("lang", l); } catch (e) {}
  }
  if (root.dataset.lang === "en") document.title = titles.en;
  document.getElementById("langBtn").addEventListener("click", function () {
    setLang(root.dataset.lang === "en" ? "ja" : "en");
  });

  var panels = document.querySelectorAll(".panel"), dots = document.getElementById("dots");
  panels.forEach(function (p) {
    var li = document.createElement("li"), b = document.createElement("button");
    b.type = "button"; b.tabIndex = -1;
    b.addEventListener("click", function () { p.scrollIntoView({ behavior: "smooth" }); });
    li.appendChild(b); dots.appendChild(li);
  });
  function onScroll() {
    var mid = window.scrollY + window.innerHeight / 2, idx = 0;
    panels.forEach(function (p, i) { if (p.offsetTop <= mid) idx = i; });
    dots.querySelectorAll("button").forEach(function (b, j) { b.classList.toggle("on", j === idx); });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // project cards tilt in 3D under the pointer (mouse and pen only; skipped for reduced motion)
  var still = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll(".proj").forEach(function (card) {
    if (still) return;
    card.addEventListener("pointermove", function (e) {
      if (e.pointerType === "touch") return;
      var r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      card.classList.add("tilting");
      card.style.setProperty("--ry", (x * 10).toFixed(2) + "deg");
      card.style.setProperty("--rx", (-y * 8).toFixed(2) + "deg");
    });
    card.addEventListener("pointerleave", function () {
      card.classList.remove("tilting");
      card.style.setProperty("--ry", "0deg");
      card.style.setProperty("--rx", "0deg");
    });
  });

  // hire-me form → Google Apps Script web app (sheet + email + calendar). Hidden until an endpoint is set.
  var form = document.getElementById("hireForm");
  if (form && form.dataset.endpoint) {
    form.hidden = false;
    var status = form.querySelector(".fstatus");
    var msg = {
      sending: { ja: "送信中…", en: "Sending…" },
      ok: { ja: "送信しました。ありがとうございます！1営業日以内にご連絡します。", en: "Sent — thank you! I'll reply within one business day." },
      invalid: { ja: "＊の項目をご記入ください。", en: "Please fill in the fields marked *." },
      err: { ja: "送信できませんでした。お手数ですが LinkedIn からご連絡ください。", en: "Couldn't send. Please message me on LinkedIn instead." }
    };
    var say = function (k, cls) { status.textContent = msg[k][root.dataset.lang === "en" ? "en" : "ja"]; status.className = "fstatus " + (cls || ""); };
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { say("invalid", "err"); form.reportValidity(); return; }
      var btn = form.querySelector("button"); btn.disabled = true; say("sending");
      fetch(form.dataset.endpoint, { method: "POST", mode: "no-cors", body: new URLSearchParams(new FormData(form)) })
        .then(function () { form.reset(); say("ok", "ok"); })
        .catch(function () { say("err", "err"); })
        .finally(function () { btn.disabled = false; });
    });
  }
})();
