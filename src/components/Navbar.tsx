"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-black flex justify-between items-center p-4 text-white mt-2 rounded-2xl">
      <h1>CS-TEAM</h1>

      <ul className="flex space-x-4">
        <li>Home</li>
        <li>Get Your Team</li>

        <li>
          {session ? (
            <button onClick={() => signOut()}>Logout</button>
          ) : (
            <button onClick={() => signIn("discord")}>Login with Discord</button>
          )}
        </li>
      </ul>
    </nav>
  );
}
