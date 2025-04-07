import nodemailer from 'nodemailer';

export async function sendVerificationEmail(email: string, code: string, locale: string) {
  const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/api/verify?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}`;

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

  await transporter.sendMail({
    from: `"Your App" <${process.env.SMTP_USER}>`,
    to: email,
    subject: locale === 'ru' ? 'Подтверждение почты' : 'Email Verification',
    text:
      locale === 'ru'
        ? `Подтвердите ваш email, перейдя по ссылке: ${verificationLink}`
        : `Verify your email by clicking the link: ${verificationLink}`,
    html: `<p>${locale === 'ru' ? 'Подтвердите ваш email' : 'Verify your email'}:</p>
           <a href="${verificationLink}">${verificationLink}</a>`,
  });
}
