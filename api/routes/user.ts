import { ParamsDictionary } from "express-serve-static-core";
import axios from "axios";
import { Request, Response } from "express";
import { getMicroserviceRequestHeaders } from "../utils/request.js";

interface RequestWithUser extends Request {
  userId?: string;
}

interface UpdateWatchPairsRequestParams extends ParamsDictionary {
  id: string;
}

interface UpdateWatchPairsRequestBody {
  settings: any;
}

export const status = async (req: Request) => {
  let userServiceStatus = "ng";
  try {
    const userServiceStatusResponse = await axios.get(
      `${process.env.USER_SERVICE}/api/status`,
      { headers: getMicroserviceRequestHeaders(req) }
    );
    userServiceStatus = userServiceStatusResponse.data.status;
  } catch (err) {
    console.error(err);
  }

  return userServiceStatus;
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

export const getUserProfile = async (req: RequestWithUser, res: Response) => {
  try {
    const response = await axios.get(
      `${process.env.USER_SERVICE}/api/users/${req.userId}/profile`,
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

export const updateUserProfile = async (
  req: RequestWithUser,
  res: Response
) => {
  // TODO: sanitise body
  const payload = req.body;

  try {
    const response = await axios.patch(
      `${process.env.USER_SERVICE}/api/users/${req.userId}/profile`,
      payload,
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

export const getWatchPairs = async (req: RequestWithUser, res: Response) => {
  try {
    const response = await axios.get(
      `${process.env.USER_SERVICE}/api/users/${req.userId}/watch_pairs`,
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

export const setWatchPairs = async (req: RequestWithUser, res: Response) => {
  try {
    const response = await axios.put(
      `${process.env.USER_SERVICE}/api/users/${req.userId}/watch_pairs`,
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

export const createTransaction = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const response = await axios.post(
      `${process.env.USER_SERVICE}/api/users/${req.userId}/transactions`,
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

export const getTransactions = async (req: RequestWithUser, res: Response) => {
  try {
    const response = await axios.get(
      `${process.env.USER_SERVICE}/api/users/${req.userId}/transactions`,
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

export const getTransaction = async (req: RequestWithUser, res: Response) => {
  try {
    const response = await axios.get(
      `${process.env.USER_SERVICE}/api/users/${req.userId}/transactions/${req.params.transactionId}`,
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

export const setTransaction = async (req: RequestWithUser, res: Response) => {
  try {
    const response = await axios.put(
      `${process.env.USER_SERVICE}/api/users/${req.userId}/transactions/${req.params.transactionId}`,
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

export const deleteTransaction = async (
  req: RequestWithUser,
  res: Response
) => {
  try {
    const response = await axios.delete(
      `${process.env.USER_SERVICE}/api/users/${req.userId}/transactions/${req.params.transactionId}`,
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
