const transformKLineData = (data) => {
  return data.map((candleStickData) => {
    const [
      openTime,
      openPrice,
      highPrice,
      lowPrice,
      closePrice,
      volume,
      closeTime,
      quoteAssetVolume,
      numTrades,
      takerBuyBaseAssetVolume,
      takerBuyQuoteAssetVolume,
    ] = candleStickData;

    return {
      openTime,
      openPrice: parseFloat(openPrice),
      volume: parseFloat(volume),
    };
  });
};

module.exports = transformKLineData;
