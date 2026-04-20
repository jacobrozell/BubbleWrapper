import * as Haptics from 'expo-haptics';

async function safeRun(fn: () => Promise<void>): Promise<void> {
  try {
    await fn();
  } catch {
    // Unsupported haptics / simulator — ignore.
  }
}

export function popPressIn(): void {
  void safeRun(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
}

export function popComplete(): void {
  void safeRun(() =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  );
}

export function selectionTick(): void {
  void safeRun(() => Haptics.selectionAsync());
}
