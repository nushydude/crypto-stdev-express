import axios from "axios";

export const getSymbols = async (req, res) => {
  const exchangeInfo = await axios.get(
    "https://api.binance.com/api/v3/exchangeInfo"
  );

  const symbols = await exchangeInfo.data.symbols.map(({ symbol }) => symbol);

  res.json({ symbols });
};
