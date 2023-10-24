import Sentry from "@sentry/node";
import { getKLinesAndAvgPrice } from "../utils/getKlinesAndAvgPrice.js";
import { calculateStandardDeviation } from "../utils/calculateStandardDeviation.js";
import { calculateMean } from "../utils/calculateMean.js";
import { getLastDCAInfoFromMongo } from "../utils/getLastDCAInfoFromMongo.js";
import { storeLastDCAInfoInMongo } from "../utils/storeLastDCAInfoInMongo.js";
import { sentNotification } from "../utils/sentNotification.js";
import { getDCADataForSymbol } from "../utils/getDCADataForSymbol.js";

// TODO: move to MongoDB
const SYMBOLS_LIST = [
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

export const getBestDCA = async (req, res) => {
  const sdMultiplier = 1;

  const interval = "4h";
  const limit = 100;

  let id;
  let message;

  try {
    const dataInfo = await Promise.all(SYMBOLS_LIST.map(getDCADataForSymbol));

    const DCATokens = dataInfo
      .filter(({ shouldDCA }) => shouldDCA)
      // sort by highest to lowest (i.e. highest *negative* value first)
      .sort((a, b) => a.dip - b.dip);

    const previousDCAInfo = await getLastDCAInfoFromMongo();

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

    await storeLastDCAInfoInMongo(DCATokens);

    message = `Should DCA ${newDCAInfo
      .map(({ symbol, dip }) => `${symbol} (${dip.toFixed(2)}%)`)
      .join(", ")}`;

    if (process.env.NODE_ENV === "production") {
      id = await sentNotification(
        `CRYPTO_DCA_ALERT_${Date.now()}`,
        "Crypto DCA Alert!",
        message,
        ["Subscribed Users"]
      );
    }
  } catch (error) {
    Sentry.captureException(error);
  }

  res.json({ id, message });
};
