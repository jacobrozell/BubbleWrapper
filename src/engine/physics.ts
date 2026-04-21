/** Bubble press in/out — tuned for a quick snap (~1–2 frames to read, fast return). */
export const SPRING_CONFIG = {
  stiffness: 640,
  damping: 30,
  mass: 0.28,
} as const;

/** Progress achievement row: scale-up phase after a successful claim. */
export const ACHIEVEMENT_CLAIM_SPRING_OUT = {
  stiffness: 760,
  damping: 32,
  mass: 0.26,
} as const;

/** Progress achievement row: settle back to 1 after the pulse. */
export const ACHIEVEMENT_CLAIM_SPRING_IN = {
  stiffness: 700,
  damping: 34,
  mass: 0.26,
} as const;

export const PRESS_IN_SCALE = 0.92;
