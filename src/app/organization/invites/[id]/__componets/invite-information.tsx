"use client";

import { BetterOAuthActionButton } from "@/components/auth/better-oauth-action-button";
import { authClient } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";

export function InviteInformation({
  invitations,
}: {
  invitations: { id: string; organizationId: string };
}) {
  const router = useRouter();

  function acceptInvite() {
    return authClient.organization.acceptInvitation(
      {
        invitationId: invitations.id,
      },
      {
        onSuccess: async () => {
          await authClient.organization.setActive({
            organizationId: invitations.organizationId,
          });
          router.push("/organization");
        },
      }
    );
  }

  function rejectInvite() {
    return authClient.organization.rejectInvitation(
      {
        invitationId: invitations.id,
      },
      {
        onSuccess: () => {
          router.push("/");
        },
      }
    );
  }

  return (
    <div className="flex gap-2">
      <BetterOAuthActionButton action={acceptInvite} className="flex-grow">
        Accept
      </BetterOAuthActionButton>
      <BetterOAuthActionButton
        action={rejectInvite}
        className="flex-grow"
        variant="destructive"
      >
        Reject
      </BetterOAuthActionButton>
    </div>
  );
}
