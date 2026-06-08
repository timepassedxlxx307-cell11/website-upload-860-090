(function() {
    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function getQuery(name) {
        var params = new URLSearchParams(window.location.search);
        return params.get(name) || "";
    }

    function initMobileMenu() {
        var toggle = document.querySelector(".js-mobile-toggle");
        var panel = document.querySelector(".js-mobile-panel");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function() {
            panel.classList.toggle("is-open");
        });
    }

    function initGlobalSearch() {
        document.querySelectorAll(".js-global-search").forEach(function(form) {
            form.addEventListener("submit", function(event) {
                event.preventDefault();
                var input = form.querySelector("input[name='q']");
                var value = input ? input.value.trim() : "";
                var target = form.getAttribute("action") || "./search.html";
                window.location.href = target + (value ? "?q=" + encodeURIComponent(value) : "");
            });
        });
    }

    function initFilters() {
        var list = document.querySelector(".js-filter-list");
        var scope = document.querySelector(".js-filter-scope");
        if (!list || !scope) {
            return;
        }
        var input = scope.querySelector(".js-filter-input");
        var year = scope.querySelector(".js-filter-year");
        var genre = scope.querySelector(".js-filter-genre");
        var cards = Array.prototype.slice.call(list.querySelectorAll("[data-title]"));
        var query = getQuery("q");
        if (input && query) {
            input.value = query;
        }
        function apply() {
            var keyword = normalize(input ? input.value : "");
            var selectedYear = normalize(year ? year.value : "");
            var selectedGenre = normalize(genre ? genre.value : "");
            cards.forEach(function(card) {
                var haystack = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-tags")
                ].join(" "));
                var yearValue = normalize(card.getAttribute("data-year"));
                var genreValue = normalize(card.getAttribute("data-genre") + " " + card.getAttribute("data-tags"));
                var visible = (!keyword || haystack.indexOf(keyword) !== -1) && (!selectedYear || yearValue === selectedYear) && (!selectedGenre || genreValue.indexOf(selectedGenre) !== -1);
                card.classList.toggle("is-filter-hidden", !visible);
            });
        }
        [input, year, genre].forEach(function(el) {
            if (el) {
                el.addEventListener("input", apply);
                el.addEventListener("change", apply);
            }
        });
        apply();
    }

    function initHero() {
        var carousel = document.querySelector(".js-hero-carousel");
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
        var controls = Array.prototype.slice.call(carousel.querySelectorAll(".hero-control"));
        if (!slides.length) {
            return;
        }
        var current = 0;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function(slide, i) {
                slide.classList.toggle("is-active", i === current);
            });
            dots.forEach(function(dot, i) {
                dot.classList.toggle("is-active", i === current);
            });
        }
        dots.forEach(function(dot) {
            dot.addEventListener("click", function() {
                show(Number(dot.getAttribute("data-slide") || 0));
            });
        });
        controls.forEach(function(btn) {
            btn.addEventListener("click", function() {
                show(current + (btn.getAttribute("data-dir") === "next" ? 1 : -1));
            });
        });
        window.setInterval(function() {
            show(current + 1);
        }, 5000);
    }

    function initImageFallback() {
        document.querySelectorAll("img").forEach(function(img) {
            img.addEventListener("error", function() {
                img.classList.add("image-missing");
            });
        });
    }

    window.initMoviePlayer = function(videoUrl) {
        var video = document.querySelector(".js-video");
        var overlay = document.querySelector(".js-play-overlay");
        var hlsInstance = null;
        if (!video || !videoUrl) {
            return;
        }
        function attach() {
            if (video.getAttribute("src") || hlsInstance) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = videoUrl;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls();
                hlsInstance.loadSource(videoUrl);
                hlsInstance.attachMedia(video);
                return;
            }
            video.src = videoUrl;
        }
        function play() {
            attach();
            video.setAttribute("controls", "controls");
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function() {});
            }
        }
        if (overlay) {
            overlay.addEventListener("click", play);
        }
        video.addEventListener("click", function() {
            if (video.paused) {
                play();
            }
        });
    };

    document.addEventListener("DOMContentLoaded", function() {
        initMobileMenu();
        initGlobalSearch();
        initFilters();
        initHero();
        initImageFallback();
    });
})();
