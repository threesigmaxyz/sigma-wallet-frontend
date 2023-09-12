import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "@auth0/nextjs-auth0";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  let session = await getSession(req, res);  
  const resWithKeys = await fetch(process.env.AUTH0_ISSUER_BASE_URL + '/.well-known/jwks.json');
  const jwks = await resWithKeys.json();

  console.log(session);
  console.log(jwks);

  res.status(200).json({"idToken": session?.idToken, "jwks": jwks?.keys});
};