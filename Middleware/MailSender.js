const nodemailer = require("nodemailer");
const sendMail = async (from, to, subject, text, html) => {
  let testAccount = await nodemailer.createTestAccount();
  const transporter = nodemailer.createTransport({
    // host: "smtp.ethereal.email",
    // port: 587,
    service: "gmail",
    auth: {
      user: "bookyouroilchange@gmail.com",
      pass: "kllzjnqfwxhcjcbw",
    },
  });

  const info = await transporter.sendMail({
    from: from,
    to: to,
    subject: subject,
    text: text,
    html: html,
  });

  return info;
};

module.exports = sendMail;
