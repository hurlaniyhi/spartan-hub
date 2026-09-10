import { PlayerForm } from "@/components/admin/PlayerForm";

export default function NewPlayerPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl font-bold text-gray-900">Add Player</h1>
      <p className="mt-1 mb-6 text-sm text-gray-500">Add a new player to the Spartan FC squad.</p>
      <PlayerForm />
    </div>
  );
}
