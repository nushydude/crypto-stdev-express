import { Request, Response } from "express";
import {
  signUpWithEmail,
  logInWithEmail,
  generateNewAccessTokenFromRefreshToken,
  deleteRefreshToken,
  sendResetPasswordEmailToUser,
} from "../utils/db.js";

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

export const signUp = async (
  req: Request<{}, {}, SignUpRequestBody>,
  res: Response
) => {
  const { firstname, lastname, email, password } = req.body;

  const { accessToken, refreshToken, errorMessage } = await signUpWithEmail(
    firstname,
    lastname,
    email,
    password
  );

  if (errorMessage) {
    return res.status(401).json({ errorMessage });
  }

  return res.json({ accessToken, refreshToken });
};

export const logIn = async (
  req: Request<{}, {}, LogInRequestBody>,
  res: Response
) => {
  const { email, password } = req.body;

  const { accessToken, refreshToken, errorMessage } = await logInWithEmail(
    email,
    password
  );

  if (errorMessage) {
    return res.status(401).json({ errorMessage });
  }

  return res.json({ accessToken, refreshToken });
};

export const generateNewAccessToken = async (
  req: Request<{}, {}, GenerateNewAccessTokenBody>,
  res: Response
) => {
  const { refreshToken } = req.body;

  const { accessToken, errorMessage } =
    await generateNewAccessTokenFromRefreshToken(refreshToken);

  if (errorMessage) {
    return res.status(401).json({ errorMessage });
  }

  return res.json({ accessToken });
};

export const logOut = async (
  req: Request<{}, {}, LogOutRequestBody>,
  res: Response
) => {
  const { refreshToken } = req.body;

  const { errorMessage } = await deleteRefreshToken(refreshToken);

  if (errorMessage) {
    return res.status(400).json({ errorMessage });
  }

  return res.status(204).send();
};

export const sendResetPasswordEmail = async (
  req: Request<{}, {}, SendResetPasswordEmailReqestBody>,
  res: Response
) => {
  const { email } = req.body;

  await sendResetPasswordEmailToUser(email);

  // We don't want to send a specfic message for security reasons.
  return res.status(204).send();
};
