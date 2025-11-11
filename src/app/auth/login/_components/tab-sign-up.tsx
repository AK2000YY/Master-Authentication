"use client";

import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/LoadingSwap";
import { authClient } from "@/lib/auth/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const signupSchema = z.object({
  email: z.email().min(1),
  password: z.string().min(6),
  name: z.string().min(1),
});

type SignupForm = z.infer<typeof signupSchema>;

export function SignupTab({
  openEmailVerificationTab,
}: {
  openEmailVerificationTab: (email: string) => void;
}) {
  const router = useRouter();
  const form = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const { isSubmitting } = form.formState;

  async function handleSignup(data: SignupForm) {
    const res = await authClient.signUp.email(
      { ...data, callbackURL: "/" },
      {
        onError: (error) => {
          toast.error(error.error.message || "something went wrong!");
        },
      }
    );
    if (res.error == null && !res.data.user.emailVerified)
      openEmailVerificationTab(res.data.user.email);
  }

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(handleSignup)}>
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
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting} className="w-full">
          <LoadingSwap isLoading={isSubmitting}>Sign Up</LoadingSwap>
        </Button>
      </form>
    </Form>
  );
}
