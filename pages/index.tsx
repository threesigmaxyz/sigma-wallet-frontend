import React from "react";
import { useUser } from "@auth0/nextjs-auth0/client";

function index() {
  const { user, error, isLoading } = useUser();

  const handleTokenRequest = async () => {
    try {
      const res = await fetch('/api/requestJwt', {
        method: 'POST'});
      const {idToken, jwks} = await res.json();

      if (idToken) {
        console.log("JWT Token:", idToken);
        console.log("provider keys", jwks);
      } else {
        console.error("JWT Token or keys not available.");
      }
    } catch (error) {
      console.error("Error fetching JWT Token or keys:", error);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;

  if (user) {
    console.log(user);
    return (
      <div>
        Welcome {user.name}! <a href="/api/auth/logout">Logout</a>
        <br></br>
        Your nickname is {user.nickname}.
        <br/>
        <button onClick={handleTokenRequest}>Request JWT Token</button>
      </div>

    );
  }
  return <a href="/api/auth/login">Login</a>;
}

export default index;
