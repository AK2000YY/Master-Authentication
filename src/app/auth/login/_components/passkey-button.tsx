"use client";

import { BetterOAuthActionButton } from "@/components/auth/better-oauth-action-button";
import { authClient } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";

export function PasskeyButton() {
  const router = useRouter();
  const { refetch } = authClient.useSession();
  return (
    <BetterOAuthActionButton
      action={() =>
        authClient.signIn.passkey(undefined, {
          onSuccess: () => {
            refetch();
            router.push("/");
          },
        })
      }
      variant="outline"
      className="w-full"
    >
      Use Passkey
    </BetterOAuthActionButton>
  );
}
