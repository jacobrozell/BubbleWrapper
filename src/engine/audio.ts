import { Audio } from 'expo-av';

import { getGameSnapshot, getSoundEnabled } from '../storage/zenStore';

function getPopAccentVolume(): number {
  return getGameSnapshot().popSoundMutedOwned ? 0.12 : 0.38;
}

/** Slightly brightened rate so each pop feels snappy but not identical. */
export function randomizePlaybackRate(): number {
  return 1.02 + Math.random() * 0.08;
}

/** Paired primary + layered accent; pool spreads rapid pops across instances. */
const POOL_SIZE = 4;

type PopSoundSlot = {
  primary: Audio.Sound;
  accent: Audio.Sound;
};

let slots: PopSoundSlot[] = [];
let initPromise: Promise<void> | null = null;
let initFailed = false;
let stealCursor = 0;

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

async function pickSlotIndex(): Promise<number> {
  for (let i = 0; i < slots.length; i += 1) {
    try {
      const st = await slots[i].primary.getStatusAsync();
      if (!st.isLoaded) continue;
      if (!st.isPlaying) {
        return i;
      }
    } catch {
      /* try next slot */
    }
  }
  const idx = stealCursor % slots.length;
  stealCursor += 1;
  return idx;
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
        const sounds = await Promise.all(
          Array.from({ length: POOL_SIZE * 2 }, () => loadPopSound()),
        );
        const next: PopSoundSlot[] = [];
        for (let i = 0; i < POOL_SIZE; i += 1) {
          const primary = sounds[i * 2];
          const accent = sounds[i * 2 + 1];
          if (!primary || !accent) {
            throw new Error('pop sound load failed');
          }
          next.push({ primary, accent });
        }
        slots = next;
      } catch {
        initFailed = true;
        slots = [];
      }
    })();
  }
  return initPromise;
}

export async function playPop(): Promise<void> {
  if (!getSoundEnabled()) return;
  await initPopAudio();
  if (slots.length === 0) return;

  const idx = await pickSlotIndex();
  const { primary, accent } = slots[idx];
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
    setTimeout(() => {
      void accent.playAsync();
    }, 12);
  } catch {
    // Offline asset / platform quirks — fail silently.
  }
}
