import { getKLinesAndAvgPrice } from "./getKLinesAndAvgPrice.js";
import { calculateStandardDeviation } from "./calculateStandardDeviation.js";
import { calculateMean } from "./calculateMean.js";

const SD_MULTIPLIER = 1;
const INTERVAL = "4h";
const LIMIT = 100;

export const getDCADataForSymbol = async (symbol) => {
  const { klineData, avgPrice } = await getKLinesAndAvgPrice(
    symbol,
    INTERVAL,
    LIMIT
  );

  const prices = klineData.map((d) => d.openPrice);
  const stdDev = calculateStandardDeviation(prices);
  const mean = calculateMean(prices);

  const targetPrice = mean - SD_MULTIPLIER * stdDev;

  return {
    symbol,
    avgPrice,
    targetPrice,
    shouldDCA: avgPrice.price < targetPrice,
    dip: ((avgPrice.price - targetPrice) / targetPrice) * 100
  };
};
