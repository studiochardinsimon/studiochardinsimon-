(() => {
  const pages = [...document.querySelectorAll('.page')];
  const slidesRoot = document.getElementById('slides');
  const counter = document.getElementById('counter');
  const aboutToggle = document.getElementById('about-toggle');
  const about = document.getElementById('about');
  const home = document.getElementById('home');
  const contact = document.getElementById('contact');
  const items = window.PORTFOLIO || [];
  let index = 0, timer = null, soundEnabled = false;
  const soundButton = document.getElementById('sound-toggle');
  const nodes = items.map((item, i) => {
    const el = document.createElement('div');
    el.className = 'slide';
    el.setAttribute('aria-hidden', 'true');
    const media = document.createElement(item.type === 'video' ? 'video' : 'img');
    media.src = item.src;
    if (item.type === 'video') {
      media.muted = true; media.playsInline = true; media.preload = i === 0 ? 'auto' : 'metadata';
      if (item.poster) media.poster = item.poster;
      media.addEventListener('ended', next);
    } else {
      media.alt = item.alt || '';
      media.loading = i < 2 ? 'eager' : 'lazy';
    }
    el.append(media); slidesRoot.append(el); return el;
  });
  function stop() {
  clearTimeout(timer);
  timer = null;

  nodes.forEach(n => {
    const v = n.querySelector('video');
    if (v) {
      v.pause();
      v.currentTime = 0;
    }
  });
}
  function showSlide(i) {
    if (!items.length) return;
    stop(); index = (i + items.length) % items.length;
    nodes.forEach((n, j) => { n.classList.toggle('active', j === index); n.setAttribute('aria-hidden', String(j !== index)); });
    counter.textContent = `${String(index + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}`;
    if (contact.classList.contains('active')) return;
    const item = items[index];
    if (item.type === 'video') {
      const v = nodes[index].querySelector('video');
      v.muted = !soundEnabled;
      v.play().catch(() => { timer = setTimeout(next, 5000); });
    } else timer = setTimeout(next, item.duration || 3500);
  }
  function next() { showSlide(index + 1); }
  function updateSoundButton() {
    soundButton.textContent = soundEnabled ? 'Sound off' : 'Sound on';
    soundButton.setAttribute('aria-pressed', String(soundEnabled));
    soundButton.setAttribute('aria-label', soundEnabled ? 'Mute videos' : 'Unmute videos');
    document.querySelectorAll('.slide video').forEach(video => { video.muted = !soundEnabled; });
  }
  soundButton.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    updateSoundButton();
    // If playback was blocked by the browser, this user gesture can restart it.
    const activeVideo = nodes[index]?.querySelector('video');
    if (activeVideo && activeVideo.paused && !contact.classList.contains('active')) {
      activeVideo.play().catch(() => {});
    }
  });
  updateSoundButton();
  // Advance by clicking the slideshow, without an overlay arrow.
  slidesRoot.addEventListener('click', next);
  function navigate() {
    const route = (location.hash || '#home').slice(1);
    const isContact = route === 'contact';
    const isAbout = route === 'about';
    home.classList.toggle('active', !isContact);
    contact.classList.toggle('active', isContact);
    about.classList.toggle('active', isAbout);
    about.setAttribute('aria-hidden', String(!isAbout));
    aboutToggle.setAttribute('aria-expanded', String(isAbout));
    document.body.classList.toggle('about-open', isAbout);
    document.body.classList.toggle('contact-open', isContact);
    soundButton.hidden = isContact;
    document.getElementById('header-logo').src = isContact ? 'assets/logo-white.png' : 'assets/logo-black.png';
    document.title = `Studio Chardin Simon${isContact ? ' — Contact' : isAbout ? ' — About' : ''}`;
    if (isContact) stop();
    else if (!timer && !nodes.some(n => { const v = n.querySelector('video'); return v && !v.paused; })) showSlide(index);
  }
  // Clicking About again closes it and returns to the slideshow.
  aboutToggle.addEventListener('click', event => {
    if (location.hash === '#about') {
      event.preventDefault();
      location.hash = '#home';
    }
  });
  window.addEventListener('hashchange', navigate);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && location.hash === '#about') location.hash = '#home';
    if (!contact.classList.contains('active') && e.key === 'ArrowRight') next();
  });
  navigate();
})();
