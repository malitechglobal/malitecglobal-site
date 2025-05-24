
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

app.post('/contact', (req, res) => {
  const { name, email, message } = req.body;
  const newMessage = { name, email, message, date: new Date().toISOString() };
  const messagesFile = path.join(__dirname, 'messages.json');
  const messages = JSON.parse(fs.readFileSync(messagesFile, 'utf8'));
  messages.push(newMessage);
  fs.writeFileSync(messagesFile, JSON.stringify(messages, null, 2));

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'service.malitechglobal@gmail.com',
    subject: 'Nouveau message depuis le site Malitec Global',
    text: `Nom: ${name}\nEmail: ${email}\nMessage:\n${message}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Erreur d'envoi de mail:', error);
      res.status(500).send('Erreur lors de l'envoi du message.');
    } else {
      console.log('Message envoyé :', info.response);
      res.status(200).send('Message reçu avec succès.');
    }
  });
});

app.listen(port, () => {
  console.log(`Serveur lancé sur http://localhost:${port}`);
});
