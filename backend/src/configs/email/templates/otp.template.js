import { config } from "dotenv";
config();

const otpTemplate = (otp) => {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>${process.env.APP_NAME} Email Verification</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f6f8;
        margin: 0;
        padding: 0;
        color: #333;
      }
      .container {
        max-width: 600px;
        margin: 40px auto;
        background: #fff;
        padding: 30px;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
      }
      .header {
        text-align: center;
        color: #2e4a80;
      }
      .otp-box {
        font-size: 24px;
        background-color: #eef1f7;
        padding: 15px;
        text-align: center;
        letter-spacing: 6px;
        font-weight: bold;
        border-radius: 6px;
        color: #2e4a80;
        margin: 20px 0;
      }
      .footer {
        margin-top: 30px;
        font-size: 12px;
        text-align: center;
        color: #777;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h2 class="header">${process.env.APP_NAME} Email Verification</h2>

      <p>Hi there,</p>

      <p>
        Thank you for signing up on <strong>${process.env.APP_NAME}</strong>.
        To complete your registration, please verify your email address using the OTP below:
      </p>

      <div class="otp-box">${otp}</div>

      <p>
        This OTP is valid for the next
        <strong>${process.env.OTP_EXPIRY} minutes</strong>.
      </p>

      <p>
        If you did not request this verification, you can safely ignore this email.
        No account will be created without verification.
      </p>

      <p>
        Regards,<br />
        The ${process.env.APP_NAME} Team
      </p>

      <div class="footer">
        &copy; ${new Date().getFullYear()} ${process.env.APP_NAME}. All rights reserved.<br />
        Need help? Contact us at
        <a href="mailto:support@${process.env.APP_DOMAIN}">
          support@${process.env.APP_DOMAIN}
        </a>
      </div>
    </div>
  </body>
</html>`;
};

export { otpTemplate };
