import { createAuthClient } from "better-auth/react";
import {
  inferAdditionalFields,
  passkeyClient,
  twoFactorClient,
  adminClient,
  organizationClient,
} from "better-auth/client/plugins";
import { auth } from "./auth";
import { user, admin, ac } from "@/components/auth/permissions";

export const authClient = createAuthClient({
  plugins: [
    inferAdditionalFields<typeof auth>(),
    passkeyClient(),
    twoFactorClient({
      onTwoFactorRedirect: () => {
        window.location.href = "/auth/2fa";
      },
    }),
    adminClient({
      ac,
      roles: {
        user,
        admin,
      },
    }),
    organizationClient(),
  ],
});
