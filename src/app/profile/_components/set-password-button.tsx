"use client";

import { BetterOAuthActionButton } from "@/components/auth/better-oauth-action-button";
import { authClient } from "@/lib/auth/auth-client";

export function SetPasswordButton({ email }: { email: string }) {
  return (
    <BetterOAuthActionButton
      variant={"outline"}
      action={() => {
        return authClient.requestPasswordReset({
          email,
          redirectTo: "/auth/reset-password",
        });
      }}
      successMessage="Password reset email sent"
    >
      Send Password Reset Email
    </BetterOAuthActionButton>
  );
}
