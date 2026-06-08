(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function openSearchPage(value) {
    var keyword = String(value || "").trim();
    var target = "search.html";
    if (keyword) {
      target += "?q=" + encodeURIComponent(keyword);
    }
    window.location.href = target;
  }

  function initHeader() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        nav.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", nav.classList.contains("is-open") ? "true" : "false");
      });
    }

    document.querySelectorAll("[data-site-search]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input");
        openSearchPage(input ? input.value : "");
      });
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector(".hero-prev");
    var next = hero.querySelector(".hero-next");
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initFilters() {
    var panel = document.querySelector("[data-filter-panel]");
    if (!panel) {
      return;
    }
    var keywordInput = panel.querySelector("[data-filter-keyword]");
    var typeSelect = panel.querySelector("[data-filter-type]");
    var yearSelect = panel.querySelector("[data-filter-year]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));

    function run() {
      var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : "";
      var typeValue = typeSelect ? typeSelect.value : "";
      var yearValue = yearSelect ? yearSelect.value : "";
      cards.forEach(function (card) {
        var text = String(card.getAttribute("data-search") || "").toLowerCase();
        var type = card.getAttribute("data-type") || "";
        var year = card.getAttribute("data-year") || "";
        var ok = true;
        if (keyword && text.indexOf(keyword) === -1) {
          ok = false;
        }
        if (typeValue && type !== typeValue) {
          ok = false;
        }
        if (yearValue && year !== yearValue) {
          ok = false;
        }
        card.classList.toggle("is-hidden-card", !ok);
      });
    }

    [keywordInput, typeSelect, yearSelect].forEach(function (element) {
      if (element) {
        element.addEventListener("input", run);
        element.addEventListener("change", run);
      }
    });
    run();
  }

  function initSearchPage() {
    var input = document.querySelector("[data-search-input]");
    var results = document.querySelector("[data-search-results]");
    if (!input || !results || !window.SEARCH_DATA) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    input.value = initial;

    function render() {
      var keyword = input.value.trim().toLowerCase();
      var data = window.SEARCH_DATA || [];
      var matches = data.filter(function (item) {
        var text = [item.title, item.oneLine, item.region, item.type, item.year, item.category, (item.tags || []).join(" ")].join(" ").toLowerCase();
        return !keyword || text.indexOf(keyword) !== -1;
      }).slice(0, 80);
      results.innerHTML = matches.map(function (item) {
        return '<a class="search-result-card" href="' + escapeHtml(item.url) + '">' +
          '<img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
          '<span>' +
          '<h2>' + escapeHtml(item.title) + '</h2>' +
          '<p>' + escapeHtml(item.oneLine) + '</p>' +
          '<span class="tag-list">' +
          '<span class="tag">' + escapeHtml(item.year) + '</span>' +
          '<span class="tag">' + escapeHtml(item.region) + '</span>' +
          '<span class="tag">' + escapeHtml(item.type) + '</span>' +
          '</span>' +
          '</span>' +
          '</a>';
      }).join("");
    }

    input.addEventListener("input", render);
    render();
  }

  window.initVideoPlayer = function (source, videoId, coverId) {
    var video = document.getElementById(videoId || "video-player");
    var cover = document.getElementById(coverId || "player-cover");
    if (!video) {
      return;
    }
    var loaded = false;

    function play() {
      if (!loaded) {
        loaded = true;
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
        } else {
          video.src = source;
        }
      }
      if (cover) {
        cover.classList.add("is-hidden");
      }
      video.controls = true;
      video.play().catch(function () {});
    }

    if (cover) {
      cover.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
  };

  ready(function () {
    initHeader();
    initHero();
    initFilters();
    initSearchPage();
  });
})();
