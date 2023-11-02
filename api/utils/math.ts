export const calculateMean = (values: Array<number>): number => {
  return values.reduce((accum, value) => accum + value, 0) / values.length;
};

export const calculateStandardDeviation = (values: Array<number>): number => {
  const mean = calculateMean(values);

  const variance =
    values.reduce((accum, value) => accum + Math.pow(value - mean, 2), 0) /
    values.length;

  return Math.sqrt(variance);
};
