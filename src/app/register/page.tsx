"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { registerAction, type ActionResult } from "@/server/actions/auth-actions";

const initialState: ActionResult = { success: false };

export default function RegisterPage() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(registerAction, initialState);

  useEffect(() => {
    if (state.success) {
      router.push("/onboarding");
      router.refresh();
    }
  }, [state.success, router]);

  return (
    <AuthShell
      title="Rejoins Le Jardin de Bloom"
      subtitle="Petite plante, grande aventure !"
      footer={
        <>
          Déjà un compte ?{" "}
          <Link href="/login" className="font-semibold underline">
            Se connecter
          </Link>
        </>
      }
    >
      <form action={formAction} className="space-y-4">
        <Input label="Prénom" name="name" autoComplete="given-name" required />
        <Input label="Email" name="email" type="email" autoComplete="email" required />
        <Input
          label="Mot de passe"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          hint="8 caractères minimum"
          required
        />
        {state.error && <p className="text-small text-coral">{state.error}</p>}
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Création…" : "Créer mon compte"}
        </Button>
      </form>
    </AuthShell>
  );
}
