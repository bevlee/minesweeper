import * as z from "zod";
import { RowSchema } from "./Row";

export const Grid = z.array(
    RowSchema
);