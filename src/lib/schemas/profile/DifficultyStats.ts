import * as z from "zod";

export const difficultyStatsSchema = z.object({
    gamesPlayed: z.number(),
    gamesWon: z.number(),
    fastestTime: z.number().nullable(),
    averageTime: z.number().nullable()
})

export type DifficultyStats = z.infer<typeof difficultyStatsSchema>
