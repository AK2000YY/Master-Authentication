import { auth } from "@/lib/auth/auth";
import { toNextJsHandler } from "better-auth/next-js";
import arcjet, {
  BotOptions,
  detectBot,
  EmailOptions,
  protectSignup,
  shield,
  slidingWindow,
  SlidingWindowRateLimitOptions,
} from "@arcjet/next";
import { findIp } from "@arcjet/ip";

const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  characteristics: ["userIdOrIp"],
  rules: [shield({ mode: "LIVE" })],
});

const botSettings = { mode: "LIVE", allow: [] } satisfies BotOptions;

const restrectiveRateLimitSettings = {
  mode: "LIVE",
  max: 10,
  interval: "10m",
} satisfies SlidingWindowRateLimitOptions<[]>;

const laxRateLimitSettings = {
  mode: "LIVE",
  max: 60,
  interval: "1m",
} satisfies SlidingWindowRateLimitOptions<[]>;

const emailSettings = {
  mode: "LIVE",
  block: ["DISPOSABLE", "INVALID", "NO_MX_RECORDS"],
} satisfies EmailOptions;

const authHandler = toNextJsHandler(auth);

export const { GET } = authHandler;

export async function POST(request: Request) {
  const clonedRequest = request.clone();
  const decision = await checkArcjet(request);

  if (decision.isDenied()) {
    if (decision.reason.isRateLimit()) {
      return new Response(null, { status: 429 });
    } else if (decision.reason.isEmail()) {
      let message: string;
      if (decision.reason.emailTypes.includes("INVALID"))
        message = "Email address format is invalid";
      else if (decision.reason.emailTypes.includes("DISPOSABLE"))
        message = "DISPOSABLE email address is not allowed";
      else if (decision.reason.emailTypes.includes("NO_MX_RECORDS"))
        message = "Email domain is not valid";
      else message = "Invalid email";
      return Response.json({ message }, { status: 400 });
    } else {
      return new Response(null, { status: 403 });
    }
  }

  return authHandler.POST(clonedRequest);
}

async function checkArcjet(request: Request) {
  const body = (await request.json()) as unknown;
  const session = await auth.api.getSession({ headers: request.headers });
  const userIdOrIp = (session?.user.id ?? findIp(request)) || "127.0.0.1";
  if (request.url.endsWith("/auth/sign-up")) {
    if (
      body &&
      typeof body === "object" &&
      "email" in body &&
      typeof body.email === "string"
    ) {
      return aj
        .withRule(
          protectSignup({
            email: emailSettings,
            bots: botSettings,
            rateLimit: restrectiveRateLimitSettings,
          })
        )
        .protect(request, { email: body.email, userIdOrIp });
    } else {
      return aj
        .withRule(detectBot(botSettings))
        .withRule(slidingWindow(restrectiveRateLimitSettings))
        .protect(request, { userIdOrIp });
    }
  }

  return aj
    .withRule(detectBot(botSettings))
    .withRule(slidingWindow(laxRateLimitSettings))
    .protect(request, { userIdOrIp });
}
