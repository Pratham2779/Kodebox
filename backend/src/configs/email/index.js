import {config} from 'dotenv';
config();
import nodemailer from 'nodemailer';



const sendMail = async ({to, subject = "", text = "", html = ""}) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_TRANSPORTER,
      pass: process.env.GMAIL_PASS,
    },
  });

  const info = await transporter.sendMail({
    from: `"${process.env.APP_NAME}" <${process.env.GMAIL_TRANSPORTER}>`,
    to,
    subject,
    text,
    html,
  });

  console.log("Message sent:", info.messageId);
};

export { sendMail };
