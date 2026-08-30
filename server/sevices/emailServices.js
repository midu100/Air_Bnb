const nodemailer = require("nodemailer");

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  service:'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Callers fire this without awaiting. Node crashes the process on an unhandled rejection,
// so an SMTP outage must never escape this function.
const sendEmail = async({email,subject,template,item})=>{
  try {
    const info = await transporter.sendMail({
      from: `"Air-bnb" <${process.env.SMTP_USER}>`, // sender address
      to: email, // list of recipients
      subject: subject, // subject line
      html: template(item), // HTML body
    });
    return info
  } catch (error) {
    console.log(error)
  }
}

module.exports = sendEmail
