import { MongoClient, ServerApiVersion } from "mongodb";
import Sentry from "@sentry/node";
import * as validator from "validator";
import jwt from "jsonwebtoken";

const DCA_INFO_COLLECTION_NAME = "dcainfos";
const ACCESS_TOKEN_EXPIRY = "1h";
const REFRESH_TOKEN_EXPIRY = "7d";

export const getLastDCAInfoFromMongo = async () => {
  let dcaInfo = [];

  const client = new MongoClient(process.env.DB_CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
  });

  try {
    await client.connect();

    const dcainfosCollection = client
      .db(process.env.DB_NAME)
      .collection(DCA_INFO_COLLECTION_NAME);

    const [record] = await dcainfosCollection
      .find({})
      .sort({ createdAt: -1 })
      .limit(1)
      .toArray();

    if (record) {
      dcaInfo = record.dcaInfo;
    }
  } catch (error) {
    Sentry.captureException(error);
  }

  client.close();

  return dcaInfo;
};

export const storeLastDCAInfoInMongo = async (dcaInfo) => {
  const client = new MongoClient(process.env.DB_CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
  });

  try {
    await client.connect();

    const dcainfosCollection = client
      .db(process.env.DB_NAME)
      .collection(DCA_INFO_COLLECTION_NAME);

    await dcainfosCollection.insertMany([{ dcaInfo, createdAt: new Date() }]);
  } catch (error) {
    Sentry.captureException(error);
  }

  client.close();
};

export const signUpWithEmail = async (firstname, lastname, email, password) => {
  if (validator.isEmail(email) === false) {
    throw new Error("Invalid email address");
  }

  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  const client = new MongoClient(process.env.DB_CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
  });

  let accessToken;
  let refreshToken;
  let errorMessage;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await client.connect();

    const usersCollection = client.db(process.env.DB_NAME).collection("users");

    // insert user to users collection
    const user = await usersCollection.insertMany([
      { firstname, lastname, email, hashedPassword, createdAt: new Date() },
    ]);

    // generate access token
    accessToken = jwt.sign(
      { userId: user._id.toString() },
      process.env.JWT_SECRET_ACCESS_TOKEN,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

    // generate refresh token
    refreshToken = jwt.sign(
      { userId: user._id.toString() },
      process.env.JWT_SECRET_REFRESH_TOKEN,
      { expiresIn: REFRESH_TOKEN_EXPIRY }
    );

    // store the refresh token in refreshtokens collection with userId
    const refreshtokensCollection = client
      .db(process.env.DB_NAME)
      .collection("refreshtokens");

    await refreshtokensCollection.insertMany([
      { userId: user._id.toString(), refreshToken },
    ]);
  } catch (error) {
    Sentry.captureException(error);

    // extract to
    if (error.code === 11000) {
      errorMessage = "Email address already exists";
    } else {
      errorMessage = "Unknown error";
    }
  }

  client.close();

  return { accessToken, refreshToken, errorMessage };
};

export const logInWithEmail = async (email, password) => {
  const client = new MongoClient(process.env.DB_CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
  });

  let accessToken;
  let refreshToken;
  let errorMessage;

  try {
    await client.connect();

    const usersCollection = client.db(process.env.DB_NAME).collection("users");

    const hashedPassword = await bcrypt.hash(password, 10);

    // find user in users collection
    const user = await usersCollection.findOne({ email, hashedPassword });

    if (user === null) {
      throw new Error("User not found");
    }

    // generate access token
    accessToken = jwt.sign(
      { userId: user._id.toString() },
      process.env.JWT_SECRET_ACCESS_TOKEN,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

    // generate refresh token
    refreshToken = jwt.sign(
      { userId: user._id.toString() },
      process.env.JWT_SECRET_REFRESH_TOKEN,
      { expiresIn: REFRESH_TOKEN_EXPIRY }
    );

    // store the refresh token in refreshtokens collection with userId
    const refreshtokensCollection = client
      .db(process.env.DB_NAME)
      .collection("refreshtokens");

    await refreshtokensCollection.insertMany([
      { userId: user._id.toString(), refreshToken },
    ]);
  } catch (error) {
    Sentry.captureException(error);

    // TODO: define custom errors
    if (error.message === "User not found") {
      errorMessage = "Invalid email or password";
    } else {
      errorMessage = "Unknown error";
    }
  }

  client.close();

  return { accessToken, refreshToken, errorMessage };
};

export const generateNewAccessTokenFromRefreshToken = async (refreshToken) => {
  let accessToken;

  // check if the refresh token is in the refreshtokens collection
  const client = new MongoClient(process.env.DB_CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
  });

  const refreshtokensCollection = client
    .db(process.env.DB_NAME)
    .collection("refreshtokens");

  try {
    const refreshTokenRecord = await refreshtokensCollection.findOne({
      refreshToken,
    });

    if (refreshTokenRecord === null) {
      throw new Error("Refresh token not found");
    }

    const { userId } = jwt.verify(
      refreshToken,
      process.env.JWT_SECRET_REFRESH_TOKEN
    );

    accessToken = jwt.sign({ userId }, process.env.JWT_SECRET_ACCESS_TOKEN, {
      expiresIn: "1h",
    });
  } catch (error) {
    Sentry.captureException(error);

    if (error.name === "TokenExpiredError") {
      errorMessage = "Refresh token expired";
    } else if (
      error.name === "JsonWebTokenError" ||
      error.message === "Refresh token not found"
    ) {
      errorMessage = "Invalid refresh token";
    } else {
      errorMessage = "Unknown error";
    }
  }

  return { accessToken, errorMessage };
};

export const deleteRefreshToken = async (refreshToken) => {
  let errorMessage;

  // check if the refresh token is in the refreshtokens collection
  const client = new MongoClient(process.env.DB_CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
  });

  const refreshtokensCollection = client
    .db(process.env.DB_NAME)
    .collection("refreshtokens");

  try {
    const refreshTokenRecord = await refreshtokensCollection.findOne({
      refreshToken,
    });

    if (refreshTokenRecord === null) {
      throw new Error("Refresh token not found");
    }

    // delete the refresh token from refreshtokens collection
    await refreshtokensCollection.deleteOne({ refreshtokens });
  } catch (error) {
    Sentry.captureException(error);

    if (error.message === "Refresh token not found") {
      errorMessage = "Invalid refresh token";
    } else {
      errorMessage = "Unknown error";
    }
  }

  return { errorMessage };
};
