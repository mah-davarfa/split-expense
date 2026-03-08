import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmailToResetPassword = async ({ to, resetUrl  }) => {
  const from = process.env.EMAIL_FROM ;
  const subject = `You Request to Reset your Password`;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
            <h2>Reset your password</h2>
      <p>We received a request to reset your password.</p>
      
      <p>
        <a href="${resetUrl}" style="display:inline-block;padding:10px 14px;background:#111;color:#fff;text-decoration:none;border-radius:8px;">
          Reset Password
        </a>
      </p>
      <p>If the button doesn’t work, copy/paste this link:</p>
      <p>${resetUrl}</p>
      <p>This Reset Link expires in 5 minuts.</p>
    </div>
  `;

  return resend.emails.send({ from, to, subject, html });
};