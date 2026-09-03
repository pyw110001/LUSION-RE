import gsap from 'gsap';

export function initMagneticButtons() {
  const buttons = document.querySelectorAll('.magnetic-btn');

  buttons.forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      // Smooth magnetic pull
      gsap.to(btn, {
        x: x * 0.35,
        y: y * 0.35,
        duration: 0.4,
        ease: "power2.out"
      });
    });

    btn.addEventListener('mouseleave', () => {
      // Elastic spring back
      gsap.to(btn, {
        x: 0,
        y: 0,
        duration: 0.7,
        ease: "elastic.out(1, 0.4)"
      });
    });
  });
}
