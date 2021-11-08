import { Handler } from "@netlify/functions";
import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";
import * as path from "path";
import * as handlebars from "handlebars";
import * as fs from "fs";

const serviceAccount = require("../../keys/serviceAccountKey.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL:
      "https://tfm-borjamm-default-rtdb.europe-west1.firebasedatabase.app",
  });
}

const readHTMLFile = (path, callback) => {
  fs.readFile(path, { encoding: "utf-8" }, (err, html) => {
    if (err) {
      callback(err);
      throw err;
    } else {
      callback(null, html);
    }
  });
};

// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

export const handler: Handler = async (event, context) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    secure: true,
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });

  const { email_dest, question_msg, answer_msg, name } = JSON.parse(event.body);

  const filePath = path.join(__dirname, "./template-email.html");

  const html = await new Promise((resolve, reject) =>
    readHTMLFile(filePath, (err, html) => {
      if (err) {
        reject(err);
      } else {
        resolve(html);
      }
    })
  );

  const template = handlebars.compile(html);
  const replacements = {
    name: name,
    consult: question_msg,
    reply: answer_msg,
  };
  const htmlToSend = template(replacements);
  // console.log(htmlToSend);

  const mailOptions = {
    from: `TFM APP <${process.env.EMAIL}>`, // sender address
    to: email_dest,
    subject: `Respuesta de su consulta`, // Subject line
    text: `Mensage: ${question_msg} + ${answer_msg}`, // plain text body
    html: htmlToSend, // html body
  };

  return transporter
    .sendMail(mailOptions, null)
    .then((info) => {
      console.log("Message sent: %s", info.messageId);
      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ message: "success_message_sent" }),
      };
    })
    .catch((err) => {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          message: "failed_message_sent",
          error: err,
        }),
      };
    });
};
