"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Signup() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin");
  }, [status]);

  if (status === "loading") return <p>Loading...</p>;
  if (!session) return <p>No session found</p>;

  return (
    <div>
      <h1>Signup Form</h1>
      <p>Welcome, {session.user?.name}</p>
    </div>
  );
}
