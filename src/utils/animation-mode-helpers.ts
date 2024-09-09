import { AnimationMode } from "../types";

export const isAnimationNotRunning = (mode: AnimationMode) => mode === AnimationMode.NotRunning;
export const isAnimationRunning = (mode: AnimationMode) => mode === AnimationMode.Running;
export const isAnimationPaused = (mode: AnimationMode) => mode === AnimationMode.Paused;
export const isAnimationRunningOrPaused = (mode: AnimationMode) => isAnimationRunning(mode) || isAnimationPaused(mode);
