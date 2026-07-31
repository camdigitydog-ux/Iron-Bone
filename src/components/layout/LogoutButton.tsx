import { logout } from "@/lib/auth/actions";
import { Button } from "@/components/ui";

export function LogoutButton({ className }: { className?: string }) {
  return (
    <form action={logout}>
      <Button type="submit" variant="ghost" size="sm" className={className}>
        Sign out
      </Button>
    </form>
  );
}
