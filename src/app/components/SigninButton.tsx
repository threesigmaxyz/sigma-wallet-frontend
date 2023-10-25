"use client";
import React from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";

const SigninButton = () => {
  const { data: session } = useSession();
  const [nonce, setNonce] = useState("XXX");

  const getToken = async (provider : any) => {
    signIn(provider, {}, { nonce: nonce });
  }

  if (session && session.user) {
    return (
      <div className="flex gap-4 ml-auto">
        <input style={{ color: 'black' }} type="text" value={nonce} onChange={(e) => setNonce(e.target.value)} />
        <button onClick={() => getToken('google')}>Update Google</button>
        <button onClick={() => getToken('facebook')}>Update Facebook</button>
        <button onClick={() => getToken('azure-ad')}>Update Microsoft</button>
        <p className="text-sky-600">{session.user.name}</p>
        <button onClick={() => signOut()} className="text-red-600">
          Sign Out
        </button>
        <textarea className="text-sky-600" value={session?.id_token} />
      </div>
    );
  }
  return (
    <button onClick={() => getToken('any provider')} className="text-green-600 ml-auto">
      Sign In
    </button>
  );
};

export default SigninButton;
