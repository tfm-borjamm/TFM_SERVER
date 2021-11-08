import { Handler } from "@netlify/functions";
import * as admin from "firebase-admin";

const serviceAccount = require("../../keys/serviceAccountKey.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL:
      "https://tfm-borjamm-default-rtdb.europe-west1.firebasedatabase.app",
  });
}

export const handler: Handler = async (event, context) => {
  const { id } = JSON.parse(event.body);
  return admin
    .auth()
    .deleteUser(id)
    .then(() => {
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "success_deleted_user",
        }),
      };
    })
    .catch((err: any) => {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "failed_deleted_user",
          error: err,
        }),
      };
    });
};
