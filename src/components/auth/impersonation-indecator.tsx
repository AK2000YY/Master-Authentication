"use client";

import { authClient } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";
import { BetterOAuthActionButton } from "./better-oauth-action-button";
import { UserX } from "lucide-react";

export function ImpersonationIndecator() {
  const router = useRouter();
  const { data: session, refetch } = authClient.useSession();

  if (session?.session.impersonatedBy === null) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <BetterOAuthActionButton
        action={() =>
          authClient.admin.stopImpersonating(undefined, {
            onSuccess: () => {
              router.push("/admin");
              refetch();
            },
          })
        }
        size={"sm"}
        variant="destructive"
      >
        <UserX className="size-4" />
      </BetterOAuthActionButton>
    </div>
  );
}
