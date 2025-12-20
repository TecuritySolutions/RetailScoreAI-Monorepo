import { sgMail } from '../config/sendgrid.js';
import { env } from '../config/env.js';
import { EmailError } from '../utils/errors.js';

export class EmailService {
  /**
   * Send OTP email to user
   * @param email - Recipient email address
   * @param otp - The OTP code to send
   */
  async sendOtpEmail(email: string, otp: string): Promise<void> {
    const msg = {
      to: email,
      from: {
        email: env.SENDGRID_FROM_EMAIL,
        name: env.SENDGRID_FROM_NAME,
      },
      subject: 'Your OTP for RetailScore AI',
      html: this.getOtpEmailTemplate(otp),
    };

    try {
      await sgMail.send(msg);
    } catch (error) {
      console.error('Failed to send email via SendGrid:', error);
      throw new EmailError('Failed to send OTP email. Please try again later.');
    }
  }

  /**
   * Generate HTML email template for OTP
   * @param otp - The OTP code to display
   * @returns HTML string
   */
  private getOtpEmailTemplate(otp: string): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your OTP</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <tr>
                  <td align="center">
                    <h1 style="color: #333333; margin: 0 0 20px 0; font-size: 24px;">RetailScore AI</h1>
                    <p style="color: #666666; font-size: 16px; margin: 0 0 30px 0; line-height: 1.5;">
                      Your verification code is:
                    </p>
                    <div style="background-color: #f8f8f8; border: 2px solid #4CAF50; border-radius: 8px; padding: 20px; margin: 0 0 30px 0;">
                      <h2 style="color: #4CAF50; font-size: 36px; margin: 0; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                        ${otp}
                      </h2>
                    </div>
                    <p style="color: #666666; font-size: 14px; margin: 0 0 10px 0;">
                      This code will expire in <strong>15 minutes</strong>.
                    </p>
                    <p style="color: #999999; font-size: 12px; margin: 0; line-height: 1.5;">
                      If you didn't request this code, please ignore this email.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 30px; border-top: 1px solid #eeeeee; margin-top: 30px;">
                    <p style="color: #999999; font-size: 12px; margin: 0;">
                      © ${new Date().getFullYear()} RetailScore AI. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }
}
