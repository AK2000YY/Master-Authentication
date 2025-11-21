import { auth } from "@/lib/auth/auth";
import { ArrowLeft } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { OrganizationSelect } from "./__components/organization-select";
import { CreateOrganizationButton } from "./__components/create-organization-button";
import { OrganizationTab } from "./__components/organization-tab";

export default async function Page() {
  const sessions = await auth.api.getSession({ headers: await headers() });
  if (sessions == null) return redirect("/auth/login");

  return (
    <div className="container mx-auto my-6 px-4">
      <Link href="/" className="inline-flex items-center mb-6">
        <ArrowLeft className="size-4 mr-2" />
        Back to Home
      </Link>
      <div className="flex items-center mb-8 gap-2">
        <OrganizationSelect />
        <CreateOrganizationButton />
      </div>
      <OrganizationTab />
    </div>
  );
}
