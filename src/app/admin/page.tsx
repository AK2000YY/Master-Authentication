import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { auth } from "@/lib/auth/auth";
import { ArrowLeft, Users } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { UserRow } from "./__components/user-row";

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session == null) return redirect("/");
  const hasAccess = await auth.api.userHasPermission({
    headers: await headers(),
    body: { permission: { user: ["list"] } },
  });
  if (!hasAccess.success) return redirect("/");

  const users = await auth.api.listUsers({
    headers: await headers(),
    query: { limit: 100, sortBy: "createdAt", sortDirection: "desc" },
  });

  return (
    <div className="my-6 px-4 w-full mx-auto">
      <Link href="/" className="inline-flex items-center mb-6">
        <ArrowLeft className="size-4 mr-2" />
        Back to Home
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>
            <Users className="h-5 w-5" />
            Users {users.total}
          </CardTitle>
          <CardDescription>
            Manage users account, role, permission.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.users.map((user) => (
                  <UserRow key={user.id} user={user} selfId={session.user.id} />
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
