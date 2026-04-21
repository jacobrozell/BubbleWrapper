import { randomizePlaybackRate } from '../src/engine/audio';

describe('audio pitch', () => {
  test('randomizePlaybackRate stays within 1.02..1.10', () => {
    for (let i = 0; i < 5000; i += 1) {
      const r = randomizePlaybackRate();
      expect(r).toBeGreaterThanOrEqual(1.02);
      expect(r).toBeLessThanOrEqual(1.1);
    }
  });
});
