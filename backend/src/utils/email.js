import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
});

const transporter_article = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_ARTICLE,
    pass: process.env.EMAIL_ARTICLE_PASS
  },
});

export default transporter;
export { transporter_article };
