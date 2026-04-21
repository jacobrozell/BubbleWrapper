import { Audio } from 'expo-av';

import { getGameSnapshot, getSoundEnabled } from '../storage/zenStore';

function getPopAccentVolume(): number {
  return getGameSnapshot().popSoundMutedOwned ? 0.12 : 0.38;
}

/** Slightly brightened rate so each pop feels snappy but not identical. */
export function randomizePlaybackRate(): number {
  return 1.02 + Math.random() * 0.08;
}

let primary: Audio.Sound | null = null;
let accent: Audio.Sound | null = null;
let initPromise: Promise<void> | null = null;
let initFailed = false;

async function loadPopSound(): Promise<Audio.Sound | null> {
  const mod = require('../../assets/pop.wav');
  const { sound } = await Audio.Sound.createAsync(mod, {
    shouldPlay: false,
    isLooping: false,
    volume: 1,
  });
  await sound.setVolumeAsync(1);
  return sound;
}

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
        const [a, b] = await Promise.all([
          loadPopSound(),
          loadPopSound(),
        ]);
        primary = a;
        accent = b;
      } catch {
        initFailed = true;
        primary = null;
        accent = null;
      }
    })();
  }
  return initPromise;
}

export async function playPop(): Promise<void> {
  if (!getSoundEnabled()) return;
  await initPopAudio();
  if (!primary || !accent) return;
  const rate = randomizePlaybackRate();
  const accentRate = Math.min(rate * 1.04, 1.95);
  try {
    await primary.setVolumeAsync(1);
    await primary.setRateAsync(rate, true);
    await primary.setPositionAsync(0);
    await primary.playAsync();

    const accentVol = getPopAccentVolume();
    await accent.setVolumeAsync(accentVol);
    await accent.setRateAsync(accentRate, true);
    await accent.setPositionAsync(0);
    const layer = accent;
    setTimeout(() => {
      void layer.playAsync();
    }, 12);
  } catch {
    // Offline asset / platform quirks — fail silently.
  }
}
