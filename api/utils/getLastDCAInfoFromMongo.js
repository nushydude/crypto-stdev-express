import { MongoClient, ServerApiVersion } from "mongodb";

export const getLastDCAInfoFromMongo = async () => {
  const uri = `mongodb+srv://admin:${process.env.MONGO_DB_PASSWORD}@cluster0.snmvgzl.mongodb.net/?retryWrites=true&w=majority`;

  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1
  });

  let dcaInfo;

  try {
    await client.connect();

    const dcainfosCollection = client.db("production").collection("dcainfos");

    const record = await dcainfosCollection.findOne({}).sort({ _id: -1 });

    dcaInfo = record?.dcaInfo;
  } catch (error) {}

  client.close();

  return dcaInfo;
};
