import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

export const sendEmail = (name, email, username, password) => {
  const mailOptions = {
    from: "venkatatrinadh4444@gmail.com",
    to: email,
    subject: "User registration credentials",
    html: `<div>
        <p style="color:green;font-size:18px;font-weight:bold">The following are the testing user credentials use the credentials to log in</p>
        <p>Your username is <b>${username}</b></p>
        <p>Your password is <b>${password}</b></p>
        </div>`,
  };
  transporter.sendMail(mailOptions);
};

export const sendForgetPasswordOtp = (email, otp) => {
  const options = {
    from: process.env.EMAIL,
    to: email,
    subject: "Forgetting the password",
    html: `<div>
        <b>Please use the following otp to verify your email</b>
        <p style="color:red">OTP is valid only for 2 minutes</p>
        <p>OTP:<b style="font-size:18px">${otp}</b></p>
        </div>`,
  };
  transporter.sendMail(options);
};

