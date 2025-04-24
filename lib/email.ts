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
}

export async function sendEmail({ to, subject, html }: SendEmailProps) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM, // адрес отправителя
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send email');
  }
}
