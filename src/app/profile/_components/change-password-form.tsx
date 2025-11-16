"use client";

import { LoadingSwap } from "@/components/LoadingSwap";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
  revokeOtherSessions: z.boolean(),
});

type ChangePasswordForm = z.infer<typeof changePasswordSchema>;

export function ChangePasswordForm() {
  const router = useRouter();
  const form = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      revokeOtherSessions: true,
    },
  });

  const { isSubmitting } = form.formState;

  async function handlePasswordChange(data: ChangePasswordForm) {
    await authClient.changePassword(data, {
      onSuccess: () => {
        toast.success("password is updated");
        form.reset();
      },
      onError: (error) => {
        toast.error(error.error.message || "faild to update your password");
      },
    });
  }

  return (
    <Form {...form}>
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit(handlePasswordChange)}
      >
        <FormField
          control={form.control}
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Password</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="revokeOtherSessions"
          render={({ field }) => (
            <FormItem className="flex">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel>Logout Other Sessions</FormLabel>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting} className="w-full">
          <LoadingSwap isLoading={isSubmitting}>Update Password</LoadingSwap>
        </Button>
      </form>
    </Form>
  );
}
