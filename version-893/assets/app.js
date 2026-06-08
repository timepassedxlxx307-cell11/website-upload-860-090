(function () {
  var mobileToggle = document.querySelector('[data-mobile-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (mobileToggle && mobilePanel) {
    mobileToggle.addEventListener('click', function () {
      mobilePanel.classList.toggle('active');
    });
  }

  document.querySelectorAll('[data-hero-slider]').forEach(function (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function start() {
      if (slides.length < 2) {
        return;
      }
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  document.querySelectorAll('[data-list-toolbar]').forEach(function (toolbar) {
    var searchInput = toolbar.querySelector('[data-local-search]');
    var grid = document.querySelector('[data-sortable-grid]');
    var buttons = Array.prototype.slice.call(toolbar.querySelectorAll('[data-sort]'));

    function filterCards() {
      if (!grid) {
        return;
      }
      var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
      Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]')).forEach(function (card) {
        var text = card.textContent.toLowerCase();
        card.classList.toggle('is-filtered-out', query && text.indexOf(query) === -1);
      });
    }

    function sortCards(type) {
      if (!grid) {
        return;
      }
      var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]'));
      cards.sort(function (a, b) {
        var av = Number(a.getAttribute('data-' + type)) || 0;
        var bv = Number(b.getAttribute('data-' + type)) || 0;
        return bv - av;
      });
      cards.forEach(function (card) {
        grid.appendChild(card);
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', filterCards);
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        buttons.forEach(function (item) {
          item.classList.remove('active');
        });
        button.classList.add('active');
        sortCards(button.getAttribute('data-sort'));
        filterCards();
      });
    });
  });

  var searchGrid = document.querySelector('[data-search-grid]');
  var searchInput = document.querySelector('[data-search-input]');
  var searchTitle = document.querySelector('[data-search-title]');

  if (searchGrid && searchInput) {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    searchInput.value = initialQuery;

    function applySearch() {
      var query = searchInput.value.trim().toLowerCase();
      Array.prototype.slice.call(searchGrid.querySelectorAll('[data-movie-card]')).forEach(function (card) {
        var text = card.textContent.toLowerCase();
        card.classList.toggle('is-filtered-out', query && text.indexOf(query) === -1);
      });
      if (searchTitle) {
        searchTitle.textContent = query ? '搜索结果：' + searchInput.value.trim() : '精选影片';
      }
    }

    searchInput.addEventListener('input', applySearch);
    applySearch();
  }
})();
