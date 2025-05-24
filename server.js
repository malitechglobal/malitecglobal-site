
const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const fs = require('fs');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configuration Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Route POST pour contact
app.post('/contact', (req, res) => {
  const { nom, email, message } = req.body;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: `Nouveau message de ${nom}`,
    text: `Nom: ${nom}\nEmail: ${email}\nMessage:\n${message}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Erreur d\'envoi de mail:', error);
      res.status(500).send({ message: 'Erreur lors de l\'envoi de l\'email.' });
    } else {
      console.log('Email envoyé :', info.response);

      const nouveauMessage = { nom, email, message, date: new Date().toISOString() };
      const messagesPath = './messages.json';

      fs.readFile(messagesPath, 'utf8', (err, data) => {
        let messages = [];
        if (!err && data) {
          try {
            messages = JSON.parse(data);
          } catch (e) {
            console.error('Erreur de lecture JSON:', e);
          }
        }
        messages.push(nouveauMessage);
        fs.writeFile(messagesPath, JSON.stringify(messages, null, 2), () => {});
      });

      res.status(200).send({ message: 'Message envoyé avec succès !' });
    }
  });
});

app.listen(port, () => {
  console.log(`Serveur en ligne sur http://localhost:${port}`);
});
