import * as OneSignal from "onesignal-node";

export const sentNotification = async (id, heading, message, segments) => {
  const client = new OneSignal.Client(
    process.env.ONESIGNAL_APP_ID,
    process.env.ONESIGNAL_REST_API_KEY
  );

  const notification = {
    id,
    app_id: process.env.ONESIGNAL_APP_ID,
    heading: {
      en: heading
    },
    contents: {
      en: message
    },
    included_segments: segments,
    url: "https://crypto-stdev-cra.vercel.app/best-dca",
    is_any_web: true
  };

  const response = await client.createNotification(notification);

  return response.body.id;
};
