import { MongoClient, ServerApiVersion } from "mongodb";
import Sentry from "@sentry/node";

const DCA_INFO_COLLECTION_NAME = "dcainfos";

export const getLastDCAInfoFromMongo = async () => {
  let dcaInfo: Array<{
    symbol: string;
    avgPrice: {
      price: number;
    };
    targetPrice: number;
    shouldDCA: boolean;
    dip: number;
  }> = [];

  const client = new MongoClient(process.env.DB_CONNECTION_STRING, {
    serverApi: ServerApiVersion.v1
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

export const storeLastDCAInfoInMongo = async (
  dcaInfo: Array<{
    symbol: string;
    avgPrice: {
      price: number;
    };
    targetPrice: number;
    shouldDCA: boolean;
    dip: number;
  }>
) => {
  const client = new MongoClient(process.env.DB_CONNECTION_STRING, {
    serverApi: ServerApiVersion.v1
  });

  try {
    await client.connect();

    const dcainfosCollection = client
      .db(process.env.DB_NAME)
      .collection(DCA_INFO_COLLECTION_NAME);

    await dcainfosCollection.insertOne({ dcaInfo, createdAt: new Date() });
  } catch (error) {
    Sentry.captureException(error);
  }

  client.close();
};
