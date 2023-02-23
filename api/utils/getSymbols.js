import axios from "axios";

export const getSymbols = async (symbol, interval, limit) => {
  const exchangeInfo = await axios.get(
    "https://api.binance.com/api/v3/exchangeInfo"
  );

  return exchangeInfo.data.symbols.map(({ symbol }) => symbol);
};
