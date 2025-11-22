"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/lib/auth/auth-client";
import { MembersTab } from "./members-tab";
import { InvitationsTab } from "./invitation-tab";
import { SubsicrptionTab } from "./subsicrption-tab";

export function OrganizationTab() {
  const { data: activeOrganization } = authClient.useActiveOrganization();

  return (
    <div className="space-y-4">
      {activeOrganization && (
        <Tabs defaultValue="members" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="invitaions">Invitaions</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          </TabsList>
          <Card>
            <CardContent>
              <TabsContent value="members">
                <MembersTab />
              </TabsContent>
              <TabsContent value="invitaions">
                <InvitationsTab />
              </TabsContent>
              <TabsContent value="subscriptions">
                <SubsicrptionTab />
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>
      )}
    </div>
  );
}
