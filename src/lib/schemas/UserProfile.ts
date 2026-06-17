
import * as z from "zod"; 


export const gameStatsSchema = z.object({
    gamesPlayed: z.number(),
    gamesWon: z.number(),
    fastestTime: z.number(),
    averageTime: z.number()
})

export type GameStats = z.infer<typeof gameStatsSchema>

export const AchievementIdSchema = z.enum([
  'completedWithoutFlags',
  'solvedUnder30s',
  'wonOnHard',
  'played100Games',
]);
export type AchievementId = z.infer<typeof AchievementIdSchema>;

export const UserProfileSchema = z.object({
    easy: gameStatsSchema,
    medium: gameStatsSchema,
    hard: gameStatsSchema,
    achievements:  z.array(AchievementIdSchema)
})

export type UserProfile = z.infer<typeof UserProfileSchema>

