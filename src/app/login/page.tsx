"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    setLoading(false);
    if (result?.error) {
      setError("Email ou mot de passe incorrect");
      return;
    }
    router.push(searchParams.get("callbackUrl") ?? "/");
    router.refresh();
  }

  return (
    <AuthShell
      title="Bon retour parmi tes plantes"
      subtitle="Connecte-toi pour retrouver ton jardin."
      footer={
        <>
          Pas encore de compte ?{" "}
          <Link href="/register" className="font-semibold underline">
            Créer un compte
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Email" name="email" type="email" autoComplete="email" required />
        <Input label="Mot de passe" name="password" type="password" autoComplete="current-password" required />
        {error && <p className="text-small text-coral">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Connexion…" : "Se connecter"}
        </Button>
      </form>
    </AuthShell>
  );
}
