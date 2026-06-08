(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('open');
    });
  }

  document.querySelectorAll('img').forEach(function (image) {
    image.addEventListener('error', function () {
      image.classList.add('is-missing');
      image.removeAttribute('src');
    });
  });

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;

    function showSlide(next) {
      if (!slides.length) return;
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }
  }

  var filterInput = document.querySelector('[data-local-filter]');
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-value]'));
  var clearButton = document.querySelector('[data-filter-clear]');

  function applyFilter(extra) {
    var query = filterInput ? filterInput.value.trim().toLowerCase() : '';
    var selected = extra || '';
    document.querySelectorAll('.movie-card').forEach(function (card) {
      var data = (card.getAttribute('data-search') || '').toLowerCase();
      var matched = (!query || data.indexOf(query) !== -1) && (!selected || data.indexOf(selected.toLowerCase()) !== -1);
      card.hidden = !matched;
    });
  }

  if (filterInput) {
    var currentFilter = '';
    filterInput.addEventListener('input', function () {
      applyFilter(currentFilter);
    });

    filterButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        var value = button.getAttribute('data-filter-value') || '';
        currentFilter = currentFilter === value ? '' : value;
        filterButtons.forEach(function (item) {
          item.classList.toggle('active', item === button && currentFilter);
        });
        applyFilter(currentFilter);
      });
    });

    if (clearButton) {
      clearButton.addEventListener('click', function () {
        currentFilter = '';
        filterInput.value = '';
        filterButtons.forEach(function (item) {
          item.classList.remove('active');
        });
        applyFilter('');
      });
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (query) {
      filterInput.value = query;
      applyFilter('');
    }
  }

  var player = document.querySelector('[data-player]');
  var configNode = document.getElementById('player-config');
  var hlsPromise = null;

  function loadHlsLibrary() {
    if (window.Hls) return Promise.resolve();
    if (hlsPromise) return hlsPromise;
    var urls = [
      'https://cdn.jsdelivr.net/npm/hls.js@1.6.15/dist/hls.min.js',
      'https://unpkg.com/hls.js@1.6.15/dist/hls.min.js'
    ];
    var cursor = 0;
    hlsPromise = new Promise(function (resolve, reject) {
      function next() {
        if (cursor >= urls.length) {
          reject(new Error('hls'));
          return;
        }
        var script = document.createElement('script');
        script.src = urls[cursor];
        cursor += 1;
        script.onload = function () { resolve(); };
        script.onerror = next;
        document.head.appendChild(script);
      }
      next();
    });
    return hlsPromise;
  }

  function setupStream(video, url) {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      return Promise.resolve();
    }

    return loadHlsLibrary().then(function () {
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (_, data) {
          if (!data.fatal) return;
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
          }
        });
      } else {
        video.src = url;
      }
    }).catch(function () {
      video.src = url;
    });
  }

  if (player && configNode) {
    var config = JSON.parse(configNode.textContent || '{}');
    var video = player.querySelector('video');
    var cover = player.querySelector('.player-cover');
    var started = false;

    function start() {
      if (!video || !config.url) return;
      if (cover) cover.classList.add('is-hidden');
      if (started) {
        video.play().catch(function () {});
        return;
      }
      started = true;
      setupStream(video, config.url).then(function () {
        video.play().catch(function () {});
      });
    }

    if (cover) cover.addEventListener('click', start);
    if (video) {
      video.addEventListener('click', function () {
        if (!started) start();
      });
    }
  }
})();
