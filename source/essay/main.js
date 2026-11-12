/**
 * 随笔捡拾 · 页面逻辑
 * 数据源：/json/essays.json（往里加条目即可上新，无需改页面）
 */
(function () {
  "use strict";

  var wall = document.getElementById("essay-wall");
  if (!wall) return;

  var stats = document.getElementById("essay-stats");
  var filters = document.getElementById("essay-filters");
  var empty = document.getElementById("essay-empty");
  var ROT = [-1.4, 1.1, -0.7, 1.5, -1.1, 0.8];
  var all = [];
  var currentPlace = "全部";

  fetch("/json/essays.json?t=" + Date.now())
    .then(function (r) {
      if (!r.ok) throw new Error(r.status);
      return r.json();
    })
    .then(function (list) {
      all = (list || []).sort(function (a, b) {
        return (b.date || "").localeCompare(a.date || "");
      });
      buildFilters();
      render();
    })
    .catch(function () {
      wall.innerHTML = "";
      if (empty) empty.hidden = false;
      if (stats) stats.textContent = "随笔数据加载失败，刷新试试？";
    });

  function buildFilters() {
    if (!filters) return;
    var places = [];
    all.forEach(function (e) {
      var p = e.place || "未知";
      if (places.indexOf(p) === -1) places.push(p);
    });
    var html = chip("全部") + places.map(chip).join("");
    filters.innerHTML = html;
    filters.addEventListener("click", function (ev) {
      var btn = ev.target.closest(".essay-chip");
      if (!btn) return;
      currentPlace = btn.dataset.place;
      render();
      var act = filters.querySelector(".active");
      if (act) act.classList.remove("active");
      btn.classList.add("active");
    });
  }

  function chip(place) {
    var active = place === currentPlace ? " active" : "";
    return (
      '<button class="essay-chip' + active + '" data-place="' + esc(place) + '">' +
      esc(place) + "</button>"
    );
  }

  function render() {
    var list = all.filter(function (e) {
      return currentPlace === "全部" || (e.place || "未知") === currentPlace;
    });
    if (stats) {
      var places = {};
      all.forEach(function (e) {
        places[e.place || "未知"] = 1;
      });
      stats.innerHTML =
        "已经捡到 <b>" + all.length + "</b> 张碎片，来自 <b>" +
        Object.keys(places).length + "</b> 个地方";
    }
    if (!list.length) {
      wall.innerHTML = "";
      if (empty) empty.hidden = false;
      return;
    }
    if (empty) empty.hidden = true;
    wall.innerHTML = list
      .map(function (e, i) {
        return (
          '<article class="essay-card" style="--rot:' + ROT[i % ROT.length] + 'deg">' +
          '<div class="essay-card-meta">' +
          '<span class="essay-place">📍 ' + esc(e.place || "未知") + "</span>" +
          "<span>" + esc(e.date || "") + "</span>" +
          "</div>" +
          '<p class="essay-content">' + esc(e.content || "") + "</p>" +
          '<div class="essay-author">—— ' + esc(e.author || "佚名") + "</div>" +
          "</article>"
        );
      })
      .join("");
  }

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
})();
