const path = require("path");
const express = require("express");
const axios = require("axios");
const transformKLineData = require("./utils/transformKLineData");

const PORT = process.env.PORT || 3001;

const app = express();

app.use(express.json());

app.get("/api/binance_kline", async (req, res) => {
  try {
    const [klineData, avgPrice] = await Promise.all([
      axios.get("https://api.binance.com/api/v3/klines", {
        params: req.query
      }),
      axios.get("https://api.binance.com/api/v3/avgPrice", {
        params: { symbol: req.query.symbol }
      })
    ]);

    return res.json({
      klineData: transformKLineData(klineData.data),
      avgPrice: avgPrice.data
    });
  } catch (error) {
    // TODO: log error in Sentry
  }

  return res.send([]);
});

app.post("/api/settings", async (req, res) => {
  const { uri } = req.body;
  let success = false;
  let errorMessage = null;
  let data = {};

  try {
    const response = await axios.get(uri);
    data = response.data;
    success = true;
  } catch (err) {
    errorMessage = err.message;
  }

  res.json({ success, errorMessage, data });
});

app.get("/api/test", (req, res) => {
  res.json({ message: "Hello from server!" });
});

// Have Node serve the files for our built React app
// app.use(express.static(path.resolve(__dirname, "../client/build")));

// Express serve up index.html file if it doesn't recognize route
// app.get("*", (req, res) => {
//   res.sendFile(path.resolve(__dirname, "../client/build/index.html"));
// });

if (process.env.NODE_ENV === "development") {
  app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
  });
}

module.exports = app;
