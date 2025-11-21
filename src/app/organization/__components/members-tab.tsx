"use client";

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

export function MembersTab() {
  const { data: activeOrganization } = authClient.useActiveOrganization();
  const { data: session } = authClient.useSession();

  function removeMember(id: string) {
    return authClient.organization.removeMember({
      memberIdOrEmail: id,
    });
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {activeOrganization?.members.map((member) => (
          <TableRow key={member.id}>
            <TableCell>{member.user.name}</TableCell>
            <TableCell>{member.user.email}</TableCell>
            <TableCell>
              <Badge
                variant={
                  member.role === "owner"
                    ? "default"
                    : member.role === "admin"
                    ? "secondary"
                    : "outline"
                }
              >
                {member.role}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center space-x-2">
                {member.user.id != session?.user.id && (
                  <BetterOAuthActionButton
                    requireAreYouSure
                    variant="destructive"
                    size="sm"
                    action={() => removeMember(member.id)}
                  >
                    Remove
                  </BetterOAuthActionButton>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
