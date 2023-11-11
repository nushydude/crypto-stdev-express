import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import Sentry from "@sentry/node";
import Tracing from "@sentry/tracing";
import dotenv from "dotenv";
import { getSettings } from "./routes/settings.js";
import { getKlineData, getBestDCA, getSymbols } from "./routes/exchange.js";
import {
  status as authServiceStatus,
  generateNewAccessToken,
  logIn,
  logOut,
  signUp,
  forgotPassword
} from "./routes/auth.js";
import {
  status as userServiceStatus,
  getProfile,
  getUserProfile,
  updateUserProfile,
  getWatchPairs,
  setWatchPairs,
  createTransaction,
  getTransactions,
  getTransaction,
  setTransaction,
  deleteTransaction
} from "./routes/user.js";
import { validateBearerToken } from "./middleware/index.js";

dotenv.config();

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

app.get("/api/status", async (req, res) => {
  res.send({
    gateway: "ok",
    authServiceStatus: await authServiceStatus(req),
    userServiceStatus: await userServiceStatus(req)
  });
});

app.get("/api/binance_kline", getKlineData);

app.post("/api/settings", getSettings);

app.get("/api/symbols", getSymbols);

app.get("/api/best_dca", getBestDCA);

app.post("/api/user", signUp);
app.post("/api/auth/login", logIn);
app.post("/api/auth/logout", logOut);
app.post("/api/auth/refresh", generateNewAccessToken);
app.post("/api/auth/forgot", forgotPassword);

app.get("/api/profile", validateBearerToken, getUserProfile);
app.patch("/api/profile", validateBearerToken, updateUserProfile);
app.get("/api/watch_pairs", validateBearerToken, getWatchPairs);
app.put("/api/watch_pairs", validateBearerToken, setWatchPairs);
app.post("/api/transactions", validateBearerToken, createTransaction);
app.get("/api/transactions", validateBearerToken, getTransactions);
app.get(
  "/api/transactions/:transactionId",
  validateBearerToken,
  getTransaction
);
app.put(
  "/api/transactions/:transactionId",
  validateBearerToken,
  setTransaction
);
app.delete(
  "/api/transactions/:transactionId",
  validateBearerToken,
  deleteTransaction
);

// DEPRECATED - switch to
app.get("/api/auth/profile", validateBearerToken, getProfile);

app.use(Sentry.Handlers.errorHandler());

interface ResponseWithSentry extends Response {
  sentry?: string;
}

app.use(function onError(
  _err: any,
  req: Request,
  res: ResponseWithSentry,
  next: NextFunction
) {
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
