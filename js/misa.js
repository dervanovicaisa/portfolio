document.addEventListener('DOMContentLoaded', () => {
  const casePage = document.querySelector('.case-page');
  const projects = [
    ['Energy trading', 'Rules, permissions & APIs', 'energy-trading.html'],
    ['Document processing', 'Workflow logic & validation', 'document-processing.html'],
    ['Application redesign', 'Existing behaviour & a new design', 'customer-management.html'],
    ['Car-rental system', 'Laravel features & technical investigation', 'car-rental.html'],
    ['Moja Srma', 'Independent travel product & ordering', 'moja-srma.html']
  ];
  const guide = document.createElement('aside');
  guide.className = 'misa-guide';
  guide.setAttribute('aria-label', 'Misa, portfolio guide');
  guide.innerHTML = `<div class="misa-panel" id="misa-panel" role="region" aria-labelledby="misa-title" hidden>
    <div class="misa-panel__header"><b id="misa-title">MISA / CASE FILE GUIDE</b><button type="button" class="misa-close" aria-label="Close Misa guide">×</button></div>
    <div class="misa-content"></div>
    <div class="misa-panel__footer"><button type="button" data-view="home">Main menu</button><button type="button" class="misa-sleep">Let Misa sleep</button></div>
  </div><button type="button" class="misa-toggle" aria-label="Open Misa guide" aria-controls="misa-panel" aria-expanded="false"><canvas width="320" height="320" aria-hidden="true"></canvas><span class="misa-hint">Explore</span></button>
  <button type="button" class="misa-wake" hidden>Wake Misa</button>`;
  document.body.append(guide);
  const panel = guide.querySelector('.misa-panel');
  const content = guide.querySelector('.misa-content');
  const toggle = guide.querySelector('.misa-toggle');
  const wake = guide.querySelector('.misa-wake');
  const navigation = document.querySelector('.site-header .bar');
  const navigationMenu = navigation?.querySelector(':scope > div');
  if (navigation && navigationMenu) {
    const menuButton = document.createElement('button');
    menuButton.type = 'button';
    menuButton.className = 'nav-menu-toggle';
    menuButton.innerHTML = '<i aria-hidden="true"></i>';
    menuButton.setAttribute('aria-label', 'Open navigation menu');
    menuButton.setAttribute('aria-expanded', 'false');
    navigation.insertBefore(menuButton, navigationMenu);
    const closeNavigation = () => {
      navigation.classList.remove('is-menu-open');
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Open navigation menu');
    };
    menuButton.addEventListener('click', () => {
      const openMenu = !navigation.classList.contains('is-menu-open');
      navigation.classList.toggle('is-menu-open', openMenu);
      menuButton.setAttribute('aria-expanded', String(openMenu));
      menuButton.setAttribute('aria-label', openMenu ? 'Close navigation menu' : 'Open navigation menu');
    });
    navigationMenu.addEventListener('click', event => {
      if (event.target.closest('a')) closeNavigation();
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeNavigation();
    });
  }
  const canvas = guide.querySelector('canvas');
  const context = canvas.getContext('2d');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let open = false;
  let sleeping = false;
  let currentPose = 3;
  let currentFrame = 3;
  let animation = 0;
  let targetPose = 3;
  let ready = false;
  let view = 'home';

  const frames = Array.from({ length: 24 }, (_, i) => {
    const image = new Image();
    image.src = `assets/misa-frames/frame-${String(i).padStart(2, '0')}.png?v=3`;
    return image;
  });
  const draw = () => {
    const frame = frames[currentFrame];
    if (!context || !frame.naturalWidth) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(frame, 32, 32, 256, 256);
  };
  const pose = target => {
    targetPose = target;
    cancelAnimationFrame(animation);
    if (!ready) return;
    if (reducedMotion.matches || currentPose === target) {
      currentPose = target;
      currentFrame = target;
      draw();
      return;
    }
    const startPose = currentPose;
    const direction = Math.sign(target - startPose);
    const length = Math.abs(target - startPose);
    const duration = length * 65;
    let started;
    const tick = time => {
      started ??= time;
      const progress = Math.min(1, (time - started) / duration);
      currentPose = startPose + direction * Math.round(progress * length);
      currentFrame = direction > 0 ? currentPose : 23 - currentPose;
      draw();
      if (progress < 1) animation = requestAnimationFrame(tick);
    };
    animation = requestAnimationFrame(tick);
  };
  frames[3].addEventListener('load', draw);
  Promise.all(frames.map(frame => frame.decode().catch(() => {}))).then(() => {
    ready = true;
    draw();
    pose(targetPose);
  });

  const render = (nextView, focus = false) => {
    view = nextView;
    if (view === 'work') {
      content.innerHTML = `<h2>Choose a case file.</h2><p>Five projects showing how requirements, rules and existing behaviour shaped implementation.</p><div class="misa-options">${projects.map(([name, description, href]) => `<a href="${href}"><b>${name} →</b><small>${description}</small></a>`).join('')}</div>`;
    } else if (view === 'ba') {
      content.innerHTML = `<h2>It started with the “why”.</h2><p>In development roles, Aiša clarified requirements, investigated existing behaviour and traced API dependencies before implementation.</p><p>She is pursuing Business Systems Analysis to focus on defining expected behaviour and helping teams agree on changes.</p><div class="misa-options"><a href="index.html#samples-title">Explore analysis samples →</a></div>`;
    } else if (view === 'contact') {
      content.innerHTML = `<h2>Continue the conversation.</h2><p>Meet the person behind the case files.</p><div class="misa-options"><a href="assets/documents/Aisa-Dervanovic-CV.pdf" download>Download CV ↓</a><a href="mailto:dervanovicaisa@gmail.com">Email Aiša →</a><a href="https://github.com/dervanovicaisa" target="_blank" rel="noopener noreferrer">GitHub &#x2197;&#xFE0E;</a></div>`;
    } else {
      content.innerHTML = `<h2>What would you like to explore?</h2><p>I'm Misa. Pick a path and I'll help you find the details.</p><div class="misa-options"><button type="button" data-view="work">My work <span>→</span></button><button type="button" data-view="ba">Why Systems Analysis? <span>→</span></button><button type="button" data-view="contact">CV & contact <span>→</span></button>${casePage ? '<a href="#contribution-title">My contribution ↓</a><a href="#process-title">How I approached it ↓</a>' : ''}</div>`;
    }
    guide.querySelector('[data-view="home"]').hidden = view === 'home';
    if (focus) content.querySelector('a, button')?.focus();
  };
  const setOpen = (value, returnFocus = false) => {
    open = value;
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close Misa guide' : 'Open Misa guide');
    guide.classList.toggle('is-open', open);
    pose(open ? 11 : 0);
    if (open) {
      render('home');
      guide.querySelector('.misa-close').focus();
    } else if (returnFocus) toggle.focus();
  };
  const rememberSleep = value => {
    try { sessionStorage.setItem('misa-sleeping', String(value)); } catch {}
  };
  const setSleeping = value => {
    sleeping = value;
    if (open) setOpen(false);
    toggle.hidden = sleeping;
    wake.hidden = !sleeping;
    guide.classList.toggle('is-sleeping', sleeping);
    rememberSleep(sleeping);
    if (sleeping) { pose(0); wake.focus(); }
    else toggle.focus();
  };
  toggle.addEventListener('click', () => setOpen(!open, open));
  toggle.addEventListener('pointerenter', () => { if (!open) pose(3); });
  toggle.addEventListener('pointerleave', () => { if (!open) pose(0); });
  guide.querySelector('.misa-close').addEventListener('click', () => setOpen(false, true));
  guide.querySelector('.misa-sleep').addEventListener('click', () => setSleeping(true));
  wake.addEventListener('click', () => { setSleeping(false); setOpen(true); });
  guide.addEventListener('click', event => {
    const choice = event.target.closest('[data-view]');
    if (choice) render(choice.dataset.view, true);
    const link = event.target.closest('.misa-content a');
    if (link && !link.hasAttribute('download')) {
      setOpen(false);
      if (link.hash && link.pathname === location.pathname) {
        const heading = document.getElementById(link.hash.slice(1));
        if (heading) {
          heading.setAttribute('tabindex', '-1');
          heading.focus({ preventScroll: true });
        }
      }
    }
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && open) { event.preventDefault(); setOpen(false, true); }
  });
  document.addEventListener('click', event => {
    if (open && !event.composedPath().includes(guide)) setOpen(false);
  });
  guide.addEventListener('focusout', event => {
    if (guide.contains(event.relatedTarget)) return;
    requestAnimationFrame(() => { if (open && !guide.contains(document.activeElement)) setOpen(false); });
  });
  if (navigation) new ResizeObserver(() => {
    document.documentElement.style.setProperty('--nav-offset', `${navigation.getBoundingClientRect().height + 24}px`);
  }).observe(navigation);
  render('home');
  try {
    if (sessionStorage.getItem('misa-sleeping') === 'true') {
      sleeping = true;
      toggle.hidden = true;
      wake.hidden = false;
      guide.classList.add('is-sleeping');
      pose(0);
    }
  } catch {}
});
