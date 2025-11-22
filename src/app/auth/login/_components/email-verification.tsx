import { BetterOAuthActionButton } from "@/components/auth/better-oauth-action-button";
import { authClient } from "@/lib/auth/auth-client";
import { useEffect, useRef, useState } from "react";

export function EmailVerification({ email }: { email: string }) {
  const [timeToNextResend, setTimeToNextResend] = useState<number>(30);
  const interval = useRef<NodeJS.Timeout>(undefined);

  useEffect(() => {
    startEmailVerificationTimeDown();
  }, []);

  function startEmailVerificationTimeDown(time = 30) {
    setTimeToNextResend(time);
    clearInterval(interval.current);
    interval.current = setInterval(() => {
      setTimeToNextResend((t) => {
        const newT = t - 1;
        if (newT <= 0) {
          clearInterval(interval.current);
          return 0;
        } else return newT;
      });
    }, 1000);
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground mt-2">
        We sent you a verification link. Please check your email and click the
        link to verify your email.
      </p>
      <BetterOAuthActionButton
        className="w-full"
        variant="outline"
        disabled={timeToNextResend > 0}
        action={() => {
          startEmailVerificationTimeDown();
          return authClient.sendVerificationEmail({
            email,
            callbackURL: "/",
          });
        }}
        successMessage="Verification email sent"
      >
        {timeToNextResend > 0
          ? `Resend Email ${timeToNextResend}`
          : "Resend Email"}
      </BetterOAuthActionButton>
    </div>
  );
}
