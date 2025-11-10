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
import { authClient } from "@/lib/auth-client";

export default function Page() {
  const [isPending, setIsPending] = useState<boolean>(true);
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

  return (
    <Tabs defaultValue="signin" className="max-auto w-full my-6 px-4">
      <TabsList>
        <TabsTrigger value="signin">Sign In</TabsTrigger>
        <TabsTrigger value="signup">Sign Up</TabsTrigger>
      </TabsList>
      <TabsContent value="signin">
        <Card>
          <CardHeader className="text-2xl font-bold">
            <CardTitle>Sign In</CardTitle>
          </CardHeader>
          <CardContent>
            <SigninTab />
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
            <SignupTab />
          </CardContent>
          <Separator />
          <CardFooter className="grid grid-cols-2 gap-3">
            <SocialAuthButton />
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
