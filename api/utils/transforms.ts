export const transformKLineData = (
  data: Array<Array<string>>
): Array<{
  openTime: string;
  openPrice: number;
  volume: number;
}> => {
  return data.map((candleStickData) => {
    const [
      openTime,
      openPrice,
      _highPrice,
      _lowPrice,
      _closePrice,
      volume,
      _closeTime,
      _quoteAssetVolume,
      _numTrades,
      _takerBuyBaseAssetVolume,
      _takerBuyQuoteAssetVolume,
    ] = candleStickData;

    return {
      openTime,
      openPrice: parseFloat(openPrice),
      volume: parseFloat(volume),
    };
  });
};
