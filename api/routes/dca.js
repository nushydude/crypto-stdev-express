import * as OneSignal from "onesignal-node";
import Sentry from "@sentry/node";
import { getKLinesAndAvgPrice } from "../utils/getKlinesAndAvgPrice.js";
import { calculateStandardDeviation } from "../utils/calculateStandardDeviation.js";
import { calculateMean } from "../utils/calculateMean.js";
import { getLastDCAInfoFromMongo } from "../utils/getLastDCAInfoFromMongo.js";
import { storeLastDCAInfoInMongo } from "../utils/storeLastDCAInfoInMongo.js";

export const getBestDCA = async (req, res) => {
  const sdMultiplier = 1;

  const list = [
    "BTCBUSD",
    "ETHBUSD",
    "AVAXBUSD",
    "SOLBUSD",
    "APTBUSD",
    "RUNEBUSD",
    "ADABUSD",
    "SANDBUSD",
    "FTMBUSD",
    "DOTBUSD",
    "NEARBUSD"
  ];

  const interval = "4h";
  const limit = 100;

  let id;
  let message;

  try {
    const dataInfo = await Promise.all(
      list.map(async (symbol) => {
        const { klineData, avgPrice } = await getKLinesAndAvgPrice(
          symbol,
          interval,
          limit
        );

        const prices = klineData.map((d) => d.openPrice);
        const standardDeviation = calculateStandardDeviation(prices);
        const mean = calculateMean(prices);
        const targetPrice = mean - sdMultiplier * standardDeviation;
        const shouldDCA = avgPrice.price < targetPrice;
        const dip = ((avgPrice.price - targetPrice) / targetPrice) * 100;

        return { symbol, avgPrice, targetPrice, shouldDCA, dip };
      })
    );

    const DCATokens = dataInfo
      .filter(({ shouldDCA }) => shouldDCA)
      // sort by highest to lowest (i.e. highest *negative* value first)
      .sort((a, b) => a.dip - b.dip);

    const previousDCAInfo = await getLastDCAInfoFromMongo();

    await storeLastDCAInfoInMongo(DCATokens);

    // Find the diff between the last dcaInfo stored in DB vs the new one.
    // Only include the new ones
    // 1. create a map of previousDCAInfo
    const previousDCAInfoMap = previousDCAInfo.reduce((accum, item) => {
      accum[item.symbol] = item.shouldDCA; // this value will always be true because we are only storing the DCA ones

      return accum;
    }, {});
    // 2. filter out the ones in previousDCAInfoMap
    const newDCAInfo = DCATokens.filter(
      ({ symbol }) => !previousDCAInfoMap[symbol]
    );

    if (newDCAInfo.length === 0) {
      return res.json({ message: "Nothing to DCA" });
    }

    message = `Should DCA ${newDCAInfo
      .map(({ symbol, dip }) => `${symbol} (${dip.toFixed(2)}%)`)
      .join(", ")}`;

    if (process.env.NODE_ENV === "production") {
      const client = new OneSignal.Client(
        process.env.ONESIGNAL_APP_ID,
        process.env.ONESIGNAL_REST_API_KEY
      );

      const notification = {
        id: `CRYPTO_DCA_ALERT_${Date.now()}`,
        app_id: process.env.ONESIGNAL_APP_ID,
        heading: {
          en: "Crypto DCA Alert!"
        },
        contents: {
          en: message
        },
        included_segments: ["Subscribed Users"],
        url: "https://crypto-stdev-cra.vercel.app/best-dca",
        is_any_web: true
      };

      const response = await client.createNotification(notification);

      id = response.body.id;
    }
  } catch (error) {
    Sentry.captureException(error);
  }

  res.json({ id, message });
};
