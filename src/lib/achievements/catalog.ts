import type { AchievementId, GameStats } from "$lib/schemas/UserProfile";

export const ACHIEVEMENTS: Record<AchievementId, {
  title: string;
  description: string;
  check?: (stats: GameStats) => boolean;
  targetValue?: number;
}> = {
  completedWithoutFlags: {
    title: 'Minimalist',
    description: 'Win without placing any flags',
  },
  solvedUnder30s: {
    title: 'Speed Demon',
    description: 'Complete a game in under 30 seconds',
  },
  wonOnHard: {
    title: 'Warrior',
    description: 'Win a game on the hard difficulty',
  },
  played100Games: {
    title: 'Hardcore',
    description: 'Played 100 games',
  },
  // ...
};