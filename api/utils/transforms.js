export const transformKLineData = (data) => {
  return data.map((candleStickData) => {
    const [
      openTime,
      openPrice,
      volume
      // highPrice,
      // lowPrice,
      // closePrice,
      // closeTime,
      // quoteAssetVolume,
      // numTrades,
      // takerBuyBaseAssetVolume,
      // takerBuyQuoteAssetVolume
    ] = candleStickData;

    return {
      openTime,
      openPrice: parseFloat(openPrice),
      volume: parseFloat(volume)
    };
  });
};
