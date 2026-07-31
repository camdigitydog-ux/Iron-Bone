import { redirect } from "next/navigation";
import { getSession } from "@/lib/server/session";
import { BrandBadge } from "@/components/layout/BrandBadge";
import { Card } from "@/components/ui";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/");

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2">
          <BrandBadge className="h-14 w-14 drop-shadow-[0_2px_6px_rgb(var(--shadow-color)/0.4)]" />
          <h1 className="font-display text-xl font-semibold uppercase tracking-wide">Iron Bone</h1>
        </div>
        <Card className="p-6">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Sign in
          </h2>
          <LoginForm />
        </Card>
      </div>
    </div>
  );
}
