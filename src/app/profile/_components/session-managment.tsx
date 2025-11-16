"use client";

import { BetterOAuthActionButton } from "@/components/auth/better-oauth-action-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/auth/auth-client";
import { Session } from "better-auth";
import { AlertTriangle, Monitor, Smartphone, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { UAParser } from "ua-parser-js";

export function SessionManagment({
  sessions,
  currentSessionToken,
}: {
  sessions: Session[];
  currentSessionToken: string;
}) {
  const router = useRouter();
  const otherSessions = sessions.filter(
    (session) => session.token !== currentSessionToken
  );
  const currentSession = sessions.find(
    (session) => session.token === currentSessionToken
  );

  function revokeOtherSessions() {
    return authClient.revokeOtherSessions(undefined, {
      onSuccess: () => {
        router.refresh();
      },
    });
  }

  return (
    <div className="space-y-6">
      {currentSession && (
        <SessionCard session={currentSession} isCurrentSession />
      )}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Other Active Sessions</h3>
          {otherSessions.length > 0 && (
            <BetterOAuthActionButton
              variant="destructive"
              size="sm"
              action={revokeOtherSessions}
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Revoke All Other Sessions
            </BetterOAuthActionButton>
          )}
        </div>
        {otherSessions.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No Other Active Sessions
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {otherSessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SessionCard({
  session,
  isCurrentSession = false,
}: {
  session: Session;
  isCurrentSession?: boolean;
}) {
  const router = useRouter();
  const userAgent = session.userAgent ? UAParser(session.userAgent) : null;

  function getBrowserInformation() {
    if (userAgent == null) return "Unkown Device";
    if (userAgent.browser.name == null && userAgent.os.name == null)
      return "Unkown Device";

    if (userAgent.browser.name == null) return userAgent.os.name;
    if (userAgent.os.name == null) return userAgent.browser.name;

    return `${userAgent.browser.name}, ${userAgent.os.name}`;
  }
  function formatDate(date: Date) {
    return Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(date));
  }
  function revokeSession() {
    return authClient.revokeSession(
      {
        token: session.token,
      },
      {
        onSuccess: () => {
          router.refresh();
        },
      }
    );
  }
  return (
    <Card>
      <CardHeader className="flex justify-between">
        <CardTitle>{getBrowserInformation()}</CardTitle>
        {isCurrentSession && <Badge>Current Session</Badge>}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {userAgent?.device.type === "mobile" ? <Smartphone /> : <Monitor />}
            <div>
              <p className="text-sm text-muted-foreground">
                Created: {formatDate(session.createdAt)}
              </p>
              <p className="text-sm text-muted-foreground">
                Expire: {formatDate(session.expiresAt)}
              </p>
            </div>
          </div>
          {!isCurrentSession && (
            <BetterOAuthActionButton
              variant="destructive"
              size="sm"
              successMessage="Session revoked"
              action={revokeSession}
            >
              <Trash2 />
            </BetterOAuthActionButton>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
