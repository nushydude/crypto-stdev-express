import { calculateMean } from "./calculateMean.js";

export const calculateStandardDeviation = (values) => {
  const mean = calculateMean(values);

  const variance =
    values.reduce((accum, value) => accum + Math.pow(value - mean, 2), 0) /
    values.length;

  return Math.sqrt(variance);
};
