import * as z from "zod";

export const AchievementIdSchema = z.enum([
  'completedWithoutFlags',
  'solvedUnder30s',
  'wonOnHard',
  'played100Games',
]);

export type AchievementId = z.infer<typeof AchievementIdSchema>;
