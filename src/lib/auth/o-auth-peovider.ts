import { DiscordIcon, GithubIcon } from "@/components/auth/oauth_icons";
import { ComponentProps, ElementType } from "react";

export const SUPPORTED_OAUTH_PROVIDERS = ["github", "discord"] as const;
export type SupportedOAuthProvivers =
  (typeof SUPPORTED_OAUTH_PROVIDERS)[number];

export const SUPPORTED_OAUTH_PROVIDERS_DETAILS: Record<
  SupportedOAuthProvivers,
  {
    name: string;
    Icon: ElementType<ComponentProps<"svg">>;
  }
> = {
  discord: { name: "Discord", Icon: DiscordIcon },
  github: { name: "Github", Icon: GithubIcon },
};
