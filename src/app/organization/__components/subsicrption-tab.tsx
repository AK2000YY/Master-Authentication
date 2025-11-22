"use client";

import { BetterOAuthActionButton } from "@/components/auth/better-oauth-action-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth/auth-client";
import { PLAN_TO_PRICE, STRIPE_PLANS } from "@/lib/auth/stripe";
import { Subscription } from "@better-auth/stripe";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function SubsicrptionTab() {
  const { data: activeOrganiztion } = authClient.useActiveOrganization();
  const [subsicriptions, setSubsicrptions] = useState<Subscription[]>([]);

  useEffect(() => {
    if (activeOrganiztion == null) return setSubsicrptions([]);
    authClient.subscription
      .list({
        query: { referenceId: activeOrganiztion.id },
      })
      .then((result) => {
        if (result.error) {
          setSubsicrptions([]);
          toast.error("faild to load subsicriptions");
          return;
        }
        setSubsicrptions(result.data);
      });
  }, [activeOrganiztion]);

  const activeSubsicrption = subsicriptions.find(
    (sub) => sub.status === "active" || sub.status === "trialing"
  );
  const activePlan = STRIPE_PLANS.find(
    (plan) => plan.name == activeSubsicrption?.plan
  );

  async function handleBillingPortal() {
    if (activeOrganiztion == null)
      return {
        error: { message: "No active organization" },
      };

    const res = await authClient.subscription.billingPortal({
      referenceId: activeOrganiztion.id,
      returnUrl: window.location.href,
    });

    if (res.error == null) {
      window.location.href = res.data.url;
    }
    return res;
  }

  function handleCancelSubsicrption() {
    if (activeOrganiztion == null)
      return Promise.resolve({
        error: { message: "No active organization" },
      });

    if (activeSubsicrption == null)
      return Promise.resolve({
        error: { message: "No active subsicrption" },
      });

    return authClient.subscription.cancel({
      subscriptionId: activeSubsicrption.id,
      referenceId: activeOrganiztion.id,
      returnUrl: window.location.href,
    });
  }

  function handleSubsicrptionChange(name: string) {
    if (activeOrganiztion == null)
      return Promise.resolve({
        error: { message: "No active organization" },
      });

    return authClient.subscription.upgrade({
      plan: name,
      subscriptionId: activeSubsicrption?.id,
      referenceId: activeOrganiztion.id,
      returnUrl: window.location.href,
      successUrl: window.location.href,
      cancelUrl: window.location.href,
    });
  }

  return (
    <div className="space-y-6">
      {activeSubsicrption && activePlan && (
        <Card>
          <CardHeader>
            <CardTitle>Current Subsicrption</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold capitalize">
                    {activeSubsicrption.plan} Plan
                  </h3>
                  {activeSubsicrption.priceId && (
                    <Badge variant={"secondary"}>
                      {currencyFormatter.format(
                        PLAN_TO_PRICE[activeSubsicrption.plan]
                      )}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {activePlan.limits.projects} Projects Included
                </p>
                {activeSubsicrption.periodEnd && (
                  <p className="text-sm text-muted-foreground">
                    {activeSubsicrption.cancelAtPeriodEnd
                      ? "Cancel On"
                      : "Renews On"}
                    {activeSubsicrption.periodEnd.toLocaleDateString()}
                  </p>
                )}
              </div>
              <BetterOAuthActionButton
                variant={"outline"}
                action={handleBillingPortal}
                className="flex items-center gap-2"
              >
                Billing Portal
              </BetterOAuthActionButton>
            </div>
          </CardContent>
        </Card>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        {STRIPE_PLANS.map((plan) => (
          <Card key={plan.name} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl capitalize">
                  {plan.name}
                </CardTitle>
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {currencyFormatter.format(PLAN_TO_PRICE[plan.name])}
                  </div>
                </div>
              </div>
              <CardDescription>
                Up to {plan.limits.projects} projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeSubsicrption?.plan === plan.name ? (
                activeSubsicrption.cancelAtPeriodEnd ? (
                  <Button disabled variant={"outline"} className="w-full">
                    Current Plan
                  </Button>
                ) : (
                  <BetterOAuthActionButton
                    variant={"destructive"}
                    className="w-full"
                    action={handleCancelSubsicrption}
                  >
                    Cancel Subsicrption
                  </BetterOAuthActionButton>
                )
              ) : (
                <BetterOAuthActionButton
                  className="w-full"
                  action={() => handleSubsicrptionChange(plan.name)}
                >
                  {activeSubsicrption == null ? "Subsicrpe" : "Change Plan"}
                </BetterOAuthActionButton>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
