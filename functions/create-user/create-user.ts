import { Handler } from "@netlify/functions";
import * as admin from "firebase-admin";
import { UserRecord } from "firebase-admin/lib/auth/user-record";

const serviceAccount = require("../../keys/serviceAccountKey.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL:
      "https://tfm-borjamm-default-rtdb.europe-west1.firebasedatabase.app",
  });
}

export const handler: Handler = async (event, context) => {
  const { user } = JSON.parse(event.body);
  return admin
    .auth()
    .createUser(user)
    .then((userRecord: UserRecord) => {
      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          message: "success_created_user",
          id: userRecord.uid,
        }),
      };
    })
    .catch((err: any) => {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          message: "failed_created_user",
          error: err,
        }),
      };
    });
};
