import * as z from "zod";

export const SettingsSchema = z.object({
    rows: z.number(),
    cols: z.number(),
    bombs: z.number()
});

export type Settings = z.infer<typeof SettingsSchema>