(() => {
  document.querySelectorAll('[data-resource]').forEach((link) => {
    const url = window.UNIFORGE_LINKS?.[link.dataset.resource]?.trim();
    if (url) {
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.removeAttribute('aria-disabled');
      link.removeAttribute('aria-describedby');
      link.closest('.resource-slot').classList.add('is-linked');
    } else {
      link.addEventListener('click', (event) => event.preventDefault());
      link.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') event.preventDefault();
      });
    }
  });

  const video = document.querySelector('#teaser-video');
  const playback = document.querySelector('#playback');
  const fullScreen = document.querySelector('#fullscreen');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const compact = window.matchMedia('(max-width: 900px)').matches || navigator.connection?.saveData;

  function syncPlayback() {
    const state = video.ended ? ['Replay', 'rotate-ccw'] : video.paused ? ['Play', 'play'] : ['Pause', 'pause'];
    playback.setAttribute('aria-label', `${state[0]} video`);
    playback.dataset.tooltip = state[0];
    playback.querySelector('use').setAttribute('href', `assets/icons.svg#${state[1]}`);
  }

  playback.addEventListener('click', async () => {
    if (!video.paused && !video.ended) {
      video.pause();
      return;
    }
    if (video.ended) video.currentTime = 0;
    try { await video.play(); } catch { syncPlayback(); }
  });
  ['play', 'pause', 'ended', 'loadedmetadata'].forEach((event) => video.addEventListener(event, syncPlayback));
  fullScreen.addEventListener('click', async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (video.closest('figure').requestFullscreen) await video.closest('figure').requestFullscreen();
      else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen();
    } catch { /* Keep normal playback available when fullscreen is unavailable. */ }
  });
  if (!document.fullscreenEnabled && !video.webkitEnterFullscreen) fullScreen.hidden = true;
  video.addEventListener('error', () => {
    video.poster = 'assets/poster-settled.webp';
    document.querySelector('.video-controls').hidden = true;
  });

  video.muted = true;
  video.loop = false;
  video.autoplay = !reducedMotion;
  video.preload = reducedMotion ? 'metadata' : 'auto';
  video.poster = reducedMotion ? 'assets/poster-settled.webp' : 'assets/poster-start.webp';
  video.src = compact ? 'assets/teaser-1200.mp4' : 'assets/teaser-1800.mp4';
  document.querySelector('.video-controls').hidden = false;
  if (!reducedMotion) video.play().catch(syncPlayback);
})();
