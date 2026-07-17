"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";

const PLAYBACK_RATES = [1, 1.5, 2];
const WAVEFORM_BARS = 30;

function formatSeconds(value: number) {
  if (!Number.isFinite(value) || value < 0) return "0:00";
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

// Deterministic pseudo-waveform seeded from the audio payload so each voice
// note gets its own stable shape without decoding the audio.
function waveformHeights(seed: string) {
  const heights: number[] = [];
  let hash = 2166136261;
  const step = Math.max(1, Math.floor(seed.length / 240));
  for (let index = 0; index < seed.length; index += step) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  let value = hash >>> 0;
  for (let bar = 0; bar < WAVEFORM_BARS; bar += 1) {
    value = Math.imul(value ^ (value >>> 15), 2246822519) >>> 0;
    const normalized = 0.25 + ((value % 1000) / 1000) * 0.75;
    heights.push(normalized);
  }
  return heights;
}

export function AudioBubble({
  src,
  durationSeconds,
  tone = "peer",
}: {
  src: string;
  durationSeconds?: number;
  tone?: "own" | "peer";
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(durationSeconds ?? 0);
  const [rateIndex, setRateIndex] = useState(0);

  const heights = useMemo(() => waveformHeights(src.slice(-2400)), [src]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => setCurrentTime(audio.currentTime);
    const onLoaded = () => {
      // Some recorded webm blobs report Infinity; keep the recorded duration then.
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
    };
    const onEnded = () => {
      setPlaying(false);
      setCurrentTime(0);
    };
    const onPause = () => setPlaying(false);
    const onPlay = () => setPlaying(true);

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("durationchange", onLoaded);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("play", onPlay);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("durationchange", onLoaded);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("play", onPlay);
    };
  }, []);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      void audio.play().catch(() => undefined);
    }
  }

  function cycleRate() {
    const nextIndex = (rateIndex + 1) % PLAYBACK_RATES.length;
    setRateIndex(nextIndex);
    if (audioRef.current) audioRef.current.playbackRate = PLAYBACK_RATES[nextIndex];
  }

  function scrub(nextValue: number) {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(effectiveDuration) || effectiveDuration <= 0) return;
    audio.currentTime = nextValue;
    setCurrentTime(nextValue);
  }

  const effectiveDuration = duration || durationSeconds || 0;
  const progress = effectiveDuration > 0 ? Math.min(1, currentTime / effectiveDuration) : 0;
  const own = tone === "own";
  const playedBars = Math.round(progress * WAVEFORM_BARS);

  return (
    <div
      className={cn(
        "flex w-64 max-w-full items-center gap-3 rounded-2xl px-1 py-1",
        own ? "text-black" : "text-text-primary",
      )}
    >
      <audio ref={audioRef} src={src} preload="metadata" />
      <button
        type="button"
        onClick={togglePlay}
        className={cn(
          "grid h-10 w-10 shrink-0 place-items-center rounded-full transition",
          own
            ? "bg-black/15 hover:bg-black/25"
            : "border border-accent/30 bg-accent/12 text-accent hover:bg-accent/20",
        )}
        aria-label={playing ? "Pause voice note" : "Play voice note"}
      >
        {playing ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4" />}
      </button>
      <div className="min-w-0 flex-1">
        <div className="relative h-9">
          <div className="pointer-events-none absolute inset-0 flex items-center gap-[2px]" aria-hidden="true">
            {heights.map((height, index) => (
              <span
                key={index}
                className={cn(
                  "min-w-0 flex-1 rounded-full transition-colors duration-150",
                  index < playedBars
                    ? own
                      ? "bg-black/75"
                      : "bg-accent"
                    : own
                      ? "bg-black/25"
                      : "bg-white/20",
                )}
                style={{ height: `${Math.round(height * 100)}%` }}
              />
            ))}
          </div>
          <input
            type="range"
            min={0}
            max={effectiveDuration || 1}
            step={0.1}
            value={Math.min(currentTime, effectiveDuration || 1)}
            onChange={(event) => scrub(Number(event.target.value))}
            aria-label="Seek voice note"
            className="chat-waveform-range absolute inset-0 w-full cursor-pointer opacity-0"
          />
        </div>
        <div
          className={cn(
            "mt-0.5 flex items-center justify-between font-mono text-[0.62rem] tabular-nums",
            own ? "text-black/60" : "text-text-muted",
          )}
        >
          <span>
            {formatSeconds(currentTime)} / {formatSeconds(effectiveDuration)}
          </span>
          <button
            type="button"
            onClick={cycleRate}
            className={cn(
              "rounded-full px-1.5 py-0.5 font-bold uppercase transition",
              own ? "bg-black/10 hover:bg-black/20" : "bg-white/[0.06] hover:bg-white/[0.12]",
            )}
            aria-label="Change playback speed"
          >
            {PLAYBACK_RATES[rateIndex]}x
          </button>
        </div>
      </div>
    </div>
  );
}
