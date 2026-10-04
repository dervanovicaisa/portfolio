document.addEventListener('DOMContentLoaded', () => {
  const guide = document.querySelector('.case-guide');
  const button = guide?.querySelector('.case-guide__button');
  const bubble = guide?.querySelector('.case-guide__bubble');
  const message = bubble?.querySelector('span');
  const canvas = guide?.querySelector('.misa-transform-sprite');
  const context = canvas?.getContext('2d');
  const contact = document.querySelector('#contact');
  if (!guide || !button || !bubble || !message || !canvas || !context || !contact) return;

  const frames = Array.from({ length: 24 }, (_, index) => {
    const image = new Image();
    image.src = `assets/misa-frames/frame-${String(index).padStart(2, '0')}.png?v=3`;
    return image;
  });
  let activeStage = null;
  let contactVisible = false;
  let atPageEnd = false;
  let contactPeek = false;
  let scrollZone = null;
  let manualOpen = false;
  let animationId = 0;
  let currentFrame = 3;
  let framesReady = false;
  let pendingAnimation = null;

  const stages = [
    { section: document.querySelector('.hero'), message: "I am Misa. I will show you what makes Aiša's work different." },
    { section: document.querySelector('#about'), message: 'Here is her working style: clarify the system before shaping the UI.' },
    { section: document.querySelector('.cv-evidence'), message: 'Here is the evidence: APIs, rules, validation and the awkward edge cases.' },
    { section: document.querySelector('#work'), message: 'Open a case file and follow the path from system behaviour to interface.' },
    { section: contact, message: "" }
  ].filter((stage) => stage.section);

  const draw = () => {
    const image = frames[currentFrame];
    if (!image.complete || !image.naturalWidth) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 32, 32, 256, 256);
  };

  frames[3].addEventListener('load', draw);
  draw();

  const frameRange = (start, end) => {
    const step = start <= end ? 1 : -1;
    return Array.from({ length: Math.abs(end - start) + 1 }, (_, index) => start + index * step);
  };

  const pathTo = (targetPose) => {
    const pose = currentFrame <= 11 ? currentFrame : 23 - currentFrame;
    if (pose === targetPose) return [currentFrame];
    if (targetPose === 11) {
      return currentFrame <= 11
        ? frameRange(currentFrame, 11)
        : [...frameRange(currentFrame, 12), 11];
    }
    if (targetPose === 0) {
      return currentFrame >= 12
        ? frameRange(currentFrame, 23)
        : [currentFrame, ...frameRange(23 - pose, 23)];
    }
    if (currentFrame === 23) return [23, 0, 1, 2, 3];
    return currentFrame >= 12
      ? [...frameRange(currentFrame, 20), 3]
      : frameRange(currentFrame, 3);
  };

  const animateTo = (target, onFinish) => {
    if (!framesReady) {
      pendingAnimation = { target, onFinish };
      return;
    }
    cancelAnimationFrame(animationId);
    const targetPose = target === 0 ? 0 : target === 1 ? 11 : 3;
    const path = pathTo(targetPose);
    if (path.length === 1 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      currentFrame = path[path.length - 1];
      draw();
      onFinish?.();
      return;
    }

    const duration = Math.max(360, (path.length - 1) * 120);
    let startedAt;
    const tick = (time) => {
      if (startedAt === undefined) startedAt = time;
      const t = Math.min(1, (time - startedAt) / duration);
      const nextFrame = path[Math.floor(t * (path.length - 1))];
      if (nextFrame !== currentFrame) {
        currentFrame = nextFrame;
        draw();
      }
      if (t < 1) {
        animationId = requestAnimationFrame(tick);
      } else {
        animationId = 0;
        onFinish?.();
      }
    };
    animationId = requestAnimationFrame(tick);
  };

  Promise.all(frames.map((image) => image.decode().catch(() => {}))).then(() => {
    framesReady = true;
    draw();
    if (pendingAnimation) {
      const { target, onFinish } = pendingAnimation;
      pendingAnimation = null;
      animateTo(target, onFinish);
    }
  });

  const updateStage = () => {
    const readingLine = window.scrollY + window.innerHeight * 0.45;
    atPageEnd = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 8;
    activeStage = stages[0];
    for (const stage of stages) {
      if (stage.section.offsetTop <= readingLine) activeStage = stage;
    }
    if (!guide.classList.contains('has-interacted') && !contactVisible) {
      message.textContent = activeStage.message;
    } else if (guide.classList.contains('is-open') && !contactVisible) {
      message.textContent = activeStage.message;
    }
    guide.classList.toggle('is-page-end', contactVisible && atPageEnd);
    if (contactVisible) {
      bubble.classList.toggle('is-final-note', atPageEnd);
      message.textContent = atPageEnd ? "Don't forget to call her." : '';
    }

    const about = document.querySelector('#about');
    const introEnd = about ? Math.max(80, about.offsetTop - window.innerHeight * 0.75) : 80;
    const nextZone = contactVisible ? 'contact' : window.scrollY < introEnd ? 'intro' : 'body';
    if (nextZone === scrollZone) return;
    scrollZone = nextZone;
    manualOpen = false;

    if (nextZone === 'contact') {
      guide.classList.add('is-contact', 'has-interacted');
      guide.classList.remove('is-expanded', 'is-open', 'is-contact-peek');
      contactPeek = false;
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-label', 'Misa, curled up. Click to peek out.');
      animateTo(0);
    } else if (nextZone === 'body') {
      guide.classList.add('has-interacted');
      guide.classList.remove('is-contact', 'is-contact-peek');
      contactPeek = false;
      button.setAttribute('aria-label', 'Open Misa portfolio note');
      animateTo(1, () => guide.classList.add('is-expanded'));
    } else {
      guide.classList.remove('is-contact', 'is-contact-peek', 'is-open', 'is-expanded');
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-label', 'Open Misa portfolio note');
      animateTo(0.43, () => {
        if (scrollZone === 'intro' && !manualOpen) {
          guide.classList.remove('has-interacted');
          draw();
        }
      });
    }
  };

  const contactObserver = new IntersectionObserver(([entry]) => {
    if (contactVisible === entry.isIntersecting) return;
    contactVisible = entry.isIntersecting;
    updateStage();
  }, { threshold: 0.2 });
  contactObserver.observe(contact);

  button.setAttribute('aria-expanded', 'false');
  button.addEventListener('click', () => {
    manualOpen = true;
    guide.classList.add('has-interacted');

    if (contactVisible) {
      if (contactPeek) {
        contactPeek = false;
        button.setAttribute('aria-label', 'Misa, curled up. Click to peek out.');
        animateTo(0, () => {
          guide.classList.remove('is-contact-peek');
        });
      } else {
        contactPeek = true;
        button.setAttribute('aria-label', 'Misa peeking out of her shell. Click to curl up.');
        animateTo(0.43, () => {
          guide.classList.add('is-contact-peek');
        });
      }
      message.textContent = atPageEnd ? "Don't forget to call her." : '';
      return;
    }

    const isOpen = guide.classList.toggle('is-open');
    button.setAttribute('aria-expanded', String(isOpen));
    message.textContent = activeStage?.message || stages[0].message;
    if (isOpen && !guide.classList.contains('is-expanded')) {
      animateTo(1, () => {
        guide.classList.add('is-expanded');
      });
    }
  });

  document.addEventListener('click', (event) => {
    if (!guide.contains(event.target)) {
      guide.classList.remove('is-open');
      button.setAttribute('aria-expanded', 'false');
    }
  });

  window.addEventListener('scroll', updateStage, { passive: true });
  updateStage();
});

