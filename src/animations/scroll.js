import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

export function initScrollAnimations(sceneManager) {
  gsap.registerPlugin(ScrollTrigger);

  // 1. Initialize Lenis Smooth Scroll
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    smoothWheel: true,
  });

  window.lenis = lenis;

  lenis.on('scroll', (e) => {
    ScrollTrigger.update();
    if (sceneManager) {
      const scrollProgress = e.progress || (window.scrollY / (document.body.scrollHeight - window.innerHeight));
      sceneManager.setScrollProgress(scrollProgress);
    }
  });

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  // 2. Header blur on scroll
  ScrollTrigger.create({
    start: "top -50",
    onUpdate: (self) => {
      const header = document.getElementById('header');
      if (self.scroll() > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
  });

  // 3. Responsive Breakpoints with gsap.matchMedia() as required by gsap-core
  const mm = gsap.matchMedia();

  mm.add("(min-width: 768px)", () => {
    // Desktop Hero Parallax
    gsap.to("#home-hero-title", {
      yPercent: -25,
      autoAlpha: 0.2,
      ease: "none",
      scrollTrigger: {
        trigger: "#home-hero",
        start: "top top",
        end: "bottom top",
        scrub: 1
      }
    });
  });

  // 4. Hero Entrance Timeline
  const heroTl = gsap.timeline({ defaults: { duration: 1.1, ease: "power3.out" } });
  heroTl
    .fromTo(
      "#home-hero-title-compact",
      { y: 40, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, delay: 0.15 }
    )
    .fromTo(
      "#hero-window-container",
      { scale: 0.95, y: 50, autoAlpha: 0 },
      { scale: 1, y: 0, autoAlpha: 1, duration: 1.2 },
      "-=0.7"
    )
    .fromTo(
      "#home-hero-bottom-bar",
      { autoAlpha: 0, y: 15 },
      { autoAlpha: 1, y: 0, duration: 0.8 },
      "-=0.5"
    );

  // 5. Showreel Section Pinned Timeline (Matching User's Screenshots Image 1 & 2)
  const ribbonPath = document.getElementById('reel-ribbon-path');
  const ribbonTip = document.getElementById('reel-ribbon-tip');
  let ribbonLength = 3200;
  if (ribbonPath) {
    ribbonLength = ribbonPath.getTotalLength();
    ribbonPath.style.strokeDasharray = ribbonLength;
    ribbonPath.style.strokeDashoffset = ribbonLength;
  }

  const reelTl = gsap.timeline({
    scrollTrigger: {
      trigger: "#home-reel",
      start: "top top",
      end: "+=2600",
      pin: true,
      scrub: 1,
      onEnter: () => {
        if (sceneManager) sceneManager.setRibbonVisible(true);
      },
      onEnterBack: () => {
        if (sceneManager) sceneManager.setRibbonVisible(true);
      },
      onLeave: () => {
        // Exiting Section 2 downward into Featured Work: Hide 3D pipeline completely
        if (sceneManager) sceneManager.setRibbonVisible(false);
      },
      onLeaveBack: () => {
        // Exiting Section 2 upward into Hero: Hide 3D pipeline completely
        if (sceneManager) sceneManager.setRibbonVisible(false);
      },
      onUpdate: (self) => {
        if (sceneManager) {
          sceneManager.setRibbonProgress(self.progress);
        }
      }
    }
  });

  // Animate the 3D blue ribbon drawing smoothly from top-left to bottom-right
  if (ribbonPath) {
    reelTl.to(ribbonPath, {
      strokeDashoffset: 0,
      ease: "none",
      duration: 1,
      onUpdate: function() {
        const offset = gsap.getProperty(ribbonPath, "strokeDashoffset");
        const currentDist = Math.max(0, ribbonLength - offset);
        if (ribbonTip && currentDist > 15 && currentDist < ribbonLength - 15) {
          const pt = ribbonPath.getPointAtLength(currentDist);
          ribbonTip.setAttribute('cx', pt.x);
          ribbonTip.setAttribute('cy', pt.y);
          ribbonTip.style.opacity = '1';
        } else if (ribbonTip) {
          ribbonTip.style.opacity = '0';
        }
      }
    }, 0);
  }

  reelTl
    // Step 1: "Bold Ideas, Brought to Life" moves up and exits (Image 1 -> Image 2)
    .to("#home-reel-title", {
      yPercent: -120,
      autoAlpha: 0,
      duration: 0.45,
      ease: "power2.inOut"
    }, 0)
    // Step 2: Crossfade left card from Soda Experience (Image 1) to Choo Choo World (Image 2)
    .to(".reel-card-soda", {
      autoAlpha: 0,
      duration: 0.4,
      ease: "power1.inOut"
    }, 0.22)
    .to(".reel-card-choo", {
      autoAlpha: 1,
      duration: 0.4,
      ease: "power1.inOut"
    }, 0.22)
    // Step 3: Card moves slightly up with parallax
    .fromTo("#home-reel-card-wrapper",
      { y: 40 },
      { y: -30, duration: 0.8, ease: "none" },
      0.1
    )
    // Step 4: Giant "PLAY REEL" outline background text rises from bottom (Image 2)
    .fromTo("#home-reel-bg-text",
      { yPercent: 80, autoAlpha: 0 },
      { yPercent: 0, autoAlpha: 1, duration: 0.65, ease: "power2.out" },
      0.3
    );

  // Video Modal Logic
  const reelCard = document.getElementById('home-reel-card');
  const modal = document.getElementById('video-modal');
  const modalClose = document.getElementById('modal-close-btn');
  const modalBackdrop = document.getElementById('modal-backdrop');
  const modalVideo = document.getElementById('modal-video');

  function openModal() {
    if (modal) modal.classList.add('is-open');
    if (modalVideo) {
      modalVideo.currentTime = 0;
      modalVideo.play().catch(() => {});
    }
  }

  function closeModal() {
    if (modal) modal.classList.remove('is-open');
    if (modalVideo) modalVideo.pause();
  }

  if (reelCard) reelCard.addEventListener('click', openModal);
  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);

  // 6. Featured Work Section Header and Batch Cards
  gsap.fromTo("#home-featured-header",
    { y: 50, autoAlpha: 0 },
    {
      y: 0,
      autoAlpha: 1,
      duration: 0.9,
      ease: "power2.out",
      scrollTrigger: {
        trigger: "#home-featured",
        start: "top 80%",
        toggleActions: "play none none reverse"
      }
    }
  );

  // ScrollTrigger.batch for project cards
  ScrollTrigger.batch(".project-item", {
    start: "top 88%",
    interval: 0.1,
    batchMax: 2,
    onEnter: (batch) => {
      gsap.fromTo(batch,
        { y: 60, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.15, ease: "power2.out", overwrite: true }
      );
    }
  });

  // 7. Goal Tunnel Pinned Zoom Experience with 3D Warp Tunnel sync
  const tunnelTl = gsap.timeline({
    scrollTrigger: {
      trigger: "#home-goal-pinned-wrapper",
      start: "top top",
      end: "+=2400",
      pin: true,
      scrub: 1,
      onUpdate: (self) => {
        if (sceneManager) {
          sceneManager.setTunnelProgress(self.progress);
        }
      }
    }
  });

  tunnelTl
    .to("#home-goal-context", {
      autoAlpha: 0,
      y: -80,
      duration: 1
    }, 0)
    .fromTo("#home-goal-image-in-inner",
      { scale: 0.7, autoAlpha: 0.3 },
      { scale: 2.2, autoAlpha: 1, duration: 2.5, ease: "power1.inOut" },
      0
    )
    .fromTo("#home-goal-tunnel-title",
      { scale: 0.5, autoAlpha: 0 },
      { scale: 1.1, autoAlpha: 1, duration: 1.2 },
      0.5
    )
    .to("#home-goal-tunnel-title",
      { scale: 2.4, autoAlpha: 0, duration: 1 },
      1.7
    );

  // 8. End Section CTA Entrance
  gsap.fromTo("#end-section-content",
    { y: 60, autoAlpha: 0 },
    {
      y: 0,
      autoAlpha: 1,
      duration: 1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: "#end-section",
        start: "top 75%",
        toggleActions: "play none none reverse"
      }
    }
  );

  return () => {
    mm.revert();
    lenis.destroy();
  };
}
