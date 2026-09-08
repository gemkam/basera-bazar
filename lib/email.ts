// Sends transactional email through Brevo's REST API.
// Free tier: 300 emails/day, no expiry, and NO custom domain required, so it
// works while Bazarify is still on a .vercel.app URL. No SDK dependency.
//
// Configure two env vars in Vercel:
//   BREVO_API_KEY -> Brevo dashboard: Settings -> SMTP & API -> API Keys -> Generate
//   EMAIL_FROM    -> a sender you have VERIFIED in Brevo, in either form:
//                      "Bazarify <youremail@gmail.com>"  or  "youremail@gmail.com"
//                    Verify it under: Senders, Domains & Dedicated IPs -> Senders.
//
// Because the domain isn't authenticated, Brevo routes the return-path through
// @brevosend.com to keep Gmail/Yahoo delivery working. That's expected on the
// free tier. If you get a real domain later, authenticate it in Brevo (or switch
// back to Resend) for best deliverability.

const BREVO_ENDPOINT = 'https://api.brevo.com/v3/smtp/email';

type SendResult = { ok: true } | { ok: false; error: string };

// Accepts "Name <email@x.com>" or a bare "email@x.com".
function parseFrom(from: string): { name: string; email: string } {
  const match = from.match(/^\s*(.*?)\s*<\s*([^>]+)\s*>\s*$/);
  if (match) return { name: match[1] || 'Bazarify', email: match[2].trim() };
  return { name: 'Bazarify', email: from.trim() };
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<SendResult> {
  const apiKey = process.env.BREVO_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    return {
      ok: false,
      error:
        'Email is not configured. Set BREVO_API_KEY and EMAIL_FROM in your environment.',
    };
  }

  try {
    const res = await fetch(BREVO_ENDPOINT, {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        sender: parseFrom(from),
        to: [{ email: opts.to }],
        subject: opts.subject,
        htmlContent: opts.html,
      }),
    });

    if (!res.ok) {
      let detail = `Email provider returned ${res.status}`;
      try {
        const data = await res.json();
        detail = data?.message || detail;
      } catch {
        /* keep status detail */
      }
      return { ok: false, error: detail };
    }

    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Failed to reach email provider',
    };
  }
}

// Branded 6-digit code email, matching the store's gold/white theme.
export function verificationEmailHtml(code: string) {
  return `
  <div style="background:#faf9f7;padding:32px 0;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:460px;margin:0 auto;background:#ffffff;border:1px solid #eee;border-radius:16px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#bfa14a,#e6cf86);padding:24px 32px;">
        <h1 style="margin:0;color:#ffffff;font-size:22px;letter-spacing:0.5px;">Bazarify</h1>
      </div>
      <div style="padding:28px 32px;color:#222;">
        <p style="margin:0 0 8px;font-size:15px;">Verify your email to place your order</p>
        <p style="margin:0 0 20px;font-size:13px;color:#666;">
          Enter this code on the checkout page. It expires in 10 minutes.
        </p>
        <div style="text-align:center;margin:24px 0;">
          <span style="display:inline-block;font-size:34px;font-weight:bold;letter-spacing:10px;color:#1a1a1a;background:#faf7ee;border:1px dashed #d8c68a;border-radius:12px;padding:14px 24px;">
            ${code}
          </span>
        </div>
        <p style="margin:20px 0 0;font-size:12px;color:#999;">
          If you did not try to place an order, you can ignore this email.
        </p>
      </div>
    </div>
  </div>`;
}
