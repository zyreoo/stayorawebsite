export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const name = (body.name || "").trim();
    const email = (body.email || "").trim();
    const message = (body.message || "").trim();

    if (!name || !email || !message) {
      return json({ error: "Missing required fields." }, 400);
    }

    const apiKey = context.env.RESEND_APIKEY || context.env.RESEND_API_KEY;
    const fromEmail = context.env.RESEND_FROM_EMAIL;
    const toEmail = context.env.CONTACT_TO_EMAIL;

    if (!apiKey || !fromEmail || !toEmail) {
      return json({ error: "Missing email configuration on server." }, 500);
    }

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        reply_to: email,
        subject: "New contact form message from " + name,
        html:
          "<h2>New message from stayora.ro</h2>" +
          "<p><strong>Name:</strong> " + escapeHtml(name) + "</p>" +
          "<p><strong>Email:</strong> " + escapeHtml(email) + "</p>" +
          "<p><strong>Message:</strong></p>" +
          "<p>" + escapeHtml(message).replace(/\n/g, "<br>") + "</p>"
      })
    });

    if (!resendResponse.ok) {
      const resendError = await resendResponse.text();
      return json({ error: "Failed to send message.", details: resendError }, 502);
    }

    return json({ ok: true });
  } catch (error) {
    return json({ error: "Invalid request payload." }, 400);
  }
}

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
