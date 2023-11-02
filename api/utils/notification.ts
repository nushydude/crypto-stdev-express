import * as OneSignal from "onesignal-node";

export const sentNotification = async (
  id: string,
  heading: string,
  message: string,
  segments: Array<string>
) => {
  const client = new OneSignal.Client(
    process.env.ONESIGNAL_APP_ID,
    process.env.ONESIGNAL_REST_API_KEY
  );

  const notification = {
    id,
    app_id: process.env.ONESIGNAL_APP_ID,
    heading: {
      en: heading,
    },
    contents: {
      en: message,
    },
    included_segments: segments,
    url: "https://crypto-stdev-cra.vercel.app/best-dca",
    is_any_web: true,
  };

  const response = await client.createNotification(notification);

  return response.body.id;
};

export const sendEmail = (
  toAddress: string,
  subject: string,
  messageLines: Array<string>
) => {
  // const transporter = nodemailer.createTransport({
  //   service: process.env.EMAIL_SERVICE,
  //   auth: {
  //     user: process.env.EMAIL_ADDRESS,
  //     pass: process.env.EMAIL_PASSWORD,
  //   },
  // });

  // const mailOptions = {
  //   from: process.env.EMAIL_ADDRESS,
  //   to: toAddress,
  //   subject,
  //   text: messageLines.join("\n\n"),
  // };

  // return new Promise((resolve, reject) => {
  //   transporter.sendMail(mailOptions, (error, info) => {
  //     if (error) {
  //       reject(error);
  //     } else {
  //       resolve(undefined);
  //     }
  //   });
  // });
  return true;
};
