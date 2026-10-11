document.querySelectorAll('[data-video-gallery]').forEach((section) => {
  const assetFolder = `assets/${section.dataset.videoGallery}`;
  const videoLabel = section.dataset.videoLabel;
  const player = section.querySelector('.comparison-player');
  const video = section.querySelector('video');
  const cover = section.querySelector('.comparison-cover');
  const playButton = section.querySelector('[data-playback]');
  const fullscreen = section.querySelector('[data-fullscreen]');
  const seek = section.querySelector('.comparison-seek');
  const defaultDuration = Number(seek.max);
  const time = section.querySelector('.comparison-time');
  const status = section.querySelector('.comparison-status');
  const tabs = [...section.querySelectorAll('[role="tab"]')];
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let selected = tabs[0];
  let inView = false;
  let wantsPlayback = !motion.matches && !navigator.connection?.saveData;
  let revision = 0;
  let pendingSeek = null;

  const formatTime = (seconds) => `0:${String(Math.floor(seconds || 0)).padStart(2, '0')}`;

  function updateControls() {
    const label = video.paused ? 'Play' : 'Pause';
    playButton.setAttribute('aria-label', `${label} ${videoLabel} video`);
    playButton.dataset.tooltip = label;
    playButton.querySelector('use').setAttribute('href', `assets/icons.svg#${label.toLowerCase()}`);
  }

  function updateTime() {
    const duration = Number.isFinite(video.duration) ? video.duration : defaultDuration;
    const position = pendingSeek ?? video.currentTime;
    seek.max = duration;
    seek.value = position;
    seek.style.setProperty('--played', `${duration ? position / duration * 100 : 0}%`);
    seek.setAttribute('aria-valuetext', `${formatTime(position)} of ${formatTime(duration)}`);
    time.textContent = `${formatTime(position)} / ${formatTime(duration)}`;
  }

  function ensureSource() {
    if (!video.getAttribute('src')) {
      video.src = `${assetFolder}/${selected.dataset.case}.mp4`;
      video.load();
    }
  }

  async function playCurrent() {
    if (!inView || document.hidden || !wantsPlayback) return;
    ensureSource();
    const currentRevision = revision;
    try {
      await video.play();
      if (currentRevision === revision && (!inView || document.hidden || !wantsPlayback)) video.pause();
    } catch {
      if (currentRevision === revision) updateControls();
    }
  }

  function selectCase(tab) {
    if (selected === tab) return;
    revision += 1;
    video.pause();
    selected = tab;
    pendingSeek = null;
    tabs.forEach((item) => {
      item.setAttribute('aria-selected', String(item === tab));
      item.tabIndex = item === tab ? 0 : -1;
    });
    player.setAttribute('aria-labelledby', tab.id);
    video.setAttribute('aria-label', `${tab.dataset.label}: ${section.dataset.videoDescription}`);
    cover.hidden = false;
    cover.src = `${assetFolder}/${tab.dataset.case}-poster.webp`;
    video.poster = cover.src;
    video.removeAttribute('src');
    video.load();
    status.hidden = true;
    updateTime();
    updateControls();
    playCurrent();
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectCase(tab));
    tab.addEventListener('keydown', (event) => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next === undefined) return;
      event.preventDefault();
      tabs[next].focus();
      selectCase(tabs[next]);
    });
  });

  playButton.addEventListener('click', () => {
    wantsPlayback = video.paused;
    if (wantsPlayback) {
      inView = true;
      status.hidden = true;
      if (video.error) {
        video.removeAttribute('src');
        video.load();
      }
      playCurrent();
    } else video.pause();
  });
  video.addEventListener('click', () => playButton.click());
  video.addEventListener('play', updateControls);
  video.addEventListener('pause', updateControls);
  video.addEventListener('timeupdate', updateTime);
  video.addEventListener('loadedmetadata', () => {
    if (pendingSeek !== null) {
      video.currentTime = pendingSeek;
      pendingSeek = null;
    }
    updateTime();
  });
  video.addEventListener('loadeddata', () => { cover.hidden = true; });
  video.addEventListener('error', () => {
    status.textContent = 'Video could not load. Press play to retry.';
    status.hidden = false;
    cover.hidden = false;
    updateControls();
  });
  seek.addEventListener('input', () => {
    const position = Number(seek.value);
    ensureSource();
    if (video.readyState >= 1) video.currentTime = position;
    else pendingSeek = position;
    updateTime();
  });

  fullscreen.addEventListener('click', async () => {
    ensureSource();
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (player.requestFullscreen) await player.requestFullscreen();
      else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen();
    } catch { /* Playback remains available when fullscreen is not supported. */ }
  });
  if (!document.fullscreenEnabled && !video.webkitEnterFullscreen) fullscreen.hidden = true;
  document.addEventListener('fullscreenchange', () => {
    const active = document.fullscreenElement === player;
    fullscreen.setAttribute('aria-label', active ? 'Exit full screen' : `Full screen ${videoLabel}`);
    fullscreen.dataset.tooltip = active ? 'Exit full screen' : 'Full screen';
    if (active) { inView = true; playCurrent(); }
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) video.pause();
    else playCurrent();
  });
  motion.addEventListener('change', () => {
    if (motion.matches) { wantsPlayback = false; video.pause(); }
  });
  video.muted = true;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting && entry.intersectionRatio >= 0.15;
      if (inView) playCurrent();
      else video.pause();
    }, { threshold: [0, 0.15] }).observe(player);
  } else { inView = true; playCurrent(); }
});
