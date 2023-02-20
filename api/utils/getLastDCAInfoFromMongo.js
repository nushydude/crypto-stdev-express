import { MongoClient, ServerApiVersion } from "mongodb";
import Sentry from "@sentry/node";

export const getLastDCAInfoFromMongo = async () => {
  const uri = `mongodb+srv://admin:${process.env.MONGO_DB_PASSWORD}@cluster0.snmvgzl.mongodb.net/?retryWrites=true&w=majority`;

  let dcaInfo;

  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1
  });

  try {
    await client.connect();

    const dcainfosCollection = client.db("production").collection("dcainfos");

    const record = await dcainfosCollection
      .find({})
      .sort({ createdAt: -1 })
      .limit(1);

    dcaInfo = record?.dcaInfo;
  } catch (error) {
    Sentry.captureException(error);
  }

  client.close();

  return dcaInfo;
};
