import gsap from 'gsap';

export function initMenu() {
  const button = document.getElementById('header-right-menu-btn');
  const menu = document.getElementById('header-menu');
  const panels = menu?.querySelectorAll('#header-menu-links, #header-menu-newsletter, #header-menu-labs');
  const links = menu?.querySelectorAll('a, input, button');
  const navigationLinks = [...(menu?.querySelectorAll('.header-menu-link') || [])];
  if (!button || !menu || !panels) return;

  let isOpen = false;
  let scrollTicking = false;

  function setCurrentLink(currentLink) {
    navigationLinks.forEach((link) => {
      const isCurrent = link === currentLink;
      link.classList.toggle('is-current', isCurrent);
      if (isCurrent) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  }

  function updateCurrentLink() {
    let currentLink = navigationLinks[0];
    const threshold = window.innerHeight * 0.45;

    navigationLinks.forEach((link) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target && target.getBoundingClientRect().top <= threshold) currentLink = link;
    });

    setCurrentLink(currentLink);
    scrollTicking = false;
  }

  gsap.set(menu, { autoAlpha: 0, pointerEvents: 'none' });
  gsap.set(panels, { y: -18, autoAlpha: 0, scale: 0.98 });

  const timeline = gsap.timeline({
    paused: true,
    defaults: { ease: 'power3.out' },
    onReverseComplete: () => {
      menu.classList.remove('is-open');
      menu.setAttribute('aria-hidden', 'true');
      gsap.set(menu, { pointerEvents: 'none' });
    },
  })
    .set(menu, { autoAlpha: 1, pointerEvents: 'auto' })
    .to(panels, { y: 0, autoAlpha: 1, scale: 1, duration: 0.55, stagger: 0.055 }, 0);

  function setOpen(nextOpen, restoreFocus = false) {
    isOpen = nextOpen;
    button.setAttribute('aria-expanded', String(isOpen));
    button.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
    document.body.classList.toggle('menu-active', isOpen);

    if (isOpen) {
      updateCurrentLink();
      menu.classList.add('is-open');
      menu.setAttribute('aria-hidden', 'false');
      timeline.play();
      window.setTimeout(() => links?.[0]?.focus(), 160);
    } else {
      timeline.reverse();
      if (restoreFocus) button.focus();
    }
  }

  button.addEventListener('click', () => setOpen(!isOpen));

  navigationLinks.forEach((link) => {
    link.addEventListener('click', () => {
      setCurrentLink(link);
      setOpen(false);
    });
  });

  window.addEventListener('scroll', () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(updateCurrentLink);
  }, { passive: true });

  updateCurrentLink();

  window.addEventListener('keydown', (event) => {
    if (!isOpen) return;
    if (event.key === 'Escape') {
      setOpen(false, true);
      return;
    }
    if (event.key !== 'Tab' || !links?.length) return;

    const first = links[0];
    const last = links[links.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
}
