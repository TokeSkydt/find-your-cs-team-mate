import NextAuth from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { supabase } from "@/components/lib/supabase"; // Make sure this is the correct import path

const handler = NextAuth({
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt", // You are using JWT for session management
  },
  callbacks: {
    // This callback is called when a user logs in
    async signIn({ user, account, profile }) {
      console.log("User from Discord:", user); // Log the user data to inspect it

      // Query Supabase for the user using the discord_id
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("discord_id", user.id)  // Check if user exists in the 'users' table
        .single();

      if (!data) {
        console.log("User not found in Supabase, inserting...");

        // If the user doesn't exist in the database, insert them
        const { error: insertError } = await supabase
          .from("users")
          .insert([
            {
              discord_id: user.id,
              name: user.name,
              email: user.email,
              avatar: user.image,  // User's Discord avatar
              joined_at: new Date().toISOString(),
            },
          ]);

        if (insertError) {
          console.error("Error inserting user into Supabase:", insertError);
        }
      }
      return true;  // Allow sign-in to proceed
    },

    // This callback is for customizing the session object
    async session({ session, token }) {
      if (token && session?.user) {
        session.user.id = token.sub; // This is where you add the discord_id to the session
      }
      return session;
    },

    // This callback is for saving the user's discord_id to JWT
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id; // Save the discord_id in the JWT
      }
      return token;
    },
  },
});

export { handler as GET, handler as POST };
