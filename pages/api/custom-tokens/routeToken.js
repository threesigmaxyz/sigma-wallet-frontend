import { getFirebaseAuth } from "next-firebase-auth-edge/lib/auth";

const { createCustomToken } = getFirebaseAuth(
  {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.NEXT_PUBLIC_FIREBASE_PRIVATE_KEY
  },
  process.env.NEXT_PUBLIC_FIREBASE_PUBLIC_API_KEY
);

export default async (req, res) => {
  const { uid } = req.body;
  console.log(uid);
  const customToken = await createCustomToken(uid);

  // Respond with a success message
  return res.status(200).json(JSON.stringify({ customToken: customToken }));
}