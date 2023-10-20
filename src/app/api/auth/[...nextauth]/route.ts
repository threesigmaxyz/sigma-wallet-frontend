import NextAuth from "next-auth/next";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import AzureADProvider from "next-auth/providers/azure-ad"; 

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      authorization: {
        params: {
          scope: "openid"
        },
      },
      checks: ["nonce"]
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID ?? "",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET ?? "",
      authorization: {
        url: "https://www.facebook.com/v15.0/dialog/oauth",
        params: {
          scope: "openid",
        },
      },
      checks: ["nonce"],
      idToken: true,
      issuer: "https://www.facebook.com",
      jwks_endpoint: "https://www.facebook.com/.well-known/oauth/openid/jwks/",
    }),
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID ?? "",
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET ?? "",
      tenantId: process.env.AZURE_AD_TENANT_ID,
      authorization: {
        params: {
          scope: "openid",
        },
      },
      checks: ["nonce"]
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.id_token = account.id_token;
      }
      if (user) {
        token.id = user.id;
      }
      console.log(token);
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client, like an access_token from a provider.
      session.id_token = token.id_token;
      session.id = token.id;
      return session;
    }
  },
});

export { handler as GET, handler as POST };
