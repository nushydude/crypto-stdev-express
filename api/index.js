import express from "express";
import axios from "axios";
import cors from "cors";
import Sentry from "@sentry/node";
import Tracing from "@sentry/tracing";
import * as OneSignal from "@onesignal/node-onesignal";
import { transformKLineData } from "./utils/transformKLineData.js";
import { getKLinesAndAvgPrice } from "./utils/getKlinesAndAvgPrice.js";
import { calculateStandardDeviation } from "./utils/calculateStandardDeviation.js";
import { calculateMean } from "./utils/calculateMean.js";

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
    .map(({ symbol }) => symbol);

  if (DCATokens.length === 0) {
    return res.json({ message: "Nothing to DCA" });
  }

  const message = `Should DCA ${DCATokens.join(",")}`;

  const tokenProvider = {
    getToken() {
      return process.env.ONESIGNAL_REST_API_KEY;
    }
  };

  const configuration = OneSignal.createConfiguration({
    authMethods: {
      app_key: {
        tokenProvider
      }
    }
  });

  const client = new OneSignal.DefaultApi(configuration);

  const notification = new OneSignal.Notification();

  notification.app_id = process.env.ONESIGNAL_APP_ID;
  notification.included_segments = ["Subscribed Users"];
  notification.heading = {
    en: "Crypto DCA Alert!"
  };
  notification.contents = {
    en: message
  };
  const { id } = await client.createNotification(notification);

  res.json({ message });
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
