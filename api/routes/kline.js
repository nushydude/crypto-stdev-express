import Sentry from "@sentry/node";
import { getKLinesAndAvgPrice } from "../utils/binance.js";

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
