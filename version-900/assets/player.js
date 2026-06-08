var playerModules = Array.prototype.slice.call(document.querySelectorAll('.movie-player'));
var hlsLoader = null;

function getHlsClass() {
  if (!hlsLoader) {
    hlsLoader = import('./hls-vendor-dru42stk.js')
      .then(function (module) {
        return module.H;
      })
      .catch(function () {
        return null;
      });
  }

  return hlsLoader;
}

playerModules.forEach(function (player) {
  var video = player.querySelector('video');
  var cover = player.querySelector('.player-cover');
  var state = player.querySelector('.player-state');
  var stream = player.getAttribute('data-stream');
  var attached = false;
  var hls = null;

  function setState(text) {
    if (state) {
      state.textContent = text || '';
    }
  }

  function attachStream() {
    if (attached || !video || !stream) {
      return Promise.resolve();
    }

    attached = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      return Promise.resolve();
    }

    return getHlsClass().then(function (HlsClass) {
      if (HlsClass && HlsClass.isSupported()) {
        hls = new HlsClass();
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
    });
  }

  function startPlayback() {
    if (!video) {
      return;
    }

    setState('正在加载');
    attachStream().then(function () {
      player.classList.add('is-ready');
      var playResult = video.play();

      if (playResult && typeof playResult.then === 'function') {
        playResult.then(function () {
          setState('');
        }).catch(function () {
          setState('点击视频继续播放');
        });
      } else {
        setState('');
      }
    }).catch(function () {
      attached = false;
      setState('播放暂时无法加载');
    });
  }

  if (cover) {
    cover.addEventListener('click', startPlayback);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      }
    });

    video.addEventListener('play', function () {
      player.classList.add('is-ready');
      setState('');
    });
  }

  window.addEventListener('beforeunload', function () {
    if (hls && typeof hls.destroy === 'function') {
      hls.destroy();
    }
  });
});
