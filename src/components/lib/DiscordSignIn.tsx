import { supabase } from "./supabase";

export default function Login() {
  const loginWithDiscord = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: {
        redirectTo: "http://localhost:3000",
      },
    });
  };

  return (
    <button onClick={loginWithDiscord}>
      Login with Discord
    </button>
  );
}