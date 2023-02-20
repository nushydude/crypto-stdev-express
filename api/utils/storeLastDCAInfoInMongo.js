import { MongoClient, ServerApiVersion } from "mongodb";
import Sentry from "@sentry/node";

export const storeLastDCAInfoInMongo = async (dcaInfo) => {
  const uri = `mongodb+srv://admin:${process.env.MONGO_DB_PASSWORD}@cluster0.snmvgzl.mongodb.net/?retryWrites=true&w=majority`;

  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1
  });

  try {
    await client.connect();

    const dcainfosCollection = client.db("production").collection("dcainfos");

    await dcainfosCollection.insertMany([{ dcaInfo, createdAt: new Date() }]);
  } catch (error) {
    Sentry.captureException(error);
  }

  client.close();
};
