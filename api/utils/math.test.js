import { calculateMean, calculateStandardDeviation } from "./math.js";

describe("calculateMean", () => {
  it("should calculate the mean of an array of numbers", () => {
    const values = [1, 2, 3, 4, 5];
    const result = calculateMean(values);
    expect(result).toEqual(3);
  });
});

describe("calculateStandardDeviation", () => {
  it("should calculate the standard deviation of an array of numbers", () => {
    const values = [1, 2, 3, 4, 5];
    const result = calculateStandardDeviation(values);
    expect(result).toEqual(1.4142135623730951);
  });
});
