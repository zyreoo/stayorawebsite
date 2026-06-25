export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const inquiryType = (body.inquiryType || "General contact").trim();
    const name        = (body.name    || "").trim();
    const email       = (body.email   || "").trim();
    const message     = (body.message || "").trim();
    const propertyType = (body.propertyType || "").trim();
    const rooms = body.rooms ? parseInt(body.rooms, 10) : null;

    if (!name || !email) {
      return json({ error: "Missing required fields." }, 400);
    }

    const isWaitlist = inquiryType === "Waitlist";

    if (!isWaitlist && !message) {
      return json({ error: "Missing required fields." }, 400);
    }

    const resendKey   = context.env.RESEND_APIKEY || context.env.RESEND_API_KEY;
    const fromEmail   = context.env.RESEND_FROM_EMAIL;
    const toEmail     = context.env.CONTACT_TO_EMAIL;

    if (!resendKey || !fromEmail || !toEmail) {
      return json({ error: "Missing email configuration on server." }, 500);
    }

    // ── Build email body ──────────────────────────────────
    let emailSubject, emailHtml;

    if (isWaitlist) {
      emailSubject = "[Waitlist] " + name;
      emailHtml =
        "<h2>New waitlist signup — stayora.ro</h2>" +
        "<p><strong>Name:</strong> "  + escapeHtml(name)  + "</p>" +
        "<p><strong>Email:</strong> " + escapeHtml(email) + "</p>" +
        (propertyType ? "<p><strong>Property type:</strong> " + escapeHtml(propertyType) + "</p>" : "") +
        (rooms        ? "<p><strong>Rooms:</strong> " + rooms + "</p>" : "");
    } else {
      emailSubject = "[" + inquiryType + "] New message from " + name;
      emailHtml =
        "<h2>New message from stayora.ro</h2>" +
        "<p><strong>Inquiry:</strong> " + escapeHtml(inquiryType) + "</p>" +
        "<p><strong>Name:</strong> "    + escapeHtml(name)        + "</p>" +
        "<p><strong>Email:</strong> "   + escapeHtml(email)       + "</p>" +
        "<p><strong>Message:</strong></p>" +
        "<p>" + escapeHtml(message).replace(/\n/g, "<br>") + "</p>";
    }

    // ── Send email (always) ───────────────────────────────
    const emailPromise = fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + resendKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from:     fromEmail,
        to:       [toEmail],
        reply_to: email,
        subject:  emailSubject,
        html:     emailHtml
      })
    });

    // ── Save to Airtable (waitlist only) ──────────────────
    let airtablePromise = Promise.resolve(null);

    if (isWaitlist) {
      const airtableKey   = context.env.AIRTABLE_API_KEY;
      const airtableBase  = context.env.AIRTABLE_BASE_ID;
      const airtableTable = context.env.AIRTABLE_TABLE_NAME || "Waitlist";

      if (airtableKey && airtableBase) {
        const fields = { "Name": name, "Email": email };
        if (propertyType) fields["Property Type"] = propertyType;
        if (rooms)        fields["Rooms"]          = rooms;

        airtablePromise = fetch(
          "https://api.airtable.com/v0/" + airtableBase + "/" + encodeURIComponent(airtableTable),
          {
            method: "POST",
            headers: {
              Authorization: "Bearer " + airtableKey,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ fields })
          }
        ).catch(() => null); // don't fail the request if Airtable is down
      }
    }

    // ── Wait for both ─────────────────────────────────────
    const [emailRes] = await Promise.all([emailPromise, airtablePromise]);

    if (!emailRes.ok) {
      const resendError = await emailRes.text();
      return json({ error: "Failed to send message.", details: resendError }, 502);
    }

    return json({ ok: true }, 200);

  } catch (err) {
    return json({ error: "Invalid request payload." }, 400);
  }
}

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g,  "&amp;")
    .replace(/</g,  "&lt;")
    .replace(/>/g,  "&gt;")
    .replace(/"/g,  "&quot;")
    .replace(/'/g,  "&#039;");
}
