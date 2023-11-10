import { ParamsDictionary } from "express-serve-static-core";
import { Request, Response } from "express";
import axios from "axios";
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

interface UpdateWatchPairsRequestParams extends ParamsDictionary {
  id: string;
}

interface UpdateWatchPairsRequestBody {
  settings: any;
}

interface RequestWithUser extends Request {
  userId?: string;
}

export const signUp = async (
  req: Request<{}, {}, SignUpRequestBody>,
  res: Response
) => {
  try {
    const response = await axios.post(
      `${process.env.USER_SERVICE}/api/user`,
      req.body,
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
  try {
    const response = await axios.post(
      `${process.env.USER_SERVICE}/api/auth/login`,
      req.body,
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
  try {
    const response = await axios.post(
      `${process.env.USER_SERVICE}/api/auth/refresh`,
      req.body,
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

export const logOut = async (
  req: Request<{}, {}, LogOutRequestBody>,
  res: Response
) => {
  try {
    const response = await axios.post(
      `${process.env.USER_SERVICE}/api/auth/logout`,
      req.body,
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

export const sendResetPasswordEmail = async (
  req: Request<{}, {}, SendResetPasswordEmailReqestBody>,
  res: Response
) => {
  try {
    const response = await axios.post(
      `${process.env.USER_SERVICE}/api/auth/forgot`,
      req.body,
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

export const getProfile = async (req: RequestWithUser, res: Response) => {
  try {
    const response = await axios.get(
      `${process.env.USER_SERVICE}/api/profile`,
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

export const getPortfolio = async (req: Request, res: Response) => {
  return res.json([]);
};

export const updateWatchPairs = async (
  req: Request<UpdateWatchPairsRequestParams, {}, UpdateWatchPairsRequestBody>,
  res: Response
) => {
  try {
    const response = await axios.post(
      `${process.env.USER_SERVICE}/api/user/${req.params.id}/watch_pairs`,
      req.body,
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
