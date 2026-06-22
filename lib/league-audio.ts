"use client";

const SOUND_KEY = "ai-builders-league-sound-start";
const SOUND_DURATION = 1.35;
const SOUND_DEDUPE_MS = 1800;

let leagueAudioContext: AudioContext | null = null;
let cleanupTimer: number | null = null;

function getAudioContext() {
  if (typeof window === "undefined") return null;
  if (leagueAudioContext && leagueAudioContext.state !== "closed") return leagueAudioContext;

  const AudioContextCtor = window.AudioContext || (
    window as typeof window & { webkitAudioContext?: typeof AudioContext }
  ).webkitAudioContext;
  if (!AudioContextCtor) return null;

  leagueAudioContext = new AudioContextCtor();
  return leagueAudioContext;
}

function addTone({
  context,
  destination,
  frequency,
  start,
  duration,
  volume,
  type = "sine",
  detune = 0,
}: {
  context: AudioContext;
  destination: AudioNode;
  frequency: number;
  start: number;
  duration: number;
  volume: number;
  type?: OscillatorType;
  detune?: number;
}) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const attack = Math.min(0.08, duration * 0.22);

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  oscillator.detune.setValueAtTime(detune, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain);
  gain.connect(destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

function scheduleLeagueCue(context: AudioContext) {
  const now = context.currentTime + 0.015;
  const master = context.createGain();
  const compressor = context.createDynamicsCompressor();

  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(0.11, now + 0.08);
  master.gain.setValueAtTime(0.11, now + 0.78);
  master.gain.exponentialRampToValueAtTime(0.0001, now + SOUND_DURATION);
  compressor.threshold.setValueAtTime(-24, now);
  compressor.knee.setValueAtTime(18, now);
  compressor.ratio.setValueAtTime(4, now);
  compressor.attack.setValueAtTime(0.01, now);
  compressor.release.setValueAtTime(0.28, now);
  master.connect(compressor);
  compressor.connect(context.destination);

  // Warm story-mode pad: D major with a quiet octave foundation.
  [
    [146.83, 0.042, "sine"],
    [220, 0.03, "triangle"],
    [293.66, 0.034, "sine"],
    [369.99, 0.022, "triangle"],
  ].forEach(([frequency, volume, type], index) => {
    addTone({
      context,
      destination: master,
      frequency: Number(frequency),
      start: now,
      duration: 1.24 - index * 0.035,
      volume: Number(volume),
      type: type as OscillatorType,
      detune: index % 2 ? 3 : -3,
    });
  });

  // A restrained upward rank reveal that follows the Eye opening.
  [587.33, 739.99, 880].forEach((frequency, index) => {
    addTone({
      context,
      destination: master,
      frequency,
      start: now + 0.34 + index * 0.19,
      duration: 0.42,
      volume: 0.038 - index * 0.004,
      type: "sine",
    });
  });

  // Soft resolution as the League appears.
  addTone({
    context,
    destination: master,
    frequency: 1174.66,
    start: now + 0.9,
    duration: 0.34,
    volume: 0.024,
    type: "sine",
  });

  if (cleanupTimer) window.clearTimeout(cleanupTimer);
  cleanupTimer = window.setTimeout(() => {
    if (leagueAudioContext !== context) return;
    void context.close().catch(() => undefined);
    leagueAudioContext = null;
    cleanupTimer = null;
  }, 2200);
}

export function playLeagueEntrySound() {
  if (typeof window === "undefined") return;

  const previousStart = Number(window.sessionStorage.getItem(SOUND_KEY));
  const now = Date.now();
  if (previousStart > 0 && now - previousStart < SOUND_DEDUPE_MS) return;
  window.sessionStorage.setItem(SOUND_KEY, String(now));

  const context = getAudioContext();
  if (!context) return;

  if (context.state === "running") {
    scheduleLeagueCue(context);
    return;
  }

  void context.resume()
    .then(() => scheduleLeagueCue(context))
    .catch(() => {
      if (leagueAudioContext === context) leagueAudioContext = null;
      void context.close().catch(() => undefined);
    });
}
