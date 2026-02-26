import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendInviteEmail = async ({ to, groupName, inviteUrl, invitedByName }) => {
  const from = process.env.EMAIL_FROM || "onboarding@resend.dev";
  const subject = `You're invited to join ${groupName}`;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <h2>Invitation to join "${groupName}"</h2>
      <p>${invitedByName || "Someone"} invited you to join their group on Split Expense.</p>
      <p>
        <a href="${inviteUrl}" style="display:inline-block;padding:10px 14px;background:#111;color:#fff;text-decoration:none;border-radius:8px;">
          Accept Invitation
        </a>
      </p>
      <p>If the button doesn’t work, copy/paste this link:</p>
      <p>${inviteUrl}</p>
      <p>This invitation expires in 48 hours.</p>
    </div>
  `;

  return resend.emails.send({ from, to, subject, html });
};