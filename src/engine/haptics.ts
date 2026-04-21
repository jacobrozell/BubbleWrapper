import * as Haptics from 'expo-haptics';

import { getHapticsEnabled } from '../storage/zenStore';

async function safeRun(fn: () => Promise<void>): Promise<void> {
  try {
    await fn();
  } catch {
    // Unsupported haptics / simulator — ignore.
  }
}

export function popPressIn(): void {
  if (!getHapticsEnabled()) return;
  void safeRun(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
}

export function popComplete(): void {
  if (!getHapticsEnabled()) return;
  void safeRun(() =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  );
}

export function selectionTick(): void {
  if (!getHapticsEnabled()) return;
  void safeRun(() => Haptics.selectionAsync());
}

export function achievementBannerLight(): void {
  if (!getHapticsEnabled()) return;
  void safeRun(() =>
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  );
}
