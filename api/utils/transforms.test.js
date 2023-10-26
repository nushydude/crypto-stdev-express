import { transformKLineData } from "./transforms.js";

describe("transformKLineData", () => {
  it("should transform an array of candleStickData correctly", () => {
    const input = [
      [
        1635241235000,
        "5000.50",
        "0.1",
        "5001.00",
        "4999.00",
        "5000.75",
        1635241295000,
        "200",
        2,
        "0.05",
        "250"
      ],
      [
        1635241296000,
        "5000.75",
        "0.2",
        "5002.00",
        "4998.50",
        "5001.25",
        1635241356000,
        "300",
        3,
        "0.15",
        "350"
      ]
    ];

    const expectedOutput = [
      {
        openTime: 1635241235000,
        openPrice: 5000.5,
        volume: 0.1
      },
      {
        openTime: 1635241296000,
        openPrice: 5000.75,
        volume: 0.2
      }
    ];

    expect(transformKLineData(input)).toEqual(expectedOutput);
  });

  it("should return an empty array when given no data", () => {
    expect(transformKLineData([])).toEqual([]);
  });
});
