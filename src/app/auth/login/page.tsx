"use client";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SigninTab } from "./_components/tab-sign-in";
import { SignupTab } from "./_components/tab-sign-up";
import { Separator } from "@/components/ui/separator";
import { SocialAuthButton } from "./_components/social-auth-button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth/auth-client";
import { EmailVerification } from "./_components/email-verification";
import { ForgotPassword } from "./_components/forgot-password";

type Tab = "signin" | "signup" | "email-verification" | "forgot-password";

export default function Page() {
  const [isPending, setIsPending] = useState<boolean>(true);
  const [email, setEmail] = useState<string>("");
  const [selectedTab, setSelectedTab] = useState<Tab>("signin");
  const router = useRouter();

  useEffect(() => {
    async function checkUser() {
      await authClient.getSession().then((session) => {
        if (session.data != null) router.push("/");
      });
      setIsPending(false);
    }
    checkUser();
  }, [router]);

  if (isPending) return <div>Loading...</div>;

  function openEmailVerificationTab(email: string) {
    setEmail(email);
    setSelectedTab("email-verification");
  }

  return (
    <Tabs
      value={selectedTab}
      onValueChange={(t) => setSelectedTab(t as Tab)}
      className="max-auto w-full my-6 px-4"
    >
      {(selectedTab == "signin" || selectedTab == "signup") && (
        <TabsList>
          <TabsTrigger value="signin">Sign In</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
      )}
      <TabsContent value="signin">
        <Card>
          <CardHeader className="text-2xl font-bold">
            <CardTitle>Sign In</CardTitle>
          </CardHeader>
          <CardContent>
            <SigninTab
              openEmailVerificationTab={openEmailVerificationTab}
              openForgetPasswordTab={() => setSelectedTab("forgot-password")}
            />
          </CardContent>
          <Separator />
          <CardFooter className="grid grid-cols-2 gap-3">
            <SocialAuthButton />
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="signup">
        <Card>
          <CardHeader className="text-2xl font-bold">
            <CardTitle>Sign Up</CardTitle>
          </CardHeader>
          <CardContent>
            <SignupTab openEmailVerificationTab={openEmailVerificationTab} />
          </CardContent>
          <Separator />
          <CardFooter className="grid grid-cols-2 gap-3">
            <SocialAuthButton />
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="email-verification">
        <Card>
          <CardHeader className="text-2xl font-bold">
            <CardTitle>Verify Your Email</CardTitle>
          </CardHeader>
          <CardContent>
            <EmailVerification email={email} />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="forgot-password">
        <Card>
          <CardHeader className="text-2xl font-bold">
            <CardTitle>Forgot Password</CardTitle>
          </CardHeader>
          <CardContent>
            <ForgotPassword openSigninTab={() => setSelectedTab("signin")} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
