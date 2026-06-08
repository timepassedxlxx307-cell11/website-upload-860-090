(function () {
    var header = document.querySelector(".site-header");
    var menuToggle = document.querySelector("[data-menu-toggle]");

    if (header && menuToggle) {
        menuToggle.addEventListener("click", function () {
            header.classList.toggle("is-open");
        });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var current = 0;
        var timer = null;

        function showSlide(index) {
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

        function startHero() {
            stopHero();
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        function stopHero() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                var index = parseInt(dot.getAttribute("data-hero-dot"), 10);
                showSlide(index);
                startHero();
            });
        });

        hero.addEventListener("mouseenter", stopHero);
        hero.addEventListener("mouseleave", startHero);
        showSlide(0);
        startHero();
    }

    Array.prototype.slice.call(document.querySelectorAll("[data-filter-area]")).forEach(function (area) {
        var list = area.parentElement.querySelector("[data-card-list]");
        var search = area.querySelector("[data-card-search]");
        var year = area.querySelector("[data-year-filter]");
        var genre = area.querySelector("[data-genre-filter]");
        var empty = area.parentElement.querySelector("[data-empty-state]");

        if (!list) {
            return;
        }

        var cards = Array.prototype.slice.call(list.children);

        function normalize(value) {
            return String(value || "").trim().toLowerCase();
        }

        function runFilter() {
            var query = normalize(search ? search.value : "");
            var yearValue = normalize(year ? year.value : "");
            var genreValue = normalize(genre ? genre.value : "");
            var visible = 0;

            cards.forEach(function (card) {
                var text = normalize(card.textContent + " " + Array.prototype.slice.call(card.attributes).map(function (attr) {
                    return attr.value;
                }).join(" "));
                var passQuery = !query || text.indexOf(query) !== -1;
                var passYear = !yearValue || normalize(card.getAttribute("data-year")) === yearValue;
                var passGenre = !genreValue || text.indexOf(genreValue) !== -1;
                var pass = passQuery && passYear && passGenre;

                card.hidden = !pass;

                if (pass) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        [search, year, genre].forEach(function (control) {
            if (control) {
                control.addEventListener("input", runFilter);
                control.addEventListener("change", runFilter);
            }
        });

        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q");

        if (search && initial) {
            search.value = initial;
        }

        runFilter();
    });

    Array.prototype.slice.call(document.querySelectorAll(".player-shell")).forEach(function (shell) {
        var video = shell.querySelector("video");
        var cover = shell.querySelector(".player-cover");
        var url = shell.getAttribute("data-hls");
        var loaded = false;
        var hls = null;

        if (!video || !url) {
            return;
        }

        function loadVideo() {
            if (loaded) {
                return;
            }

            loaded = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = url;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(url);
                hls.attachMedia(video);
            } else {
                video.src = url;
            }
        }

        function startVideo() {
            loadVideo();
            shell.classList.add("is-playing");
            var playPromise = video.play();

            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {});
            }
        }

        if (cover) {
            cover.addEventListener("click", startVideo);
        }

        video.addEventListener("click", function () {
            if (!loaded || video.paused) {
                startVideo();
            }
        });

        video.addEventListener("play", function () {
            shell.classList.add("is-playing");
        });

        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    });
})();
