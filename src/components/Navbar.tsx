"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";

export default function Navbar() {
  const { data: session } = useSession(); // Get session data

  return (
    <nav className="bg-black flex justify-between items-center p-4 text-white mt-2 rounded-2xl">
      <h1>CS-TEAM</h1>

      <ul className="flex space-x-4 cursor-pointer items-center">
        <li><Link href="/">Home</Link></li>
        <li>Get Your Team</li>

        {/* If the user is signed in, show profile info and Logout button */}
        {session ? (
          <>
              <Link href="/profile">
            <li className="flex items-center cursor-pointer">
                <img
                  src={session.user.image || "/default-avatar.png"} // Use user avatar or default image if not available
                  alt={session.user.name || "User"}
                  className="w-8 h-8 rounded-full mr-2"
                />
                <span>{session.user.name}</span> {/* Show the user's name */}
            </li>
              </Link>
            <li>
              <button
                onClick={() => signOut()}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg cursor-pointer"
              >
                Logout
              </button>
            </li>
          </>
        ) : (
          // If not signed in, show Login button
          <li>
            <button
              onClick={() => signIn("discord")}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg cursor-pointer"
            >
              Login with Discord
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
}
