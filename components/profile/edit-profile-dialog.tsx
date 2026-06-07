"use client";

import { useState, useTransition } from "react";
import { Loader2Icon } from "lucide-react";
import { toast } from "sonner";

import { updateProfile } from "@/app/actions/update-profile";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MAX_BIO_LENGTH, MAX_NAME_LENGTH } from "@/validations/profile";

type EditProfileDialogProps = {
  name: string | null;
  bio: string | null;
};

/**
 * Edit-profile dialog for the current user. Pre-fills name/bio, validates and
 * submits via the `updateProfile` server action, with loading and success
 * states. Only rendered on the user's own profile.
 */
export function EditProfileDialog({ name, bio }: EditProfileDialogProps) {
  const [open, setOpen] = useState(false);
  const [nameValue, setNameValue] = useState(name ?? "");
  const [bioValue, setBioValue] = useState(bio ?? "");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (isPending) return;

    const formData = new FormData();
    formData.append("name", nameValue);
    formData.append("bio", bioValue);

    startTransition(async () => {
      const result = await updateProfile(formData);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Profile updated.");
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="transition-all hover:border-ring hover:bg-muted hover:shadow-sm active:scale-95"
        >
          Edit profile
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Update your name and bio. Your username can&apos;t be changed.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profile-name">Name</Label>
            <Input
              id="profile-name"
              name="name"
              value={nameValue}
              maxLength={MAX_NAME_LENGTH}
              onChange={(event) => setNameValue(event.target.value)}
              placeholder="Your name"
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-bio">Bio</Label>
            <Textarea
              id="profile-bio"
              name="bio"
              value={bioValue}
              maxLength={MAX_BIO_LENGTH}
              onChange={(event) => setBioValue(event.target.value)}
              placeholder="Tell people about yourself"
              rows={3}
              disabled={isPending}
            />
            <p className="text-right text-xs text-muted-foreground">
              {bioValue.length}/{MAX_BIO_LENGTH}
            </p>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2Icon className="animate-spin" />
                  Saving...
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
