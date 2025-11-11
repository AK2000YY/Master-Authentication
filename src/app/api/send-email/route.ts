import { NextResponse } from "next/server";

const nodemailer = require("nodemailer");

export async function POST(request: Request) {
  const body = await request.json();
  const message = {
    from: process.env.NODEMAILER_FROM_EMAIL,
    to: body.to,
    subject: body.subject,
    html: body.html,
    headers: {
      "X-Entity-Ref-ID": "newmail",
    },
  };
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.NODEMAILER_FROM_EMAIL,
      pass: process.env.PASS_TOKEN,
    },
  });

  try {
    await transporter.sendMail(message);
    return NextResponse.json(
      { message: "message sent successfully" },
      { status: 200 }
    );
  } catch (e) {
    console.log("error", e);
    return NextResponse.json(
      { message: "There is a problem" },
      { status: 500 }
    );
  }
}
