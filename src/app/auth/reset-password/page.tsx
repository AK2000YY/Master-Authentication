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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const resetPasswordSchema = z.object({
  password: z.string().min(6),
});

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword({
  openSigninTab,
}: {
  openSigninTab: () => void;
}) {
  const router = useRouter();

  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const error = searchParams.get("error");

  const form = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
    },
  });

  const { isSubmitting } = form.formState;

  async function handleResetPassword(data: ResetPasswordForm) {
    await authClient.resetPassword(
      {
        newPassword: data.password,
        token: token!,
      },
      {
        onError: (error) => {
          toast.error(error.error.message || "Failed to reset password");
        },
        onSuccess: () => {
          toast.success("Password is reset", {
            description: "Redirecting to login...",
          });
          setTimeout(() => {
            router.push("/auth/login");
          }, 1000);
        },
      }
    );
  }

  if (token == null || error != null) {
    return (
      <div className="my-6 px-4">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Invalid Reset Link</CardTitle>
            <CardDescription>
              The password reset link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" asChild>
              <Link href="/auth/login">Back to Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Reset Password</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              className="space-y-4"
              onSubmit={form.handleSubmit(handleResetPassword)}
            >
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
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex-1"
              >
                <LoadingSwap isLoading={isSubmitting}>
                  Reset Password
                </LoadingSwap>
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
