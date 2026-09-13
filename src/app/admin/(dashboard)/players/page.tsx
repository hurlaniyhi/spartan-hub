import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AdminPlayerList } from "@/components/admin/AdminPlayerList";
import { getPlayerRoster } from "@/lib/stats";

export const dynamic = "force-dynamic";

export default async function AdminPlayersPage() {
  const roster = await getPlayerRoster();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Players</h1>
          <p className="mt-1 text-sm text-white/50">Manage the Spartan FC squad.</p>
        </div>
        <Button href="/admin/players/new" variant="accent" leftIcon={<UserPlus className="size-4" />}>
          Add Player
        </Button>
      </div>
      <AdminPlayerList roster={roster} />
    </div>
  );
}
