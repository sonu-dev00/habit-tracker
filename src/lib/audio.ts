"use client";

import { useCallback } from "react";
import { useSettingsStore } from "@/store";

const AudioContextCtor: typeof AudioContext | null = typeof window !== "undefined" ? window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext : null;

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (!AudioContextCtor) return null;
  if (!audioCtx) audioCtx = new AudioContextCtor();
  if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

function playTone(frequency: number, duration: number, type: OscillatorType = "sine", volume = 0.15) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

  gainNode.gain.setValueAtTime(volume, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + duration);
}

function playNoteSequence(notes: { freq: number; duration: number; delay: number }[], type: OscillatorType = "sine") {
  notes.forEach(({ freq, duration, delay }) => {
    setTimeout(() => playTone(freq, duration, type), delay * 1000);
  });
}

export function playLevelUpSound() {
  playNoteSequence([
    { freq: 523.25, duration: 0.15, delay: 0 },
    { freq: 659.25, duration: 0.15, delay: 0.1 },
    { freq: 783.99, duration: 0.15, delay: 0.2 },
    { freq: 1046.50, duration: 0.4, delay: 0.3 },
  ], "sine");
}

export function playRankUpSound() {
  playNoteSequence([
    { freq: 440, duration: 0.2, delay: 0 },
    { freq: 554.37, duration: 0.2, delay: 0.15 },
    { freq: 659.25, duration: 0.2, delay: 0.3 },
    { freq: 880, duration: 0.3, delay: 0.45 },
    { freq: 1108.73, duration: 0.5, delay: 0.6 },
  ], "triangle");
}

export function playAchievementSound() {
  playNoteSequence([
    { freq: 784, duration: 0.1, delay: 0 },
    { freq: 988, duration: 0.1, delay: 0.08 },
    { freq: 1175, duration: 0.1, delay: 0.16 },
    { freq: 1319, duration: 0.3, delay: 0.24 },
  ], "sine");
}

export function playQuestCompleteSound() {
  playNoteSequence([
    { freq: 659.25, duration: 0.15, delay: 0 },
    { freq: 783.99, duration: 0.15, delay: 0.12 },
    { freq: 1046.50, duration: 0.3, delay: 0.24 },
  ], "sine");
}

export function playQuestAcceptSound() {
  playNoteSequence([
    { freq: 392, duration: 0.1, delay: 0 },
    { freq: 523.25, duration: 0.15, delay: 0.1 },
  ], "triangle");
}

export function playDungeonStartSound() {
  playNoteSequence([
    { freq: 220, duration: 0.3, delay: 0 },
    { freq: 294, duration: 0.3, delay: 0.2 },
    { freq: 369.99, duration: 0.3, delay: 0.4 },
    { freq: 440, duration: 0.5, delay: 0.6 },
  ], "sawtooth");
}

export function playBossDefeatedSound() {
  playNoteSequence([
    { freq: 440, duration: 0.2, delay: 0 },
    { freq: 554.37, duration: 0.2, delay: 0.15 },
    { freq: 659.25, duration: 0.3, delay: 0.3 },
    { freq: 880, duration: 0.4, delay: 0.5 },
    { freq: 1108.73, duration: 0.6, delay: 0.7 },
  ], "square");
}

export function playCoinSound() {
  playTone(1318.51, 0.1, "sine", 0.1);
  setTimeout(() => playTone(1568, 0.1, "sine", 0.1), 50);
}

export function useSoundEffects() {
  const soundEnabled = useSettingsStore((s) => s.soundEnabled);

  const play = useCallback((soundFn: () => void) => {
    if (!soundEnabled) return;
    soundFn();
  }, [soundEnabled]);

  return {
    playLevelUp: useCallback(() => play(playLevelUpSound), [play]),
    playRankUp: useCallback(() => play(playRankUpSound), [play]),
    playAchievement: useCallback(() => play(playAchievementSound), [play]),
    playQuestComplete: useCallback(() => play(playQuestCompleteSound), [play]),
    playQuestAccept: useCallback(() => play(playQuestAcceptSound), [play]),
    playDungeonStart: useCallback(() => play(playDungeonStartSound), [play]),
    playBossDefeated: useCallback(() => play(playBossDefeatedSound), [play]),
    playCoin: useCallback(() => play(playCoinSound), [play]),
  };
}
