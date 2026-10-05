document.addEventListener('DOMContentLoaded', () => {
  const navigation = document.querySelector('.bar');
  if (!navigation) return;
  const links = Array.from(navigation.querySelectorAll('a[href^="#"]'));
  const sections = links.map(link => ({ link, section: document.getElementById(link.hash.slice(1)) }))
    .filter(item => item.section);
  let queued = false;

  const updateNavigation = () => {
    queued = false;
    const offset = navigation.getBoundingClientRect().height + 24;
    document.documentElement.style.setProperty('--nav-offset', `${offset}px`);
    let active = null;
    for (const item of sections) {
      if (item.section.getBoundingClientRect().top <= offset + 1) active = item;
    }
    if (sections.length && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
      active = sections[sections.length - 1];
    }
    for (const item of sections) {
      const selected = item === active;
      item.link.classList.toggle('is-active', selected);
      if (selected) item.link.setAttribute('aria-current', 'location');
      else item.link.removeAttribute('aria-current');
    }
  };
  const scheduleUpdate = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(updateNavigation);
  };
  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate);
  new ResizeObserver(scheduleUpdate).observe(navigation);
  updateNavigation();
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
