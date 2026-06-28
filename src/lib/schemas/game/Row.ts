import * as z from "zod";
import { TileSchema } from "./Tile";

export const RowSchema = z.array(
  TileSchema
);

export type Row = z.infer<typeof RowSchema>