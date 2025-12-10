// src/hooks/useProfile.ts
import { useState, useEffect } from "react";
import { supabase } from "@/components/lib/supabase"; // Ensure correct import path
import { fetchFaceitStats } from "@/components/data/FaceitStats"; // Make sure this path is correct

const useProfile = (discordId: string) => {
  const [profileData, setProfileData] = useState<any>(null);
  const [faceitStats, setFaceitStats] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from("users")
          .select(
            "about_me, faceit_elo, faceit_level, faceit_wins, faceit_losses, faceit_nickname, avatar, cover_image"
          )
          .eq("discord_id", discordId)
          .limit(1);

        if (error) throw new Error(error.message);

        const profile = data?.[0];
        setProfileData(profile);

        if (profile?.faceit_nickname) {
          // If Faceit nickname exists, fetch Faceit stats
          const faceitData = await fetchFaceitStats(profile.faceit_nickname);
          const cs2 = faceitData?.games?.cs2 ?? null;
          if (cs2) {
            setFaceitStats({
              nickname: faceitData.nickname ?? profile.faceit_nickname,
              country: faceitData.country ?? "",
              avatar: faceitData.avatar ?? profile.avatar ?? "",
              cover_image: faceitData.cover_image ?? profile.cover_image ?? "",
              skillLevel: cs2.skill_level ?? null,
              faceitElo: cs2.faceit_elo ?? null,
              wins: cs2.wins ?? 0,
              losses: cs2.losses ?? 0,
            });
          } else {
            setFaceitStats(null);
          }
        }
      } catch (error) {
        console.error("Error fetching profile or Faceit stats:", error);
        setError("Failed to load your profile. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [discordId]);

  return { profileData, faceitStats, loading, error };
};

export default useProfile;
