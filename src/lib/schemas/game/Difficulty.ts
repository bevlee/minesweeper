import * as z from "zod";

export const DifficultySchema = z.union([
    z.literal("easy"),
    z.literal("medium"),
    z.literal("hard"),
]);

export type Difficulty = z.infer<typeof DifficultySchema>