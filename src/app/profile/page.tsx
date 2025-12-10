"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { supabase } from "@/components/lib/supabase";
import FaceitStatsHook from "@/components/data/FaceitStatsHook"; // Import the custom hook

const Profile = () => {
  const { data: session, status } = useSession();
  const [aboutMe, setAboutMe] = useState<string>(""); // Ensure initial state
  const userId = session?.user?.id ?? "";
  const { profileData, faceitStats, loading, error } = FaceitStatsHook(userId);
  const [faceitNickname, setFaceitNickname] = useState<string>("");

  useEffect(() => {
    if (profileData) {
      setAboutMe(profileData?.about_me || "");
      setFaceitNickname(profileData?.faceit_nickname || "");
    }
  }, [profileData]);

  const handleSave = async () => {
    if (!session?.user?.id || !session?.user?.name) return;

    const payload = {
      discord_id: session.user.id,
      name: session.user.name,
      about_me: aboutMe,
      faceit_nickname: faceitNickname, // <-- USE THE STATE HERE
    };

    const { data, error } = await supabase
      .from("users")
      .upsert(payload, { onConflict: "discord_id" }); // <- ensure discord_id is the conflict key

    if (error) {
      console.error("Error updating profile:", error.message);
      alert("Failed to update profile.");
      return;
    }

    alert("Saved!");
  };

  if (status === "loading" || loading) return <div>Loading...</div>;
  if (status === "unauthenticated")
    return <div>Please sign in to view your profile.</div>;

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-semibold text-center mb-6">Your Profile</h1>

      <div className="flex items-center mb-6">
        <img
          src={session?.user?.image || "/default-avatar.png"}
          alt={session?.user?.name || "User"}
          className="w-16 h-16 rounded-full mr-4"
        />
        <div>
          <h2 className="text-xl">{session?.user?.name}</h2>
          <p>{session?.user?.email}</p>
        </div>
      </div>

      {error && <div className="text-red-500 text-center mb-4">{error}</div>}

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700">
          What I like to play
        </label>
        <textarea
          id="aboutMe"
          value={aboutMe}
          onChange={(e) => setAboutMe(e.target.value)} // Updates the aboutMe state on change
          rows={4}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
        />
      </div>

      {/* Add input for Faceit nickname */}
      <div className="mb-6">
        <label htmlFor="faceitNickname" className="block text-sm font-medium text-gray-700">
          Faceit Nickname
        </label>
        <input
          id="faceitNickname"
          type="text"
          value={faceitNickname}
          onChange={(e) => setFaceitNickname(e.target.value)} // Allow the user to change their Faceit nickname
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          placeholder="Enter your Faceit nickname"
        />
      </div>

      {/* Show Faceit stats if available */}
      {faceitStats && (
        <div className="mb-6">
          <div className="relative">
            <img src={faceitStats.cover_image || "/assets/default-images/faceit-banner.png"} alt="Cover Image" className="w-full h-25" />
            <img
              src={faceitStats.avatar || "/assets/default-images/default-avtar.jpeg"}
              alt="Avatar"
              className="w-20 h-20 rounded-full border-2 border-white absolute top-1/2 left-12 transform -translate-x-1/2 -translate-y-1/2"
            />
          </div>
          <h3 className="text-lg font-semibold">Faceit Stats</h3>
          <p>Nickname: {faceitStats.nickname}</p>
          <p>Country: {faceitStats.country}</p>
          <p>Skill Level: {faceitStats.skillLevel}</p>
          <p>Faceit Elo: {faceitStats.faceitElo}</p>
        </div>
      )}

      <div className="flex justify-center">
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none cursor-pointer"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default Profile;
