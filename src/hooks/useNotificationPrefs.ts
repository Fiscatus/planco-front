import { useCallback, useState } from 'react';

const STORAGE_KEY = '@planco:notification-prefs';

export type NotificationSound = 'chime' | 'pop' | 'bell' | 'bling';

export type NotificationPrefs = {
  soundEnabled: boolean;
  sound: NotificationSound;
  volume: number; // 0.0 – 1.0
};

const DEFAULT: NotificationPrefs = { soundEnabled: true, sound: 'chime', volume: 0.5 };

const load = (): NotificationPrefs => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT;
    return { ...DEFAULT, ...JSON.parse(raw) };
  } catch {
    return DEFAULT;
  }
};

const save = (prefs: NotificationPrefs) =>
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));

// ─── Sons via Web Audio API ───────────────────────────────────────────────────

const playChime = (ctx: AudioContext, vol: number) => {
  [880, 660].forEach((freq, i) => {
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.value = freq;
    const t = ctx.currentTime + i * 0.18;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(vol * 0.15, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    osc.start(t);
    osc.stop(t + 0.4);
  });
};

const playPop = (ctx: AudioContext, vol: number) => {
  const osc  = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(600, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.08);
  gain.gain.setValueAtTime(vol * 0.18, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.12);
};

const playBell = (ctx: AudioContext, vol: number) => {
  [523, 1046, 1568].forEach((freq, i) => {
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'triangle';
    osc.frequency.value = freq;
    const v = (vol * 0.12) / (i + 1);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(v, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.8);
  });
};

const playBling = (ctx: AudioContext, vol: number) => {
  const osc  = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = 'sine';
  osc.frequency.value = 1760;
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(vol * 0.2, ctx.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.3);
};

const SOUND_FNS: Record<NotificationSound, (ctx: AudioContext, vol: number) => void> = {
  chime: playChime,
  pop:   playPop,
  bell:  playBell,
  bling: playBling
};

export const playNotificationSound = (override?: NotificationSound) => {
  try {
    const prefs = load();
    if (!prefs.soundEnabled) return;
    const sound = override ?? prefs.sound;
    const vol   = prefs.volume ?? 0.7;

    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    SOUND_FNS[sound](ctx, vol);
    setTimeout(() => ctx.close(), 1500);
  } catch {
    // Web Audio não disponível
  }
};

export const useNotificationPrefs = () => {
  const [prefs, setPrefs] = useState<NotificationPrefs>(load);

  const update = useCallback((patch: Partial<NotificationPrefs>) => {
    setPrefs(prev => {
      const next = { ...prev, ...patch };
      save(next);
      return next;
    });
  }, []);

  return { prefs, update };
};
