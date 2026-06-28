import * as z from "zod";
import { difficultyStatsSchema } from "./DifficultyStats";
import { AchievementIdSchema } from "./AchievementId";

export const UserProfileSchema = z.object({
    easy: difficultyStatsSchema,
    medium: difficultyStatsSchema,
    hard: difficultyStatsSchema,
    achievements: z.array(AchievementIdSchema)
})

export type UserProfile = z.infer<typeof UserProfileSchema>
