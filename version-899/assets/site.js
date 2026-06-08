(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    var toggle = qs('.nav-toggle');
    var menu = qs('.nav-menu');
    var headerSearch = qs('.header-search');

    if (toggle && menu) {
        toggle.addEventListener('click', function () {
            menu.classList.toggle('open');
            if (headerSearch) {
                headerSearch.classList.toggle('open');
            }
        });
    }

    var slides = qsa('.hero-slide');
    var dots = qsa('.hero-dot');
    var activeSlide = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        activeSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle('active', i === activeSlide);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle('active', i === activeSlide);
        });
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            showSlide(parseInt(dot.getAttribute('data-slide'), 10) || 0);
        });
    });

    if (slides.length > 1) {
        window.setInterval(function () {
            showSlide(activeSlide + 1);
        }, 5200);
    }

    qsa('.filter-panel').forEach(function (panel) {
        var input = qs('.js-card-search', panel);
        var year = qs('.js-year-filter', panel);
        var list = qs('.js-card-list');
        var empty = qs('.js-empty-state');
        if (!list) {
            return;
        }

        function applyFilter() {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            var selectedYear = year ? year.value : '';
            var visible = 0;
            qsa('.movie-card', list).forEach(function (card) {
                var haystack = [
                    card.getAttribute('data-title') || '',
                    card.getAttribute('data-tags') || '',
                    card.textContent || ''
                ].join(' ').toLowerCase();
                var cardYear = card.getAttribute('data-year') || '';
                var matched = (!keyword || haystack.indexOf(keyword) !== -1) && (!selectedYear || selectedYear === cardYear);
                card.style.display = matched ? '' : 'none';
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('visible', visible === 0);
            }
        }

        if (input) {
            input.addEventListener('input', applyFilter);
        }
        if (year) {
            year.addEventListener('change', applyFilter);
        }
    });

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"']/g, function (item) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[item];
        });
    }

    function renderSearchResults(keyword) {
        var container = qs('.js-search-results');
        var empty = qs('.js-search-empty');
        var input = qs('.js-search-page-input');
        if (!container || !window.SITE_MOVIE_INDEX) {
            return;
        }
        if (input) {
            input.value = keyword;
        }
        var normalized = keyword.trim().toLowerCase();
        container.innerHTML = '';
        if (!normalized) {
            if (empty) {
                empty.textContent = '请输入关键词查找影片';
                empty.classList.add('visible');
            }
            return;
        }
        var results = window.SITE_MOVIE_INDEX.filter(function (movie) {
            var haystack = [movie.title, movie.year, movie.region, movie.type, movie.genre, movie.category, (movie.tags || []).join(' ')].join(' ').toLowerCase();
            return haystack.indexOf(normalized) !== -1;
        }).slice(0, 120);
        if (!results.length) {
            if (empty) {
                empty.textContent = '没有找到匹配影片';
                empty.classList.add('visible');
            }
            return;
        }
        if (empty) {
            empty.classList.remove('visible');
        }
        container.innerHTML = results.map(function (movie) {
            return [
                '<article class="movie-card">',
                '<a class="poster-link" href="./' + escapeHtml(movie.file) + '">',
                '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
                '<span class="poster-badge">' + escapeHtml(movie.year) + '</span>',
                '<span class="poster-play">▶</span>',
                '</a>',
                '<div class="card-body">',
                '<h2><a href="./' + escapeHtml(movie.file) + '">' + escapeHtml(movie.title) + '</a></h2>',
                '<p>' + escapeHtml(movie.oneLine) + '</p>',
                '<div class="meta-line"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.category) + '</span></div>',
                '</div>',
                '</article>'
            ].join('');
        }).join('');
    }

    if (qs('.js-search-results')) {
        var params = new URLSearchParams(window.location.search);
        renderSearchResults(params.get('q') || '');
    }
})();
