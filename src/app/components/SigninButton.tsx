"use client";
import React from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";

const SigninButton = () => {
  const { data: session } = useSession();
  const [nonce, setNonce] = useState("XXX");

  if (session && session.user) {
    return (
      <div className="flex gap-4 ml-auto">
        <input style={{ color: 'black' }} type="text" value={nonce} onChange={(e) => setNonce(e.target.value)} />  
        <button onClick={() => signIn('google', {}, {nonce: nonce})}>Update</button>
        <p className="text-sky-600">{session.user.name}</p>
        <button onClick={() => signOut()} className="text-red-600">
          Sign Out
        </button>
      </div>
    );
  }
  return (
    <button onClick={() => signIn('google')} className="text-green-600 ml-auto">
      Sign In
    </button>
  );
};

export default SigninButton;
