import * as z from "zod";
import { DifficultySchema } from "./Difficulty";
import { GameInteractionsSchema } from "./GameInteractions";


export const GameResultSchema = z.object({
    difficulty: DifficultySchema,
    won: z.boolean(),
    timeElapsed: z.number(),
    interactions: GameInteractionsSchema
})

export type GameResult = z.infer<typeof GameResultSchema>