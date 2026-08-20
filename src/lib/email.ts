import { Resend } from "resend";

let _resend: Resend | null = null;
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}
const FROM = process.env.RESEND_FROM_EMAIL || "noreply@oridesk.com";

// ─── Client Emails ────────────────────────────────────────────────────────────

export async function sendClientWelcomeEmail(
  email: string,
  name: string,
  companyName: string
) {
  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: "Welcome to OriDesk — Let's Get You Set Up 🚀",
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #0F172A; font-size: 28px; margin: 0;">OriDesk</h1>
          <p style="color: #64748B; font-size: 12px; margin: 4px 0 0;">by Ori Global Ltd</p>
        </div>
        <h2 style="color: #0F172A;">Welcome, ${name}! 👋</h2>
        <p style="color: #334155; line-height: 1.6;">
          Your <strong>${companyName}</strong> account is ready on OriDesk — your AI-powered customer service platform.
        </p>
        <p style="color: #334155; line-height: 1.6;">Here's what to do next:</p>
        <ol style="color: #334155; line-height: 2;">
          <li>Complete your company profile</li>
          <li>Upload your knowledge base (FAQs, policies)</li>
          <li>Copy your live chat widget to your website</li>
          <li>Watch your first ticket come in 🎉</li>
        </ol>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/client/onboarding" 
             style="background: #3B82F6; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Complete Setup →
          </a>
        </div>
        <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 32px 0;" />
        <p style="color: #94A3B8; font-size: 12px; text-align: center;">
          OriDesk — Smarter Support. Safer Agents. Happier Customers.<br />
          © ${new Date().getFullYear()} Ori Global Ltd. All rights reserved.
        </p>
      </div>
    `,
  });
}

// ─── Agent Emails ─────────────────────────────────────────────────────────────

export async function sendAgentInviteEmail(
  email: string,
  name: string,
  inviteLink: string
) {
  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: "You're invited to join OriDesk as an Agent",
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #0F172A; font-size: 28px; margin: 0;">OriDesk</h1>
          <p style="color: #64748B; font-size: 12px; margin: 4px 0 0;">by Ori Global Ltd</p>
        </div>
        <h2 style="color: #0F172A;">Hi ${name}, you've been invited! 🎉</h2>
        <p style="color: #334155; line-height: 1.6;">
          You've been selected to join the OriDesk agent platform — an AI-assisted customer service platform.
        </p>
        <p style="color: #334155; line-height: 1.6;">
          As an agent you'll use AI-powered tools to handle customer queries professionally and efficiently.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${inviteLink}" 
             style="background: #0F172A; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Accept Invitation →
          </a>
        </div>
        <p style="color: #64748B; font-size: 13px; text-align: center;">This link expires in 48 hours.</p>
        <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 32px 0;" />
        <p style="color: #94A3B8; font-size: 12px; text-align: center;">
          OriDesk — Smarter Support. Safer Agents. Happier Customers.<br />
          © ${new Date().getFullYear()} Ori Global Ltd. All rights reserved.
        </p>
      </div>
    `,
  });
}

export async function sendAgentApprovedEmail(email: string, name: string) {
  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: "✅ Your OriDesk Agent Account is Approved",
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #0F172A; font-size: 28px; margin: 0;">OriDesk</h1>
          <p style="color: #64748B; font-size: 12px; margin: 4px 0 0;">by Ori Global Ltd</p>
        </div>
        <h2 style="color: #16A34A;">Congratulations, ${name}! ✅</h2>
        <p style="color: #334155; line-height: 1.6;">
          Your OriDesk agent account has been approved. You can now log in and start handling tickets.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" 
             style="background: #3B82F6; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Go to Agent Dashboard →
          </a>
        </div>
        <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 32px 0;" />
        <p style="color: #94A3B8; font-size: 12px; text-align: center;">
          © ${new Date().getFullYear()} Ori Global Ltd. All rights reserved.
        </p>
      </div>
    `,
  });
}

// ─── Ticket Emails ────────────────────────────────────────────────────────────

export async function sendNewTicketEmail(
  clientEmail: string,
  clientName: string,
  ticketSubject: string,
  customerName: string,
  ticketId: string
) {
  await getResend().emails.send({
    from: FROM,
    to: clientEmail,
    subject: `🎫 New ticket: ${ticketSubject}`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #0F172A; font-size: 28px; margin: 0;">OriDesk</h1>
          <p style="color: #64748B; font-size: 12px; margin: 4px 0 0;">by Ori Global Ltd</p>
        </div>
        <h2 style="color: #0F172A;">Hi ${clientName}, a new ticket just came in</h2>
        <p style="color: #334155; line-height: 1.6;">
          <strong>${customerName}</strong> submitted a new ticket: <strong>${ticketSubject}</strong>
        </p>
        <p style="color: #334155; line-height: 1.6;">
          Our AI assistant has already sent an initial reply. An agent will step in if needed.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/client/tickets/${ticketId}" 
             style="background: #3B82F6; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            View Ticket →
          </a>
        </div>
        <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 32px 0;" />
        <p style="color: #94A3B8; font-size: 12px; text-align: center;">
          © ${new Date().getFullYear()} Ori Global Ltd. All rights reserved.
        </p>
      </div>
    `,
  });
}

export async function sendTicketResolvedEmail(
  customerEmail: string,
  customerName: string,
  ticketSubject: string,
  companyName: string
) {
  await getResend().emails.send({
    from: FROM,
    to: customerEmail,
    subject: `✅ Your ticket "${ticketSubject}" has been resolved`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #0F172A; font-size: 28px; margin: 0;">${companyName}</h1>
          <p style="color: #64748B; font-size: 12px; margin: 4px 0 0;">Powered by OriDesk</p>
        </div>
        <h2 style="color: #16A34A;">Hi ${customerName}, your issue has been resolved ✅</h2>
        <p style="color: #334155; line-height: 1.6;">
          Your ticket <strong>"${ticketSubject}"</strong> has been marked as resolved. 
          If you have any further questions, feel free to reach out again.
        </p>
        <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 32px 0;" />
        <p style="color: #94A3B8; font-size: 12px; text-align: center;">
          Powered by OriDesk — © ${new Date().getFullYear()} Ori Global Ltd.
        </p>
      </div>
    `,
  });
}
