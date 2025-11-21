import { db } from "@/drizzle/db";
import { betterAuth, email } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { sendResetPasswordEmail } from "../email/sendResetPasswordEmail";
import { sendVerificationEmail } from "../email/verifyEmail";
import { createAuthMiddleware } from "better-auth/api";
import { sendWelcomeEmail } from "../email/welcome-email";
import { sendDeleteAccountVerificationEmail } from "../email/delete-account-email";
import { twoFactor } from "better-auth/plugins/two-factor";
import { passkey } from "better-auth/plugins/passkey";
import { admin as adminPlugin } from "better-auth/plugins/admin";
import { admin, user, ac } from "@/components/auth/permissions";
import { organization } from "better-auth/plugins/organization";
import { invitation, member } from "@/drizzle/schema";
import { sendOrganizationInviteEmail } from "../email/organization-invite-email";
import { desc, eq } from "drizzle-orm";

export const auth = betterAuth({
  appName: "Better Auht",
  user: {
    changeEmail: {
      enabled: true,
      sendChangeEmailVerification: async ({ user, url, newEmail }) => {
        await sendVerificationEmail({
          user: { ...user, email: newEmail },
          url,
        });
      },
    },
    additionalFields: {
      favoriteNumber: {
        type: "number",
        required: true,
      },
    },
    deleteUser: {
      enabled: true,
      sendDeleteAccountVerification: async ({ user, url }) => {
        await sendDeleteAccountVerificationEmail({ user, url });
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendResetPasswordEmail({ user, url });
    },
  },
  emailVerification: {
    autoSignInAfterVerification: true,
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerificationEmail({ user, url });
    },
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      mapProfileToUser: (profile) => {
        return {
          favoriteNumber: Number(profile.public_repos) || 0,
        };
      },
    },
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      mapProfileToUser: () => {
        return {
          favoriteNumber: 0,
        };
      },
    },
  },
  rateLimit: {
    storage: "database",
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },
  plugins: [
    nextCookies(),
    twoFactor(),
    passkey(),
    adminPlugin({
      ac,
      roles: {
        user,
        admin,
      },
      defaultRole: "user",
    }),
    organization({
      sendInvitationEmail: async ({
        email,
        organization,
        inviter,
        invitation,
      }) => {
        await sendOrganizationInviteEmail({
          invitation,
          inviter: inviter.user,
          organization,
          email,
        });
      },
    }),
  ],
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path.startsWith("/sign-up")) {
        const user = ctx.context.newSession?.user ?? {
          name: ctx.body.name,
          email: ctx.body.email,
        };
        if (user != null) await sendWelcomeEmail(user);
      }
    }),
  },
  databaseHooks: {
    session: {
      create: {
        before: async (userSession) => {
          const memberShip = await db.query.member.findFirst({
            where: eq(member.userId, userSession.userId),
            columns: { organizationId: true },
            orderBy: desc(member.createdAt),
          });

          return {
            data: {
              ...userSession,
              activeOrganizationId: memberShip?.organizationId,
            },
          };
        },
      },
    },
  },
});
