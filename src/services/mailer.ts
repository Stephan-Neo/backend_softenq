import nodemailer, { Transporter } from 'nodemailer';
import fs from 'fs';
import handlebars from 'handlebars';

import configVars from 'config/vars';

const transporter: Transporter = nodemailer.createTransport({
  host: configVars.SMTP_HOST,
  port: configVars.SMTP_PORT,
  secure: false,
  auth: {
    user: configVars.SMTP_USER,
    pass: configVars.SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export const sendConfirmEmailUrl = async (email: string, hash: string, name: string): Promise<void> => {
  const link = `${configVars.FRONTEND_URL}/confirm-email?hash=${hash}`;
  const userName = name;

  await transporter.sendMail({
    from: `GTSK <${configVars.SMTP_USER}>`,
    to: email,
    subject: `Регистрация аккаунта на ${configVars.FRONTEND_URL}`,
    text: '',
    html: getEmailHtml(link, userName),
  });
};

const getEmailHtml = (link: string, userName: string) => {
  const source = fs.readFileSync('public/pages/registration.mail-template.html', 'utf-8').toString();
  const template = handlebars.compile(source);
  const replacements = {
    main_page: configVars.FRONTEND_URL,
    link,
    userName,
  };

  return template(replacements);
};
