import jwt from "jsonwebtoken";

export const validateBearerToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res
      .status(401)
      .json({ errorMessage: "Authorization header is missing" });
  }

  const token = authHeader.split(" ")[1];

  if (!token || authHeader.split(" ")[0] !== "Bearer") {
    return res.status(401).json({
      errorMessage: "Invalid authorization format. Expected: Bearer [token]",
    });
  }

  try {
    const { userId } = jwt.verify(token, process.env.JWT_SECRET_ACCESS_TOKEN);

    if (!userId) {
      return res
        .status(401)
        .json({ errorMessage: "Invalid authorization token" });
    }

    req.userId = userId;
  } catch (err) {
    return res
      .status(401)
      .json({ errorMessage: "Invalid authorization token" });
  }

  next();
};
