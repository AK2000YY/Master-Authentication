import { BetterOAuthActionButton } from "@/components/auth/better-oauth-action-button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { authClient } from "@/lib/auth/auth-client";
import { CreateInviteButton } from "./create-invite-button";

export function InvitationsTab() {
  const { data: activeOrganization } = authClient.useActiveOrganization();
  const pendingInvites = activeOrganization?.invitations.filter(
    (invite) => invite.status == "pending"
  );

  function cancelInvition(id: string) {
    return authClient.organization.cancelInvitation({ invitationId: id });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <CreateInviteButton />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Expires</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pendingInvites?.map((invite) => (
            <TableRow key={invite.id}>
              <TableCell>{invite.email}</TableCell>
              <TableCell>
                <Badge variant="outline">{invite.role}</Badge>
              </TableCell>
              <TableCell>
                {new Date(invite.expiresAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <BetterOAuthActionButton
                  variant="destructive"
                  size="sm"
                  action={() => cancelInvition(invite.id)}
                >
                  Cancel
                </BetterOAuthActionButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
