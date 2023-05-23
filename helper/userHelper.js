/* eslint-disable linebreak-style */
/* eslint-disable consistent-return */
/* eslint-disable no-console */
const argon2 = require('argon2');
const nodemailer = require('nodemailer');

// ************************hashing section*************************//
const hashPassword = async (password) => {
  try {
    const passwordHash = await argon2.hash(password);
    return passwordHash;
  } catch (error) {
    console.log(error);
  }
};

// ************************generate otp section*************************//
const verifyEmail = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'maheendrankp100@gmail.com',
        pass: 'nqsvtigtlxalucfh',
      },
    });
    const mailOptions = {
      from: 'maheendrankp100@gmail.com',
      to: email,
      subject: 'For reset Password',
      html:
        `<p> Your Furnica registration one time password is  ${otp} </p>`,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log('Email has been sent :-', info.response);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  hashPassword,
  verifyEmail,
};
