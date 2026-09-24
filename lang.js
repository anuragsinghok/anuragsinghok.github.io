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
})();
