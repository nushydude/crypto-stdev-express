import Sentry from "@sentry/node";
import { getKLinesAndAvgPrice } from "../utils/getKlinesAndAvgPrice.js";

export const getKlineData = async (req, res) => {
  const { symbol, interval, limit } = req.query;

  try {
    const data = await getKLinesAndAvgPrice(symbol, interval, limit);

    return res.json(data);
  } catch (error) {
    Sentry.captureException(error);
  }

  return res.send([]);
};
