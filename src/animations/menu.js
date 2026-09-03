import gsap from 'gsap';

export function initMenu() {
  const menuBtn = document.getElementById('header-right-menu-btn');
  const menu = document.getElementById('header-menu');
  const menuBg = document.getElementById('header-menu-bg');
  const menuLinks = document.querySelectorAll('.header-menu-link');
  const menuFooter = document.getElementById('header-menu-footer');
  if (!menuBtn || !menu) return;

  let isOpen = false;

  // Build master menu timeline as recommended by gsap-timeline
  const menuTl = gsap.timeline({
    paused: true,
    defaults: { duration: 0.6, ease: "power3.out" },
    onReverseComplete: () => {
      menu.classList.remove('is-open');
      document.body.classList.remove('menu-active');
    }
  });

  menuTl
    .set(menu, { autoAlpha: 1, pointerEvents: 'auto' })
    .to(menuBg, {
      yPercent: 100,
      duration: 0.7,
      ease: "power4.inOut"
    })
    .fromTo(
      menuLinks,
      { yPercent: 100, autoAlpha: 0 },
      { yPercent: 0, autoAlpha: 1, stagger: 0.08, duration: 0.7, ease: "power3.out" },
      "-=0.3"
    )
    .fromTo(
      menuFooter,
      { autoAlpha: 0, y: 20 },
      { autoAlpha: 1, y: 0, duration: 0.5 },
      "-=0.2"
    );

  function toggleMenu() {
    isOpen = !isOpen;
    if (isOpen) {
      menu.classList.add('is-open');
      document.body.classList.add('menu-active');
      menuTl.play();
    } else {
      menuTl.reverse();
    }
  }

  menuBtn.addEventListener('click', toggleMenu);

  // Close menu when clicking any menu link
  menuLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (isOpen) toggleMenu();
    });
  });
}
