"use client";

import { LoadingSwap } from "@/components/LoadingSwap";
import { Button } from "@/components/ui/button";
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

const profileUpdateSchema = z.object({
  name: z.string().min(1),
  email: z.email().min(1),
  favoriteNumber: z.number().int(),
});

type ProfileUpdateForm = z.infer<typeof profileUpdateSchema>;

export function ProfileUpdateForm({
  user,
}: {
  user: { name: string; email: string; favoriteNumber: number };
}) {
  const router = useRouter();
  const form = useForm<ProfileUpdateForm>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: user,
  });

  const { isSubmitting } = form.formState;

  async function handleProfileUpdate(data: ProfileUpdateForm) {
    const promises = [
      authClient.updateUser({
        name: data.name,
        favoriteNumber: data.favoriteNumber,
      }),
    ];

    if (data.email !== user.email)
      promises.push(
        authClient.changeEmail({ newEmail: data.email, callbackURL: "/" })
      );

    const res = await Promise.all(promises);

    console.log(res);
    const updateUserReselt = res[0];
    const emailResult = res[1] ?? { error: false };
    if (updateUserReselt.error)
      toast.error(
        updateUserReselt.error.message ||
          "faild to update profile'name and favorite number"
      );
    else if (emailResult.error)
      toast.error(emailResult.error.message || "faild to update email");
    else {
      if (data.email != user.email)
        toast.success("Verify your new email address to complete the change");
      else toast.success("Profile updated successfully");
      router.refresh();
    }
  }

  return (
    <Form {...form}>
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit(handleProfileUpdate)}
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="favoriteNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Favoite Number</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting} className="w-full">
          <LoadingSwap isLoading={isSubmitting}>Update Profile</LoadingSwap>
        </Button>
      </form>
    </Form>
  );
}
