import { z } from "zod";
import { SESSION_TYPES, MATCH_OUTCOMES } from "@/lib/constants";

export const sessionFormSchema = z.object({
  type: z.enum(SESSION_TYPES, { error: "Please choose training or match." }),
  date: z
    .string()
    .min(1, "Please choose a date.")
    .refine((value) => !Number.isNaN(Date.parse(value)), "Please choose a valid date."),
  opponent: z.string().trim().max(100).optional(),
  venue: z.string().trim().max(100).optional(),
  result: z.string().trim().max(100).optional(),
  outcome: z.enum(MATCH_OUTCOMES).optional(),
  notes: z.string().trim().max(2000).optional(),
});

export type SessionFormValues = z.infer<typeof sessionFormSchema>;

export const performanceEntrySchema = z.object({
  playerId: z.string().min(1),
  attended: z.boolean(),
  goals: z.number().int().min(0, "Goals can't be negative."),
  assists: z.number().int().min(0, "Assists can't be negative."),
});

export const sessionSaveSchema = z.object({
  session: sessionFormSchema,
  performances: z.array(performanceEntrySchema),
});

export type SessionSavePayload = z.infer<typeof sessionSaveSchema>;
