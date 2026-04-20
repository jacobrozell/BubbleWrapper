import { Audio } from 'expo-av';

/** Spec: playback rate centered at 1.0 with ±0.05 variance. */
export function randomizePlaybackRate(): number {
  return 0.95 + Math.random() * 0.1;
}

let sound: Audio.Sound | null = null;
let initPromise: Promise<void> | null = null;
let initFailed = false;

export async function initPopAudio(): Promise<void> {
  if (initFailed) return;
  if (!initPromise) {
    initPromise = (async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
        const mod = require('../../assets/pop.wav');
        const { sound: s } = await Audio.Sound.createAsync(mod, {
          shouldPlay: false,
          isLooping: false,
        });
        sound = s;
      } catch {
        initFailed = true;
        sound = null;
      }
    })();
  }
  return initPromise;
}

export async function playPop(): Promise<void> {
  await initPopAudio();
  if (!sound) return;
  const rate = randomizePlaybackRate();
  try {
    await sound.setRateAsync(rate, true);
    await sound.setPositionAsync(0);
    await sound.playAsync();
  } catch {
    // Offline asset / platform quirks — fail silently.
  }
}
