"use client";

import { Button } from "@workspace/ui/components/button";
import { Label } from "@workspace/ui/components/label";
import { PasswordInput } from "@workspace/ui/components/password-input";
import { FieldInfo } from "@workspace/ui/components/field-info";
import { useForm } from "@workspace/ui/lib/react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { toast } from "@workspace/ui/lib/sonner";
import { STORAGE_KEYS } from "@/utils/constants";
import { getAccountById, updateAccount } from "@/services/auth";

const formSchema = z
  .object({
    current_password: z.string().min(1, "Current password is required"),
    new_password: z.string().min(6, "New password must be at least 6 characters"),
    new_password_confirmation: z.string().min(1, "Confirm your new password"),
  })
  .refine((value) => value.new_password === value.new_password_confirmation, {
    path: ["new_password_confirmation"],
    message: "Passwords do not match",
  });

export default function ChangePasswordPage() {
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: updateAccount,
    onSuccess: async () => {
      const currentUser = localStorage.getItem(STORAGE_KEYS.USER);
      if (currentUser) {
        const user = JSON.parse(currentUser);
        const updatedUser = await getAccountById(user.id.toString());
        if (updatedUser?.data) {
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser.data));
        }
      }

      toast.success("Password changed successfully");
      router.push("/d");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Failed to change password"
      );
    },
  });

  const form = useForm({
    defaultValues: {
      current_password: "",
      new_password: "",
      new_password_confirmation: "",
    },
    validators: {
      onSubmit: formSchema,
      onChange: formSchema,
    },
    onSubmit: async ({ value }) => {
      mutation.mutate({
        current_password: value.current_password,
        new_password: value.new_password,
      });
    },
  });

  return (
    <div className="flex min-h-svh items-center justify-center bg-white px-4">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void form.handleSubmit();
        }}
        className="w-full max-w-md space-y-5 rounded-md border border-gray-200 p-6"
      >
        <div>
          <h1 className="text-2xl font-bold text-primary">Change Password</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Set a new password before continuing.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="current_password">Current Password</Label>
          <form.Field
            name="current_password"
            children={(field) => (
              <>
                <PasswordInput
                  id="current_password"
                  className="h-[48px]"
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                />
                <FieldInfo field={field} />
              </>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="new_password">New Password</Label>
          <form.Field
            name="new_password"
            children={(field) => (
              <>
                <PasswordInput
                  id="new_password"
                  className="h-[48px]"
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                />
                <FieldInfo field={field} />
              </>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="new_password_confirmation">Confirm New Password</Label>
          <form.Field
            name="new_password_confirmation"
            children={(field) => (
              <>
                <PasswordInput
                  id="new_password_confirmation"
                  className="h-[48px]"
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                />
                <FieldInfo field={field} />
              </>
            )}
          />
        </div>

        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <Button
              type="submit"
              className="h-[48px] w-full"
              disabled={!canSubmit || mutation.isPending}
            >
              {mutation.isPending || isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Change Password"
              )}
            </Button>
          )}
        />
      </form>
    </div>
  );
}
