const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');
require('dotenv').config();

const prisma = new PrismaClient();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

app.post('/api/referrals', async (req, res) => {
  const { referrerName, referrerEmail, refereeCode } = req.body;

  try {
    console.log('Received referral data:', { referrerName, referrerEmail, refereeCode });

    const newReferral = await prisma.referral.create({
      data: {
        referrerName,
        referrerEmail,
        refereeCode,
      },
    });

    console.log('New referral created:', newReferral);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: referrerEmail,
      subject: 'Referral Confirmation',
      text: `Thank you ${referrerName} for your referral!`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });

    res.status(201).json(newReferral);
  } catch (error) {
    console.error('Error creating referral:', error);
    res.status(500).json({ error: 'Failed to create referral' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
