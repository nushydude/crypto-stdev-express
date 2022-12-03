const express = require("express");
const axios = require("axios");
const cors = require("cors");
const Sentry = require("@sentry/node");
const Tracing = require("@sentry/tracing");
const transformKLineData = require("./utils/transformKLineData");

const PORT = process.env.PORT || 3001;

const app = express();

Sentry.init({
  dsn: "https://27734235b776421294f22c2b7b0a1c32@o294811.ingest.sentry.io/4504262272221184",
  integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({ tracing: true }),
    // enable Express.js middleware tracing
    new Tracing.Integrations.Express({ app }),
  ],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});
// RequestHandler creates a separate execution context using domains, so that every
// transaction/span/breadcrumb is attached to its own Hub instance
app.use(Sentry.Handlers.requestHandler());
// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());

app.use(cors());
app.use(express.json());

app.get("/api/binance_kline", async (req, res) => {
  try {
    const [klineData, avgPrice] = await Promise.all([
      axios.get("https://api.binance.us/api/v3/klines", {
        params: req.query,
      }),
      axios.get("https://api.binance.us/api/v3/avgPrice", {
        params: { symbol: req.query.symbol },
      }),
    ]);

    const data = {
      klineData: transformKLineData(klineData.data),
      avgPrice: avgPrice.data,
    };

    console.log("data:", data);

    return res.json(data);
  } catch (error) {
    Sentry.captureException(error);
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

app.get("/api/debug-sentry", (req, res) => {
  throw new Error("Sentry test error!");
});

app.use(Sentry.Handlers.errorHandler());

app.use(function onError(err, req, res, next) {
  // The error id is attached to `res.sentry` to be returned
  // and optionally displayed to the user for support.
  res.statusCode = 500;
  res.end(res.sentry + "\n");
});

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
  });
}

module.exports = app;
