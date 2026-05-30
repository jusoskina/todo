import confetti from "canvas-confetti";

const CELEBRATION_COLORS = [
  "#89CFF0",
  "#6BB8E8",
  "#FFB7C5",
  "#FFE066",
  "#B4E7CE",
  "#FFFFFF",
];

export function celebrateAtElement(element: HTMLElement | null) {
  if (!element) return;

  const rect = element.getBoundingClientRect();
  const x = (rect.left + rect.width / 2) / window.innerWidth;
  const y = (rect.top + rect.height / 2) / window.innerHeight;

  confetti({
    particleCount: 22,
    spread: 55,
    startVelocity: 16,
    origin: { x, y },
    ticks: 45,
    gravity: 1,
    scalar: 0.45,
    decay: 0.9,
    colors: CELEBRATION_COLORS,
    disableForReducedMotion: true,
    zIndex: 9999,
  });

  confetti({
    particleCount: 8,
    spread: 360,
    startVelocity: 8,
    origin: { x, y },
    ticks: 30,
    gravity: 0.6,
    scalar: 0.35,
    shapes: ["star"],
    colors: CELEBRATION_COLORS,
    disableForReducedMotion: true,
    zIndex: 9999,
  });
}
