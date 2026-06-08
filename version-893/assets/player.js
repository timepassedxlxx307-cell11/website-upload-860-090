(function () {
  window.initMoviePlayer = function (videoId, layerId, streamUrl) {
    var video = document.getElementById(videoId);
    var layer = document.getElementById(layerId);
    var hlsInstance = null;
    var prepared = false;

    if (!video || !layer || !streamUrl) {
      return;
    }

    function prepare() {
      if (prepared) {
        return Promise.resolve();
      }
      prepared = true;

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
        return new Promise(function (resolve) {
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            resolve();
          });
          hlsInstance.on(window.Hls.Events.ERROR, function () {
            resolve();
          });
        });
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else {
        video.src = streamUrl;
      }

      return Promise.resolve();
    }

    function play() {
      layer.classList.add('is-hidden');
      prepare().then(function () {
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            layer.classList.remove('is-hidden');
          });
        }
      });
    }

    layer.addEventListener('click', play);
    video.addEventListener('play', function () {
      layer.classList.add('is-hidden');
    });
    video.addEventListener('pause', function () {
      if (!video.ended && video.currentTime === 0) {
        layer.classList.remove('is-hidden');
      }
    });
    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  };
})();
