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
