import * as z from "zod";


export const GameInteractionsSchema = z.object({
    leftClicks: z.number(),
    rightClicks: z.number(),
    undoFlags: z.number(),
    chords: z.number(),
    duplicateChords: z.number()
})

export type GameInteractions = z.infer<typeof GameInteractionsSchema>