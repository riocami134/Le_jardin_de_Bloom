import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Ton prénom nous aidera à mieux t'accueillir").max(80),
  email: z.string().trim().toLowerCase().email("Adresse email invalide"),
  password: z.string().min(8, "8 caractères minimum"),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Adresse email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});
export type LoginInput = z.infer<typeof loginSchema>;
