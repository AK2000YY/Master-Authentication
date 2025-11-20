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
import { PasskeyButton } from "./passkey-button";

const signinSchema = z.object({
  email: z.email().min(1),
  password: z.string().min(6),
});

type SigninForm = z.infer<typeof signinSchema>;

export function SigninTab({
  openEmailVerificationTab,
  openForgetPasswordTab,
}: {
  openEmailVerificationTab: (email: string) => void;
  openForgetPasswordTab: () => void;
}) {
  const router = useRouter();
  const form = useForm<SigninForm>({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { isSubmitting } = form.formState;

  async function handleSignin(data: SigninForm) {
    const res = await authClient.signIn.email(
      { ...data, callbackURL: "/" },
      {
        onError: (error) => {
          if (error.error.code === "EMAIL_NOT_VERIFIED")
            openEmailVerificationTab(data.email);
          toast.error(error.error.message || "something went wrong!");
        },
        onSuccess: () => {
          router.push("/");
        },
      }
    );
  }

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(handleSignin)}>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    autoComplete="email webauthn"
                    type="email"
                    {...field}
                  />
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
                <div className="flex justify-between items-center">
                  <FormLabel>Password</FormLabel>
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="text-sm font-normal underline"
                    onClick={openForgetPasswordTab}
                  >
                    Forgot Password?
                  </Button>
                </div>
                <FormControl>
                  <Input
                    type="password"
                    autoComplete="current-password webauthn"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isSubmitting} className="w-full">
            <LoadingSwap isLoading={isSubmitting}>Sign In</LoadingSwap>
          </Button>
        </form>
      </Form>
      <PasskeyButton />
    </div>
  );
}
