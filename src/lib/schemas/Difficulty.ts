import * as z from "zod"; 
 
export const DifficultySchema = z.union([
    z.string("Easy"),
    z.string("Medium"),
    z.string("Hard"),
]);

export type Difficulty = z.infer<typeof DifficultySchema>