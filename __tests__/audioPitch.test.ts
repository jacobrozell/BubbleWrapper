import { randomizePlaybackRate } from '../src/engine/audio';

describe('audio pitch', () => {
  test('randomizePlaybackRate stays within 0.95..1.05', () => {
    for (let i = 0; i < 5000; i += 1) {
      const r = randomizePlaybackRate();
      expect(r).toBeGreaterThanOrEqual(0.95);
      expect(r).toBeLessThanOrEqual(1.05);
    }
  });
});
