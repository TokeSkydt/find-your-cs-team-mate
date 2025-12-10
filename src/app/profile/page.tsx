"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { supabase } from "@/components/lib/supabase"; // Adjust the import path
import { fetchFaceitStats } from "@/components/data/FaceitStats"; // Use named import for FaceitApi

const Profile = () => {
  const { data: session, status } = useSession();
  const [aboutMe, setAboutMe] = useState<string>("");
  const [faceitNickname, setFaceitNickname] = useState<string>(""); // State for storing Faceit nickname
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [faceitStats, setFaceitStats] = useState<any | null>(null); // State for storing Faceit stats

  useEffect(() => {
    if (session?.user?.id) {
      const fetchProfile = async () => {
        setLoading(true);
        setError(null);

        console.log("Fetching profile for discord_id:", session.user.id);

        const { data, error } = await supabase
          .from("users")
          .select(
            "about_me, faceit_elo, faceit_level, faceit_wins, faceit_losses, faceit_nickname, avatar"
          )
          .eq("discord_id", String(session.user.id))
          .limit(1);

        if (error) {
          console.error("Error fetching user profile:", error.message);
          setError("Failed to load your profile. Please try again later.");
          setLoading(false);
          return;
        }

        const profile = data?.[0];
        setAboutMe(profile?.about_me || "");
        const nickname = profile?.faceit_nickname || "";
        setFaceitNickname(nickname);

        // If nickname exists, check Faceit API to see if elo changed
        if (nickname) {
          try {
            const faceitData = await fetchFaceitStats(nickname);
            const cs2 = faceitData?.games?.cs2 ?? null;

            if (cs2) {
              const liveElo = cs2.faceit_elo;
              const cachedElo = profile?.faceit_elo;

              // If elo differs, update cache in Supabase
              if (liveElo && cachedElo && liveElo !== cachedElo) {
                console.log(
                  `Elo changed: ${cachedElo} → ${liveElo}, updating cache...`
                );
                await supabase
                  .from("users")
                  .update({
                    faceit_elo: liveElo,
                    faceit_level: cs2.skill_level || 0,
                    faceit_wins: cs2.wins || 0,
                    faceit_losses: cs2.losses || 0,
                    avatar: faceitData.avatar || "",
                    country: faceitData.country || "",
                  })
                  .eq("discord_id", String(session.user.id));
              }

              setFaceitStats({
                nickname: faceitData.nickname ?? nickname,
                country: faceitData.country ?? "",
                avatar: faceitData.avatar ?? profile?.avatar ?? "",
                cover_image: faceitData.cover_image ?? "",
                skillLevel: cs2.skill_level ?? null,
                faceitElo: liveElo ?? null,
                wins: cs2.wins ?? 0,
                losses: cs2.losses ?? 0,
              });
            } else {
              console.warn("No CS2 stats for:", nickname);
              setFaceitStats(null);
            }
          } catch (err) {
            console.error("Failed to fetch Faceit stats on load:", err);
            setError(null); // non-blocking
          }
        } else {
          setFaceitStats(null);
        }

        setLoading(false);
      };

      fetchProfile();
    }
  }, [session]);

  // Handle saving the profile including Faceit nickname and stats
  const handleSave = async () => {
  if (!session?.user?.id || !session?.user?.name) return;

  const payload = {
    discord_id: session.user.id,
    name: session.user.name,
    about_me: aboutMe,
    faceit_nickname: faceitNickname,
  };

  const { data, error } = await supabase
    .from("users")
    .upsert(payload, { onConflict: "discord_id" }); // <- ensure discord_id is the conflict key

  if (error) {
    console.error("Error updating profile:", error.message);
    setError("Failed to update your profile. Please try again later.");
    return;
  }

  alert("Profile updated successfully!");
  if (faceitNickname) fetchAndUpdateFaceitStats(faceitNickname);
};

  // Fetch and update Faceit stats with nickname
  const fetchAndUpdateFaceitStats = async (
    nickname: string,
    discordId?: string
  ) => {
    if (!nickname) return;
    if (!discordId) {
      if (!session?.user?.id) return;
      discordId = String(session.user.id);
    }

    try {
      // Fetch the Faceit stats using the nickname from the API
      const data = await fetchFaceitStats(nickname); // Use the nickname instead of Steam ID
      if (data) {
        console.log("Faceit stats:", data);

        // Save the fetched Faceit stats to Supabase
        await supabase
          .from("users")
          .update({
            faceit_elo: data.games.cs2.faceit_elo,
            faceit_level: data.games.cs2.skill_level,
            faceit_wins: data.games.cs2.wins,
            faceit_losses: data.games.cs2.losses,
          })
          .eq("discord_id", discordId); // Update by discord_id or unique identifier

        setFaceitStats({
          nickname: data.nickname,
          country: data.country,
          skillLevel: data.games.cs2.skill_level,
          faceitElo: data.games.cs2.faceit_elo,
          avatar: data.avatar,
          cover_image: data.cover_image,
          //skillLevelLabel: data.games.cs2.skill_level_label || "No Label",
        });
      } else {
        setError("No Faceit stats found for this nickname.");
      }
    } catch (error) {
      console.error("Error fetching Faceit stats:", error);
      setError("Failed to fetch Faceit stats. Please try again later.");
    }
  };

  if (status === "loading" || loading) return <div>Loading...</div>;
  if (status === "unauthenticated")
    return <div>Please sign in to view your profile.</div>;

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-semibold text-center mb-6">Your Profile</h1>

      <div className="flex items-center mb-6">
        <img
          src={session?.user?.image || "/default-avatar.png"} // Show avatar or default image
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
        <label
          htmlFor="role"
          className="block text-sm font-medium text-gray-700"
        >
          what i like to play
        </label>
        <textarea
          id="aboutMe"
          value={aboutMe}
          onChange={(e) => setAboutMe(e.target.value)}
          rows={4}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
        />
      </div>

      <div className="mb-6">
        <label
          htmlFor="faceit_nickname"
          className="block text-sm font-medium text-gray-700"
        >
          Faceit Nickname
        </label>
        <input
          id="faceit_nickname"
          type="text"
          value={faceitNickname}
          onChange={(e) => setFaceitNickname(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          placeholder="Enter your Faceit nickname"
        />
      </div>

      {/* Show Faceit stats if available */}
      {faceitStats && (
        <div className="mb-6">
          {/* Container for the cover image */}
          <div className="relative">
            {/* Cover image */}
            <img
              src={faceitStats.cover_image}
              alt="Cover Image"
              className="w-full "
            />

            {/* Avatar image positioned on top of the cover image */}
            <img
              src={faceitStats.avatar}
              alt="Avatar"
              className="w-20 h-20 rounded-full border-2 border-white absolute top-1/2 left-12 transform -translate-x-1/2 -translate-y-1/2"
            />
          </div>

          <h3 className="text-lg font-semibold">Faceit Stats</h3>
          <p>Nickname: {faceitStats.nickname}</p>
          <p>Country: {faceitStats.country}</p>
          <p>Skill Level: {faceitStats.skillLevel}</p>
          <p>Faceit Elo: {faceitStats.faceitElo}</p>
          {/* <p>Skill Level Label: {faceitStats.skillLevelLabel}</p> */}
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
