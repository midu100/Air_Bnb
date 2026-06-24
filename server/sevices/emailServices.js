const nodemailer = require("nodemailer");

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  service:'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async({email,subject,template,item})=>{
     const info = await transporter.sendMail({
    from: `"Air-bnb" <${process.env.SMTP_USER}>`, // sender address
    to: email, // list of recipients
    subject: subject, // subject line
    html: template(item), // HTML body
  });
}

module.exports = sendEmail