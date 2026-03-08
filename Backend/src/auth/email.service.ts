import { google } from 'googleapis';
import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private auth: any;

  // ─── CONFIGURATION ───
  private readonly logoUrl = 'https://res.cloudinary.com/dmpuhqwqb/image/upload/v1770719442/logo-2_yro9yx.gif';
  private readonly companyName = process.env.SMTP_FROM_NAME || 'BivhaShop';

  // ─── BRAND COLORS ───
  private readonly colors = {
    primary: '#15803d',      // green-700
    secondary: '#6c757d',    // Subtitles
    success: '#28a745',      // Success messages/buttons
    warning: '#ffc107',      // Warnings
    danger: '#dc3545',       // Errors/Urgent
    background: '#f4f7f6',   // Light gray background for the whole email
    card: '#ffffff',         // White background for the content
    text: '#333333'          // Main text color
  };

  constructor() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
      this.logger.warn('Missing Google OAuth2 credentials in environment variables');
    }

    this.auth = new google.auth.OAuth2(
      clientId,
      clientSecret
    );

    this.auth.setCredentials({
      refresh_token: refreshToken,
    });

    this.logger.log(`Initializing Gmail API Email Service with user: ${process.env.SMTP_USER}`);
  }

  // ─── EMAIL METHODS ───

  async sendOtp(email: string, otp: string) {
    try {
      const gmail = google.gmail({ version: 'v1', auth: this.auth });

      const subject = `Your Verification Code for ${this.companyName}`;
      const htmlContent = `
          <div style="font-family: Arial, sans-serif; background-color: ${this.colors.background}; padding: 40px; color: ${this.colors.text};">
            <div style="max-width: 600px; margin: 0 auto; background-color: ${this.colors.card}; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <div style="background-color: ${this.colors.primary}; padding: 20px; text-align: center;">
                <img src="${this.logoUrl}" alt="${this.companyName}" style="max-height: 50px;">
              </div>
              <div style="padding: 30px;">
                <h2 style="color: ${this.colors.primary}; margin-top: 0;">Verify Your Email</h2>
                <p>Hello,</p>
                <p>Thank you for choosing ${this.companyName}. Use the following One-Time Password (OTP) to complete your verification. This code is valid for 10 minutes.</p>
                
                <div style="background-color: #f0fdf4; border: 2px dashed ${this.colors.primary}; padding: 20px; text-align: center; margin: 30px 0;">
                  <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: ${this.colors.primary};">${otp}</span>
                </div>
                
                <p>If you didn't request this code, you can safely ignore this email.</p>
                <p>Best regards,<br>The ${this.companyName} Team</p>
              </div>
              <div style="background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
                &copy; ${new Date().getFullYear()} ${this.companyName}. All rights reserved.
              </div>
            </div>
          </div>
        `;

      const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
      const messageParts = [
        `From: ${this.companyName} <${process.env.SMTP_USER}>`,
        `To: ${email}`,
        'Content-Type: text/html; charset=utf-8',
        'MIME-Version: 1.0',
        `Subject: ${utf8Subject}`,
        '',
        htmlContent,
      ];
      const message = messageParts.join('\n');

      const encodedMessage = Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedMessage,
        },
      });
      this.logger.log(`OTP successfully sent to ${email}`);
    } catch (error) {
      this.logger.error(`Error sending email via Gmail API to ${email}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to send verification email');
    }
  }
}
