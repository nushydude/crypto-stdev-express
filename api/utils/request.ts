import { Request } from "express";

export const getMicroserviceRequestHeaders = (req: Partial<Request>) => {
  // TODO: Remove this when security is set on the micro services
  const authorization = req.headers["authorization"];

  return {
    "X-CRYPTO-STDEV-API-GATEWAY-KEY": process.env.API_GATEWAY_KEY,
    ...(authorization ? { authorization } : {})
  };
};
