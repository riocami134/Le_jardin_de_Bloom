import { z } from "zod";

export const onboardingSchema = z.object({
  city: z.string().trim().min(1, "Indique ta ville pour la météo").max(80),
  plantLocationType: z.enum(["interieur", "balcon", "jardin", "plusieurs"]),
  pets: z.array(z.enum(["chat", "chien", "lapin"])).default([]),
  plantCountRange: z.enum(["1-5", "6-15", "16-30", "30+"]),
});
export type OnboardingInput = z.infer<typeof onboardingSchema>;
