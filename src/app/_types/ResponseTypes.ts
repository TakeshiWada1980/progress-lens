import { z } from "zod";
import { cuidSchema } from "./SessionTypes";

export const postResponseRequestSchema = z.object({
  optionId: cuidSchema,
});

export type PostResponseRequest = z.infer<typeof postResponseRequestSchema>;
