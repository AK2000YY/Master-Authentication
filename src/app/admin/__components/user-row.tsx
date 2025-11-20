"use client";

import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserWithRole } from "better-auth/plugins/admin";
import { Button } from "@/components/ui/button";
import { MoreHorizontalIcon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTrigger,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";
import { toast } from "sonner";

export function UserRow({
  user,
  selfId,
}: {
  user: UserWithRole;
  selfId: string;
}) {
  const isSelf = user.id === selfId;
  const router = useRouter();
  const { refetch } = authClient.useSession();

  function handleImpersonalUser(userId: string) {
    authClient.admin.impersonateUser(
      { userId },
      {
        onError: (error) => {
          toast.error(error.error.message || "faild to impersonate user");
        },
        onSuccess: () => {
          refetch();
          router.push("/");
        },
      }
    );
  }

  function handleRevokeSessions(userId: string) {
    authClient.admin.revokeUserSessions(
      { userId },
      {
        onError: (error) => {
          toast.error(error.error.message || "faild to revoke user sessions");
        },
        onSuccess: () => {
          toast.success("revoke user sessions");
        },
      }
    );
  }

  function handleUnbanUser(userId: string) {
    authClient.admin.unbanUser(
      { userId },
      {
        onError: (error) => {
          toast.error(error.error.message || "faild to unban user");
        },
        onSuccess: () => {
          toast.success("user unban");
          router.refresh();
        },
      }
    );
  }

  function handleBanUser(userId: string) {
    authClient.admin.banUser(
      { userId },
      {
        onError: (error) => {
          toast.error(error.error.message || "faild to ban user");
        },
        onSuccess: () => {
          toast.success("user ban");
          router.refresh();
        },
      }
    );
  }

  function handleDeleteUser(userId: string) {
    authClient.admin.removeUser(
      { userId },
      {
        onError: (error) => {
          toast.error(error.error.message || "faild to remove user");
        },
        onSuccess: () => {
          toast.success("remove user");
          router.refresh();
        },
      }
    );
  }

  return (
    <TableRow>
      <TableCell>
        <div>
          <div className="font-medium">{user.name || "no name"}</div>
          <div className="text-sm text-muted-foreground">{user.email}</div>
          <div className="flex items-center gap-2 not-empty:mt-2">
            {user.banned && <Badge variant={"destructive"}>Banned</Badge>}
            {!user.emailVerified && <Badge variant="outline">Unverified</Badge>}
            {isSelf && <Badge>You</Badge>}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={user.role === "admin" ? "default" : "secondary"}>
          {user.role}
        </Badge>
      </TableCell>
      <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
      <TableCell>
        {!isSelf && (
          <AlertDialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <MoreHorizontalIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleImpersonalUser(user.id)}>
                  Imporsnate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleRevokeSessions(user.id)}>
                  Revoke Session
                </DropdownMenuItem>
                {user.banned ? (
                  <DropdownMenuItem onClick={() => handleUnbanUser(user.id)}>
                    Unban User
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => handleBanUser(user.id)}>
                    Ban User
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem variant="destructive">
                    Delete User
                  </DropdownMenuItem>
                </AlertDialogTrigger>
              </DropdownMenuContent>
            </DropdownMenu>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete User</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this user? this action can't
                  be done
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleDeleteUser(user.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </TableCell>
    </TableRow>
  );
}
