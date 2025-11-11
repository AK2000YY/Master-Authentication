"use client";

import { BetterOAuthActionButton } from "@/components/auth/better-oauth-action-button";
import { authClient } from "@/lib/auth/auth-client";
import {
  SUPPORTED_OAUTH_PROVIDERS,
  SUPPORTED_OAUTH_PROVIDERS_DETAILS,
} from "@/lib/auth/o-auth-peovider";

export function SocialAuthButton() {
  return SUPPORTED_OAUTH_PROVIDERS.map((provider) => {
    const Icon = SUPPORTED_OAUTH_PROVIDERS_DETAILS[provider].Icon;

    return (
      <BetterOAuthActionButton
        variant={"outline"}
        successMessage=""
        key={provider}
        action={() => authClient.signIn.social({ provider, callbackURL: "/" })}
      >
        <Icon />
        {SUPPORTED_OAUTH_PROVIDERS_DETAILS[provider].name}
      </BetterOAuthActionButton>
    );
  });
}
