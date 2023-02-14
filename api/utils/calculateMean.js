export const calculateMean = (values) => {
  return values.reduce((accum, value) => accum + value, 0) / values.length;
};
