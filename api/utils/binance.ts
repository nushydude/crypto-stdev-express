import axios from "axios";
import { transformKLineData } from "./transforms.js";
import { calculateMean, calculateStandardDeviation } from "./math.js";

const SD_MULTIPLIER = 1;

// probably shouldn't be here, but Vercel limits to max of 12 functions, so I'm putting it here for now.
export const getDCADataForSymbol = async (
  symbol: string,
  interval: string,
  limit: number
) => {
  // TODO: use redis cache with a timeout of 10 minute
  const { klineData, avgPrice } = await getKLinesAndAvgPrice(
    symbol,
    interval,
    limit
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
    dip: ((avgPrice.price - targetPrice) / targetPrice) * 100,
  };
};

export const getKLinesAndAvgPrice = async (
  symbol: string,
  interval: string,
  limit: number
): Promise<{
  klineData: Array<{
    openTime: string;
    openPrice: number;
    volume: number;
  }>;
  avgPrice: {
    price: number;
  };
}> => {
  const [klineData, avgPrice] = await Promise.all([
    axios.get("https://api.binance.com/api/v3/klines", {
      params: { symbol, interval, limit },
    }),
    axios.get("https://api.binance.com/api/v3/avgPrice", {
      params: { symbol },
    }),
  ]);

  return {
    klineData: transformKLineData(klineData.data),
    avgPrice: avgPrice.data,
  };
};
