import axios from "axios";
import { transformKLineData } from "./transformKLineData.js";

export const getKLinesAndAvgPrice = async (symbol, interval, limit) => {
  const [klineData, avgPrice] = await Promise.all([
    axios.get("https://api.binance.com/api/v3/klines", {
      params: { symbol, interval, limit }
    }),
    axios.get("https://api.binance.com/api/v3/avgPrice", {
      params: { symbol }
    })
  ]);

  const data = {
    klineData: transformKLineData(klineData.data),
    avgPrice: avgPrice.data
  };

  return data;
};
