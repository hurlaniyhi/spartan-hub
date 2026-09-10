"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera } from "lucide-react";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { PlayerAvatar } from "@/components/players/PlayerAvatar";
import { useToast } from "@/components/ui/Toast";
import { savePlayer } from "@/actions/players";
import { playerFormSchema, type PlayerFormValues } from "@/lib/validation/player";
import { POSITIONS, PLAYER_STATUSES } from "@/lib/constants";
import { format } from "date-fns";

type ExistingPlayer = PlayerFormValues & { id: string; photoUrl?: string; name: string };

export function PlayerForm({ existingPlayer }: { existingPlayer?: ExistingPlayer }) {
  const router = useRouter();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string | undefined>(existingPlayer?.photoUrl);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<PlayerFormValues>({
    resolver: zodResolver(playerFormSchema),
    defaultValues: existingPlayer
      ? existingPlayer
      : {
          status: "active",
          dateJoined: format(new Date(), "yyyy-MM-dd"),
        },
  });

  const onPhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    setFormError(null);

    const formData = new FormData();
    formData.set("firstName", values.firstName);
    formData.set("lastName", values.lastName);
    if (values.nickname) formData.set("nickname", values.nickname);
    if (values.jerseyNumber !== undefined) formData.set("jerseyNumber", String(values.jerseyNumber));
    formData.set("position", values.position);
    formData.set("status", values.status);
    formData.set("dateJoined", values.dateJoined);
    if (values.bio) formData.set("bio", values.bio);
    if (photoFile) formData.set("photo", photoFile);

    const result = await savePlayer(existingPlayer?.id ?? null, formData);
    setSubmitting(false);

    if (!result.success) {
      setFormError(result.message);
      if (result.fieldErrors) {
        for (const [field, message] of Object.entries(result.fieldErrors)) {
          setError(field as keyof PlayerFormValues, { message });
        }
      }
      showToast(result.message, "error");
      return;
    }

    showToast(existingPlayer ? "Player updated successfully." : "Player added successfully.");
    router.push("/admin/players");
    router.refresh();
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <PlayerAvatar photoUrl={photoPreview} name={existingPlayer?.name ?? "New Player"} size="xl" />
        <div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            leftIcon={<Camera className="size-3.5" />}
            onClick={() => fileInputRef.current?.click()}
          >
            {photoPreview ? "Change Photo" : "Upload Photo"}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={onPhotoChange}
          />
          <p className="mt-1.5 text-xs text-gray-400">JPG, PNG or WEBP, up to 3MB.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input id="firstName" label="First Name" error={errors.firstName?.message} {...register("firstName")} />
        <Input id="lastName" label="Last Name" error={errors.lastName?.message} {...register("lastName")} />
        <Input
          id="nickname"
          label="Nickname (optional)"
          error={errors.nickname?.message}
          {...register("nickname")}
        />
        <Input
          id="jerseyNumber"
          type="number"
          label="Jersey Number (optional)"
          error={errors.jerseyNumber?.message}
          {...register("jerseyNumber", {
            setValueAs: (value) => (value === "" ? undefined : Number(value)),
          })}
        />
        <Select id="position" label="Position" error={errors.position?.message} {...register("position")}>
          <option value="">Choose a position...</option>
          {POSITIONS.map((position) => (
            <option key={position} value={position}>
              {position}
            </option>
          ))}
        </Select>
        <Select id="status" label="Status" error={errors.status?.message} {...register("status")}>
          {PLAYER_STATUSES.map((status) => (
            <option key={status} value={status} className="capitalize">
              {status === "active" ? "Active" : "Inactive"}
            </option>
          ))}
        </Select>
        <Input
          id="dateJoined"
          type="date"
          label="Date Joined"
          error={errors.dateJoined?.message}
          {...register("dateJoined")}
        />
      </div>

      <Textarea
        id="bio"
        label="Short Bio (optional)"
        placeholder="A sentence or two about this player..."
        error={errors.bio?.message}
        {...register("bio")}
      />

      {formError && (
        <p className="rounded-xl bg-accent-light px-3.5 py-2.5 text-sm font-medium text-accent-dark">
          {formError}
        </p>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" variant="accent" size="lg" loading={submitting}>
          {existingPlayer ? "Save Changes" : "Add Player"}
        </Button>
        <Button type="button" variant="outline" size="lg" href="/admin/players">
          Cancel
        </Button>
      </div>
    </form>
  );
}
