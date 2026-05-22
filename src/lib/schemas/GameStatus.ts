import * as z from "zod"; 
 
export const GameStatusSchema = z.discriminatedUnion("status", [
    z.object({ status: z.literal("playing") }),
    z.object({ status: z.literal("won") }),
    z.object({ status: z.literal("lost") }),
]);

export type GameStatus = z.infer<typeof GameStatusSchema>