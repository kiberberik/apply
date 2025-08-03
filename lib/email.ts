import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // false для STARTTLS
  requireTLS: true, // Принудительно требуем TLS
  tls: {
    ciphers: 'SSLv3',
    rejectUnauthorized: true, // В продакшене должно быть true
  },
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Рекомендуется проверить соединение при инициализации
transporter.verify(function (error) {
  if (error) {
    console.error('SMTP connection error:', error);
  } else {
    console.log('SMTP server is ready to take our messages');
  }
});

interface SendEmailProps {
  to: string;
  subject: string;
  html: string;
  cc?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType: string;
  }>;
}

export async function sendEmail({ to, subject, html, cc, attachments }: SendEmailProps) {
  try {
    console.log('Preparing to send email to:', to);
    if (cc) {
      console.log('CC to:', cc);
    }
    console.log('Email subject:', subject);
    console.log('Attachments count:', attachments?.length || 0);

    if (attachments && attachments.length > 0) {
      console.log('Attachment details:');
      attachments.forEach((attachment, index) => {
        console.log(`  Attachment ${index + 1}:`, {
          filename: attachment.filename,
          // contentType: attachment.contentType,
          contentLength: attachment.content.length,
          contentType: typeof attachment.content,
        });
      });
    }

    const mailOptions = {
      from: process.env.SMTP_FROM,
      to,
      cc,
      subject,
      html,
      attachments,
    };

    console.log('Mail options prepared, sending...');
    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);

    return result;
  } catch (error: unknown) {
    console.error('Email sending error:', error);
    throw new Error(`Failed to send email: ${(error as Error).message}`);
  }
}
