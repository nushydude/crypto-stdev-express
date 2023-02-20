import express from "express";
import axios from "axios";
import cors from "cors";
import Sentry from "@sentry/node";
import Tracing from "@sentry/tracing";
// import * as OneSignal from "@onesignal/node-onesignal";
import * as OneSignal from "onesignal-node";
import { transformKLineData } from "./utils/transformKLineData.js";
import { getKLinesAndAvgPrice } from "./utils/getKlinesAndAvgPrice.js";
import { calculateStandardDeviation } from "./utils/calculateStandardDeviation.js";
import { calculateMean } from "./utils/calculateMean.js";
import { getLastDCAInfoFromMongo } from "./utils/getLastDCAInfoFromMongo.js";
import { storeLastDCAInfoInMongo } from "./utils/storeLastDCAInfoInMongo.js";

const PORT = process.env.PORT || 3001;

const app = express();

Sentry.init({
  dsn: "https://27734235b776421294f22c2b7b0a1c32@o294811.ingest.sentry.io/4504262272221184",
  integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({ tracing: true }),
    // enable Express.js middleware tracing
    new Tracing.Integrations.Express({ app })
  ],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0
});
// RequestHandler creates a separate execution context using domains, so that every
// transaction/span/breadcrumb is attached to its own Hub instance
app.use(Sentry.Handlers.requestHandler());
// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());

app.use(cors());
app.use(express.json());

app.get("/api/binance_kline", async (req, res) => {
  const { symbol, interval, limit } = req.query;

  try {
    const data = await getKLinesAndAvgPrice(symbol, interval, limit);

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

app.get("/api/best_dca", async (req, res) => {
  const sdMultiplier = 1;

  const list = [
    "BTCBUSD",
    "ETHBUSD",
    "AVAXBUSD",
    "SOLBUSD",
    "APTBUSD",
    "RUNEBUSD",
    "ADABUSD",
    "SANDBUSD",
    "FTMBUSD",
    "DOTBUSD",
    "NEARBUSD"
  ];

  const interval = "4h";
  const limit = 100;

  let id;
  let message;

  try {
    const dataInfo = await Promise.all(
      list.map(async (symbol) => {
        const { klineData, avgPrice } = await getKLinesAndAvgPrice(
          symbol,
          interval,
          limit
        );

        const prices = klineData.map((d) => d.openPrice);
        const standardDeviation = calculateStandardDeviation(prices);
        const mean = calculateMean(prices);
        const targetPrice = mean - sdMultiplier * standardDeviation;
        const shouldDCA = avgPrice.price < targetPrice;
        const dip = ((avgPrice.price - targetPrice) / targetPrice) * 100;

        return { symbol, avgPrice, targetPrice, shouldDCA, dip };
      })
    );

    const DCATokens = dataInfo
      .filter(({ shouldDCA }) => shouldDCA)
      // sort by highest to lowest (i.e. highest *negative* value first)
      .sort((a, b) => a.dip - b.dip);

    const previousDCAInfo = await getLastDCAInfoFromMongo();

    await storeLastDCAInfoInMongo(DCATokens);

    // Find the diff between the last dcaInfo stored in DB vs the new one.
    // Only include the new ones
    // 1. create a map of previousDCAInfo
    const previousDCAInfoMap = previousDCAInfo.reduce((accum, item) => {
      accum[item.symbol] = item.shouldDCA; // this value will always be true because we are only storing the DCA ones

      return accum;
    }, {});
    // 2. filter out the ones in previousDCAInfoMap
    const newDCAInfo = DCATokens.filter(
      ({ symbol }) => !previousDCAInfoMap[symbol]
    );

    if (newDCAInfo.length === 0) {
      return res.json({ message: "Nothing to DCA" });
    }

    message = `Should DCA ${newDCAInfo
      .map(({ symbol, dip }) => `${symbol} (${dip.toFixed(2)}%)`)
      .join(", ")}`;

    if (process.env.NODE_ENV === "production") {
      const client = new OneSignal.Client(
        process.env.ONESIGNAL_APP_ID,
        process.env.ONESIGNAL_REST_API_KEY
      );

      const notification = {
        id: `CRYPTO_DCA_ALERT_${Date.now()}`,
        app_id: process.env.ONESIGNAL_APP_ID,
        heading: {
          en: "Crypto DCA Alert!"
        },
        contents: {
          en: message
        },
        included_segments: ["Subscribed Users"],
        url: "https://crypto-stdev-cra.vercel.app/best-dca",
        is_any_web: true
      };

      const response = await client.createNotification(notification);

      id = response.body.id;
    }
  } catch (error) {
    Sentry.captureException(error);
  }

  res.json({ id, message });
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

export default app;
