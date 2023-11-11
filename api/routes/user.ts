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
