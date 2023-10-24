import express from "express";
import axios from "axios";
import cors from "cors";
import Sentry from "@sentry/node";
import Tracing from "@sentry/tracing";
import { getSettings } from "./routes/settings.js";
import { getStatus } from "./routes/status.js";
import { getSymbols } from "./routes/symbols.js";
import { getBestDCA } from "./routes/dca.js";
import { getKlineData } from "./routes/kline.js";

const PORT = process.env.PORT || 3001;

const app = express();

Sentry.init({
  dsn: process.env.SENTRY_DSN,
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

app.get("/api/binance_kline", getKlineData);

app.post("/api/settings", getSettings);

app.get("/api/status", getStatus);

app.get("/api/symbols", getSymbols);

app.get("/api/best_dca", getBestDCA);

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
