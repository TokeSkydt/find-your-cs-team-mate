import { GetServerSideProps } from "next";
import { getProviders, signIn, ClientSafeProvider } from "next-auth/react";

interface SignInProps {
  providers: Record<string, ClientSafeProvider>;
}

export default function SignIn({ providers }: SignInProps) {
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

export const getServerSideProps: GetServerSideProps = async () => {
  const providers = await getProviders();
  return { props: { providers: providers ?? {} } };
};