document.addEventListener('DOMContentLoaded', () => {
  const diagrams = [
    { label: 'Trading order validation flow', svg: `<defs><marker id="arrow-enexa" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6Z"/></marker></defs><path class="flow" marker-end="url(#arrow-enexa)" d="M64 46H82M138 46H156M184 63V83"/><rect class="box" x="8" y="30" width="56" height="32" rx="2"/><text x="36" y="49" text-anchor="middle">POSITION</text><rect class="box" x="82" y="30" width="56" height="32" rx="2"/><text x="110" y="49" text-anchor="middle">ORDER</text><rect class="accent" x="156" y="30" width="56" height="32" rx="2"/><text x="184" y="49" text-anchor="middle">PRICE</text><rect class="result" x="74" y="84" width="110" height="27" rx="2"/><text x="129" y="101" text-anchor="middle">VALIDATE / REVIEW</text>` },
    { label: 'Document workflow', svg: `<defs><marker id="arrow-uhura" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6Z"/></marker></defs><path class="flow" marker-end="url(#arrow-uhura)" d="M110 45V60M76 81L52 98M144 81L168 98"/><rect class="box" x="72" y="18" width="76" height="27" rx="2"/><text x="110" y="35" text-anchor="middle">DOCUMENT</text><rect class="navy" x="66" y="60" width="88" height="22" rx="2"/><text x="110" y="75" text-anchor="middle">EXTRACTION</text><rect class="accent" x="16" y="98" width="72" height="22" rx="2"/><text x="52" y="113" text-anchor="middle">ACTION</text><rect class="result" x="132" y="98" width="72" height="22" rx="2"/><text x="168" y="113" text-anchor="middle">REVIEW</text>` },
    { label: 'Legacy interface redesign process', svg: `<defs><marker id="arrow-fuel" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6Z"/></marker></defs><path class="flow" marker-end="url(#arrow-fuel)" d="M62 65H150"/><rect class="box" x="8" y="34" width="54" height="62" rx="2"/><text x="35" y="53" text-anchor="middle">OLD UI</text><text x="35" y="75" text-anchor="middle" class="detail">OBSERVE</text><text x="106" y="48" text-anchor="middle" class="detail">TEST</text><text x="106" y="65" text-anchor="middle" class="detail">COMPARE</text><text x="106" y="82" text-anchor="middle" class="detail">CLARIFY</text><rect class="navy" x="150" y="34" width="62" height="62" rx="2"/><text x="181" y="53" text-anchor="middle">NEW UI</text><text x="181" y="75" text-anchor="middle" class="detail inverse">REBUILD</text>` }
  ];

  document.querySelectorAll('#work .diagram svg').forEach((svg, index) => {
    const diagram = diagrams[index];
    if (!diagram) return;
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', diagram.label);
    svg.innerHTML = diagram.svg;
  });

  const style = document.createElement('style');
  style.textContent = `.diagram{display:flex;align-items:center;justify-content:center;overflow:hidden}.diagram svg{overflow:visible}.diagram .flow{fill:none;stroke:#6e675e;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}.diagram marker path{fill:#6e675e}.diagram .result{fill:#f8f5ee;stroke:#24211e;stroke-width:1.2}.diagram .detail{font-size:6px;letter-spacing:.45px}.diagram .inverse{fill:#fff}`;
  document.head.append(style);
});
