(function() {
  var menuButton = document.querySelector(".menu-toggle");
  var mobileMenu = document.querySelector(".mobile-menu");

  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", function() {
      var opened = mobileMenu.classList.toggle("is-open");
      menuButton.classList.toggle("is-open", opened);
      menuButton.setAttribute("aria-expanded", opened ? "true" : "false");
    });
  }

  var hero = document.querySelector("[data-hero-slider]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function startTimer() {
      timer = window.setInterval(function() {
        showSlide(current + 1);
      }, 5200);
    }

    function resetTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
      startTimer();
    }

    if (prev) {
      prev.addEventListener("click", function() {
        showSlide(current - 1);
        resetTimer();
      });
    }
    if (next) {
      next.addEventListener("click", function() {
        showSlide(current + 1);
        resetTimer();
      });
    }
    dots.forEach(function(dot) {
      dot.addEventListener("click", function() {
        showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
        resetTimer();
      });
    });
    showSlide(0);
    startTimer();
  }

  var filterPanel = document.querySelector("[data-filter-panel]");
  if (filterPanel) {
    var filterInput = filterPanel.querySelector("[data-filter-input]");
    var filterYear = filterPanel.querySelector("[data-filter-year]");
    var filterType = filterPanel.querySelector("[data-filter-type]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-list .movie-card"));
    var emptyState = document.querySelector("[data-empty-state]");

    function applyFilter() {
      var keyword = filterInput ? filterInput.value.trim().toLowerCase() : "";
      var year = filterYear ? filterYear.value : "";
      var type = filterType ? filterType.value : "";
      var shown = 0;

      cards.forEach(function(card) {
        var text = (card.getAttribute("data-text") || "").toLowerCase();
        var cardTitle = (card.getAttribute("data-title") || "").toLowerCase();
        var cardYear = card.getAttribute("data-year") || "";
        var cardType = card.getAttribute("data-type") || "";
        var matched = (!keyword || text.indexOf(keyword) !== -1 || cardTitle.indexOf(keyword) !== -1) && (!year || cardYear === year) && (!type || cardType === type);
        card.hidden = !matched;
        if (matched) {
          shown += 1;
        }
      });

      if (emptyState) {
        emptyState.hidden = shown !== 0;
      }
    }

    [filterInput, filterYear, filterType].forEach(function(element) {
      if (element) {
        element.addEventListener("input", applyFilter);
        element.addEventListener("change", applyFilter);
      }
    });
  }

  var searchResults = document.querySelector("[data-search-results]");
  if (searchResults && Array.isArray(window.siteSearchIndex)) {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    var input = document.querySelector(".search-page-form input[name='q']");
    var counter = document.querySelector("[data-search-count]");
    var empty = document.querySelector("[data-search-empty]");

    if (input) {
      input.value = query;
    }

    function cardTemplate(item) {
      var tags = Array.isArray(item.tags) ? item.tags.join(" ") : "";
      return "<a class="movie-card" href="" + item.href + "" data-text="" + escapeHtml(item.title + " " + item.region + " " + item.type + " " + item.genre + " " + tags) + "">" +
        "<div class="poster-wrap"><img src="" + item.cover + "" alt="" + escapeHtml(item.title) + " 在线观看" loading="lazy"><span class="poster-chip">" + escapeHtml(item.year) + "</span><span class="play-pill">▶</span></div>" +
        "<div class="movie-card-body"><h3>" + escapeHtml(item.title) + "</h3><p>" + escapeHtml(item.oneLine || "") + "</p><div class="movie-meta-line"><span>" + escapeHtml(item.region) + "</span><span>" + escapeHtml(item.type) + "</span><span>" + escapeHtml(item.rating) + "</span></div></div>" +
        "</a>";
    }

    function escapeHtml(value) {
      return String(value).replace(/[&<>"']/g, function(character) {
        return {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          """: "&quot;",
          "'": "&#39;"
        }[character];
      });
    }

    var normalized = query.toLowerCase();
    var matched = window.siteSearchIndex.filter(function(item) {
      var text = [item.title, item.region, item.type, item.year, item.genre, item.oneLine, (item.tags || []).join(" ")].join(" ").toLowerCase();
      return normalized && text.indexOf(normalized) !== -1;
    }).slice(0, 120);

    searchResults.innerHTML = matched.map(cardTemplate).join("");
    if (counter) {
      counter.textContent = query ? "已显示相关结果" : "请输入关键词";
    }
    if (empty) {
      empty.hidden = !query || matched.length > 0;
    }
  }
}());
