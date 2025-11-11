export function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  return fetch("http://localhost:3000/api/send-email", {
    method: "POST",
    cache: "no-cache",
    body: JSON.stringify({
      to,
      subject,
      html,
    }),
    headers: {
      "Content-type": "application/json",
    },
  });
}
