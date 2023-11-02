import { Request, Response } from "express";
import axios from "axios";

interface GetSettingsRequestBody {
  uri: string;
}

export const getSettings = async (
  req: Request<{}, {}, GetSettingsRequestBody>,
  res: Response
) => {
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
};
