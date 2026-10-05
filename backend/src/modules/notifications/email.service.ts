import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { env } from '../../config/env';
import { logger } from '../../lib/logger';

interface SendMailInput {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

class EmailService {
  private readonly transporter: Transporter | null;

  constructor() {
    if (env.EMAIL_MODE === 'smtp') {
      this.transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_PORT === 465,
        auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
      });
    } else {
      this.transporter = null;
    }
  }

  async send(input: SendMailInput): Promise<void> {
    if (env.EMAIL_MODE === 'console') {
      logger.info({ to: input.to, subject: input.subject }, '[email] (modo consola)');
      logger.info(input.text);
      return;
    }

    if (!this.transporter) {
      throw new Error('Transporter de email no configurado');
    }

    await this.transporter.sendMail({
      from: env.SMTP_FROM,
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
    });
  }
}

export const emailService = new EmailService();
