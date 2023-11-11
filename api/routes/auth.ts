import Sentry from "@sentry/node";
import { Request, Response } from "express";
import axios from "axios";
import isEmail from "validator/lib/isEmail.js";
import { getMicroserviceRequestHeaders } from "../utils/request.js";

interface SignUpRequestBody {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
}

interface LogInRequestBody {
  email: string;
  password: string;
}

interface GenerateNewAccessTokenBody {
  refreshToken: string;
}

interface LogOutRequestBody {
  refreshToken: string;
}

interface SendResetPasswordEmailReqestBody {
  email: string;
}

export const status = async (req: Request) => {
  let authService = "ng";
  try {
    const authServiceResponse = await axios.get(
      `${process.env.AUTH_SERVICE}/api/status`,
      { headers: getMicroserviceRequestHeaders(req) }
    );
    authService = authServiceResponse.data.status;
  } catch (err) {
    console.error(err);
  }

  return authService;
};

export const signUp = async (
  req: Request<{}, {}, SignUpRequestBody>,
  res: Response
) => {
  const { firstname, lastname, email, password } = req.body;

  if (
    typeof firstname !== "string" ||
    typeof lastname !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string"
  ) {
    Sentry.captureException("Invalid request body");
    res.status(400).send("Bad Request");
  }

  try {
    const response = await axios.post(
      `${process.env.AUTH_SERVICE}/api/users`,
      { email, password, firstname, lastname },
      { headers: getMicroserviceRequestHeaders(req) }
    );

    res.json(response.data);
  } catch (err) {
    console.error("Error:", err.response || err.message);
    if (err.response) {
      res.status(err.response.status).send(err.response.data);
    } else {
      res.status(500).send("Internal Server Error");
    }
  }
};

export const logIn = async (
  req: Request<{}, {}, LogInRequestBody>,
  res: Response
) => {
  const { email, password } = req.body;

  if (typeof email !== "string" || typeof password !== "string") {
    Sentry.captureException("Email or password is not a string");
    res.status(400).send("Bad Request");
  }

  try {
    const response = await axios.post(
      `${process.env.AUTH_SERVICE}/api/sessions`,
      { email, password },
      { headers: getMicroserviceRequestHeaders(req) }
    );
    res.json(response.data);
  } catch (err) {
    console.error("Error:", err.response || err.message);
    if (err.response) {
      res.status(err.response.status).send(err.response.data);
    } else {
      res.status(500).send("Internal Server Error");
    }
  }
};

export const logOut = async (
  req: Request<{}, {}, LogOutRequestBody>,
  res: Response
) => {
  const { refreshToken } = req.body;

  if (!refreshToken || typeof refreshToken !== "string") {
    Sentry.captureException("Invalid refreshToken in body");
    res.status(400).send("Bad Request");
  }

  try {
    const response = await axios.delete(
      `${process.env.AUTH_SERVICE}/api/sessions/${refreshToken}`,
      { headers: getMicroserviceRequestHeaders(req) }
    );

    res.json(response.data);
  } catch (err) {
    console.error("Error:", err.response || err.message);
    if (err.response) {
      res.status(err.response.status).send(err.response.data);
    } else {
      res.status(500).send("Internal Server Error");
    }
  }
};

export const generateNewAccessToken = async (
  req: Request<{}, {}, GenerateNewAccessTokenBody>,
  res: Response
) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    Sentry.captureException("Bad Request");
    res.status(400).send("Bad Request");
  }

  try {
    const response = await axios.post(
      `${process.env.AUTH_SERVICE}/api/sessions/refresh`,
      { refreshToken },
      { headers: getMicroserviceRequestHeaders(req) }
    );

    return res.json(response.data);
  } catch (err) {
    console.error("Error:", err.response || err.message);
    if (err.response) {
      res.status(err.response.status).send(err.response.data);
    } else {
      res.status(500).send("Internal Server Error");
    }
  }
};

export const forgotPassword = async (
  req: Request<{}, {}, SendResetPasswordEmailReqestBody>,
  res: Response
) => {
  const { email } = req.body;

  // TODO: find out why
  // @ts-expect-error
  if (!isEmail(email)) {
    Sentry.captureException("Invalid email");
    res.status(400).send("Bad Request");
  }

  try {
    const response = await axios.post(
      `${process.env.AUTH_SERVICE}/api/users/forgot`,
      { email },
      { headers: getMicroserviceRequestHeaders(req) }
    );

    res.json(response.data);
  } catch (err) {
    console.error("Error:", err.response || err.message);
    if (err.response) {
      res.status(err.response.status).send(err.response.data);
    } else {
      res.status(500).send("Internal Server Error");
    }
  }
};
