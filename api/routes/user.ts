import axios from "axios";
import { Request, Response } from "express";

export const getPortfolio = async (req: Request, res: Response) => {
  const response = await axios.get(`${process.env.USER_SERVICE}/api/profile`, {
    headers: req.headers
  });

  return res.json(response.data);
};
