(function () {
    function attachStream(video, stream) {
        if (video.dataset.ready === 'true') {
            return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream;
            video.dataset.ready = 'true';
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(stream);
            hls.attachMedia(video);
            video._hls = hls;
            video.dataset.ready = 'true';
            return;
        }
        video.src = stream;
        video.dataset.ready = 'true';
    }

    function startPlayer(shell) {
        var video = shell.querySelector('.js-video');
        var cover = shell.querySelector('.js-play-button');
        var stream = shell.getAttribute('data-stream');
        if (!video || !stream) {
            return;
        }
        attachStream(video, stream);
        if (cover) {
            cover.classList.add('is-hidden');
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {});
        }
    }

    document.querySelectorAll('.js-player').forEach(function (shell) {
        var video = shell.querySelector('.js-video');
        var cover = shell.querySelector('.js-play-button');
        if (cover) {
            cover.addEventListener('click', function () {
                startPlayer(shell);
            });
        }
        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    startPlayer(shell);
                }
            });
            video.addEventListener('play', function () {
                if (cover) {
                    cover.classList.add('is-hidden');
                }
            });
        }
    });
})();
