import { Request, Response } from "express";
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

interface GetKlineDataRequestQuery {
  symbol: string;
  interval: string;
  limit: number;
}

interface BinanceExchangeInfoResponse {
  timezone: string;
  serverTime: number;
  rateLimits: any[]; // Replace 'any' with a more specific type if necessary
  exchangeFilters: any[]; // Replace 'any' with a more specific type if necessary
  symbols: Array<{ symbol: string }>;
}

export const getKlineData = async (
  req: Request<{}, {}, {}, GetKlineDataRequestQuery>,
  res: Response
) => {
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
export const getBestDCA = async (_req: Request, res: Response) => {
  let id;
  let message;

  try {
    const dataInfo = await Promise.all(
      BEST_DCA_SYMBOLS_LIST.map((symbol) =>
        getDCADataForSymbol(symbol, BEST_DCA_INTERVAL, BEST_DCA_LIMIT)
      )
    );

    const dcaTokens = dataInfo
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
    }, {} as Record<string, boolean>);
    // 2. filter out the ones in previousDCAInfoMap
    const newDCAInfo = dcaTokens.filter(
      ({ symbol }) => !previousDCAInfoMap[symbol]
    );

    if (newDCAInfo.length === 0) {
      return res.json({ message: "Nothing to DCA" });
    }

    await storeLastDCAInfoInMongo(dcaTokens);

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

export const getSymbols = async (req: Request, res: Response) => {
  const exchangeInfo = await axios.get<BinanceExchangeInfoResponse>(
    "https://api.binance.com/api/v3/exchangeInfo"
  );

  const symbols = await exchangeInfo.data.symbols.map(({ symbol }) => symbol);

  res.json({ symbols });
};
