import { Request, Response } from "express";
import axios from "axios";

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

interface RequestWithUser extends Request {
  userId?: string;
}

export const signUp = async (
  req: Request<{}, {}, SignUpRequestBody>,
  res: Response
) => {
  const response = await axios.post(
    `${process.env.USERS_SERVICE}/api/user`,
    req.body
  );

  return response;
};

export const logIn = async (
  req: Request<{}, {}, LogInRequestBody>,
  res: Response
) => {
  const response = await axios.post(
    `${process.env.USERS_SERVICE}/api/auth/login`,
    req.body
  );

  return response;
};

export const generateNewAccessToken = async (
  req: Request<{}, {}, GenerateNewAccessTokenBody>,
  res: Response
) => {
  const response = await axios.post(
    `${process.env.USERS_SERVICE}/api/auth/refresh`,
    req.body
  );

  return response;
};

export const logOut = async (
  req: Request<{}, {}, LogOutRequestBody>,
  res: Response
) => {
  const response = await axios.post(
    `${process.env.USERS_SERVICE}/api/auth/logout`,
    req.body
  );

  return response;
};

export const sendResetPasswordEmail = async (
  req: Request<{}, {}, SendResetPasswordEmailReqestBody>,
  res: Response
) => {
  const response = await axios.post(
    `${process.env.USERS_SERVICE}/api/auth/forgot`,
    req.body
  );

  return response;
};

export const getProfile = async (req: RequestWithUser, res: Response) => {
  const response = await axios.get(
    `${process.env.USERS_SERVICE}/api/auth/profile`,
    {
      headers: req.headers
    }
  );

  return response;
};
