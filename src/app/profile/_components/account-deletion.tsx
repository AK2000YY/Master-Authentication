"use client";

import { BetterOAuthActionButton } from "@/components/auth/better-oauth-action-button";
import { authClient } from "@/lib/auth/auth-client";

export function AccountDeletion() {
  return (
    <BetterOAuthActionButton
      requireAreYouSure
      action={() => authClient.deleteUser({ callbackURL: "/" })}
      variant="destructive"
      className="w-full"
      successMessage="Account deletion initiated. Please check your email to confirm."
    >
      Delete Account Permently
    </BetterOAuthActionButton>
  );
}
