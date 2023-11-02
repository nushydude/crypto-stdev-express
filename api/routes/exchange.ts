import Sentry from "@sentry/node";
import axios from "axios";
import { getKLinesAndAvgPrice, getDCADataForSymbol } from "../utils/binance.js";
import {
  getLastDCAInfoFromMongo,
  storeLastDCAInfoInMongo,
} from "../utils/db.js";
import { sentNotification } from "../utils/notification.js";

// TODO: move to MongoDB
const BEST_DCA_SYMBOLS_LIST = [
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
  "NEARBUSD",
];

const BEST_DCA_INTERVAL = "4h";
const BEST_DCA_LIMIT = 100;

export const getKlineData = async (req, res) => {
  const { symbol, interval, limit } = req.query;

  try {
    // TODO: use redis cache with a timeout of 1 minute
    const data = await getKLinesAndAvgPrice(symbol, interval, limit);

    return res.json(data);
  } catch (error) {
    Sentry.captureException(error);
  }

  return res.send([]);
};

// This is currently called by a cron hourly which is set up on cron-job.org.
export const getBestDCA = async (req, res) => {
  let id;
  let message;

  try {
    const dataInfo = await Promise.all(
      BEST_DCA_SYMBOLS_LIST.map((symbol) =>
        getDCADataForSymbol(symbol, BEST_DCA_INTERVAL, BEST_DCA_LIMIT)
      )
    );

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

export const getSymbols = async (req, res) => {
  const exchangeInfo = await axios.get(
    "https://api.binance.com/api/v3/exchangeInfo"
  );

  const symbols = await exchangeInfo.data.symbols.map(({ symbol }) => symbol);

  res.json({ symbols });
};
