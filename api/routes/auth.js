import {
  signUpWithEmail,
  logInWithEmail,
  generateNewAccessTokenFromRefreshToken,
  deleteRefreshToken,
} from "../utils/db.js";

export const signUp = async (req, res) => {
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

export const logIn = async (req, res) => {
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

export const generateNewAccessToken = async (req, res) => {
  const { refreshToken } = req.body;

  const { accessToken, errorMessage } =
    await generateNewAccessTokenFromRefreshToken(refreshToken);

  if (errorMessage) {
    return res.status(401).json({ errorMessage });
  }

  return res.json({ accessToken });
};

export const logOut = async (req, res) => {
  const { refreshToken } = req.body;

  const { errorMessage } = await deleteRefreshToken(refreshToken);

  if (errorMessage) {
    return res.status(400).json({ errorMessage });
  }

  return res.status(204).send();
};
