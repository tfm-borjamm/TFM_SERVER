import { Handler } from "@netlify/functions";

export const handler: Handler = async (event, context) => {
  const currentTime = new Date().getTime();

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({
      timestamp: currentTime,
    }),
  };
};
