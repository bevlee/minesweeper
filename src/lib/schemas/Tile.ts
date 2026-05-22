
import * as z from "zod"; 
 
export const TileValue = z.union([
  z.string().regex(/^[1-8]$/),
  z.literal("💣"),
  z.literal(""),
]);

export type TileValue  = z.infer<typeof TileValue>

export const TileSchema = z.object({ 
  value: TileValue,
  status: z.enum(["flag", "hidden", "shown", "bomb"]),
});

export type Tile = z.infer<typeof TileSchema>