import confetti from "canvas-confetti";

export const celebrate = (origin = { x: 0.5, y: 0.6 }) => {
  confetti({
    particleCount: 80,
    spread: 70,
    startVelocity: 35,
    scalar: 0.9,
    origin,
    colors: ["#fbbf24", "#fcd34d", "#f59e0b", "#fde68a", "#d97706"],
  });
};

export const celebrateBig = () => {
  const duration = 800;
  const end = Date.now() + duration;
  (function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ["#fbbf24", "#fcd34d", "#f59e0b"],
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ["#fbbf24", "#fcd34d", "#f59e0b"],
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
};
