import NextAuth from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { supabase } from "@/components/lib/supabase"; // Make sure the import path is correct

const handler = NextAuth({
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (user) {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("discord_id", user.id) // Check if user exists in the 'users' table
          .single();

        if (!data) {
          // If the user doesn't exist, insert them into the 'users' table
          const { error: insertError } = await supabase
            .from("users")
            .insert([
              {
                discord_id: user.id,
                name: user.name,
                email: user.email,
                avatar: user.image, // Assuming `user.image` contains the avatar URL
                joined_at: new Date().toISOString(), // Add a timestamp
              },
            ]);

          if (insertError) {
            console.error("Error inserting user into Supabase:", insertError);
          }
        }
      }
      return true; // Allow the sign-in process to continue
    },

    async session({ session, token }) {
      if (token && session?.user) {
        session.user.id = token.sub; // This refers to discord_id (which is saved in the JWT token)
      }
      return session;
    },

    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id; // Save user id (discord_id) in JWT token
      }
      return token;
    },
  },
});

export { handler as GET, handler as POST };
