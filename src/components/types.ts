export const kSlow = "Slow";
export const kMedium = "Medium";
export const kFast = "Fast";
export const kFastest = "Fastest";
export const kSpeeds: Speed[] = [kSlow, kMedium, kFast, kFastest];
export type Speed = typeof kSlow | typeof kMedium | typeof kFast | typeof kFastest;
