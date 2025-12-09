import { useEffect, useState } from "react";
import { getProviders, signIn } from "next-auth/react";

interface Provider {
  id: string;
  name: string;
  type: string;
}

export default function SignIn() {
  const [providers, setProviders] = useState<Record<string, Provider> | null>(null);

  useEffect(() => {
    const loadProviders = async () => {
      const res = await getProviders();
      setProviders(res);
    };
    loadProviders();
  }, []);

  if (!providers) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>Sign in</h1>
      {Object.values(providers).map((provider) => (
        <button key={provider.id} onClick={() => signIn(provider.id)}>
          Sign in with {provider.name}
        </button>
      ))}
    </div>
  );
}
