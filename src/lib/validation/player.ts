import { z } from "zod";
import { POSITIONS, PLAYER_STATUSES } from "@/lib/constants";

export const playerFormSchema = z.object({
  firstName: z.string().trim().min(1, "Please enter the player's first name."),
  lastName: z.string().trim().max(60, "Last name is too long.").optional(),
  nickname: z.string().trim().max(40, "Nickname is too long.").optional(),
  jerseyNumber: z
    .number({ error: "Jersey number must be a number." })
    .int()
    .min(0, "Jersey number can't be negative.")
    .max(99, "Jersey number must be 99 or less.")
    .optional(),
  position: z.enum(POSITIONS, {
    error: "Please choose a position.",
  }),
  status: z.enum(PLAYER_STATUSES),
  dateJoined: z
    .string()
    .min(1, "Please enter the date this player joined.")
    .refine((value) => !Number.isNaN(Date.parse(value)), "Please enter a valid date."),
  bio: z.string().trim().max(1000, "Bio must be 1000 characters or fewer.").optional(),
  phoneNumber: z.string().trim().max(30, "Phone number is too long.").optional(),
  homeAddress: z.string().trim().max(200, "Home address is too long.").optional(),
});

export type PlayerFormValues = z.infer<typeof playerFormSchema>;
