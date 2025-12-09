import Image from "next/image";

export default function Navbar() {
  return (
    <nav className="bg-black flex justify-between items-center p-4 text-white mt-2 rounded-2xl">
      <h1>CS-TEAM</h1>
      <ul className="flex space-x-4">
        <li>Home</li>
        <li>Get Your Team</li>
        <li>Sign In</li>
      </ul>
    </nav>
  );
}
