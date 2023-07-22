import { getFirebaseAuth } from "next-firebase-auth-edge/lib/auth";

const { setCustomUserClaims } = getFirebaseAuth(
  {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.NEXT_PUBLIC_FIREBASE_PRIVATE_KEY
  },
  process.env.NEXT_PUBLIC_FIREBASE_PUBLIC_API_KEY
);

export default async (req, res) => {
  const { uid, txData } = req.body;
  console.log("uid", uid);
  console.log("txData", txData); 
  await setCustomUserClaims(uid, {
    txData: txData
  });

  // Respond with a success message
  return {
    status: 200,
    body: JSON.stringify({ success: true }),
  };
}