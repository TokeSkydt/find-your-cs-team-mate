// next-auth.d.ts
import { DefaultSession, DefaultUser } from "next-auth";

// Extend the DefaultSession type to include 'id' on the user
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User extends DefaultUser {
    id: string; // Add discord_id to User type
  }
}
declare module "next-auth/jwt" {
  interface JWT {
    sub: string; // discord_id
  }}
