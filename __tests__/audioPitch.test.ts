import { randomizePlaybackRate } from '../src/engine/audio';

describe('audio pitch', () => {
  test('randomizePlaybackRate maps Math.random 0..1 into [1.02, 1.10)', () => {
    const rnd = jest.spyOn(Math, 'random');
    rnd.mockReturnValue(0);
    expect(randomizePlaybackRate()).toBe(1.02);
    rnd.mockReturnValue(0.5);
    expect(randomizePlaybackRate()).toBe(1.06);
    rnd.mockReturnValue(0.99);
    const hi = randomizePlaybackRate();
    expect(hi).toBeCloseTo(1.0992, 10);
    expect(hi).toBeLessThan(1.1);
    rnd.mockRestore();
  });
});
