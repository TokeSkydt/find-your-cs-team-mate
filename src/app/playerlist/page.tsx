"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { supabase } from "@/components/lib/supabase";
import PlayerModal from "@/components/PlayerModal";

type Player = {
  discord_id: string;
  name: string;
  faceit_nickname: string;
  faceit_elo: number;
  faceit_level: number;
  about_me?: string;
  session?: string;
};

const PlayersList = () => {
  const { data: session } = useSession();
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [userIsLooking, setUserIsLooking] = useState<boolean>(false);
  const [loadingToggle, setLoadingToggle] = useState<boolean>(false);

  useEffect(() => {
    const fetchPlayers = async () => {
      // Fetch players who are looking for a team
      const { data, error } = await supabase
        .from("users")
        .select(
          "discord_id, name, faceit_nickname, faceit_elo, faceit_level, about_me"
        )
        .eq("looking_for_team", true); // Filter based on 'looking_for_team'

      if (error) {
        console.error(error);
        return;
      }

      setPlayers(data as Player[]);
    };

    // Fetch current user's looking_for_team status if signed in
    const fetchUserStatus = async () => {
      if (!session?.user?.id) {
        setUserIsLooking(false);
        return;
      }

      const { data, error } = await supabase
        .from("users")
        .select("looking_for_team")
        .eq("discord_id", String(session.user.id))
        .limit(1)
        .single();

      if (error || !data) {
        setUserIsLooking(false);
      } else {
        setUserIsLooking(Boolean(data.looking_for_team));
      }
    };

    fetchPlayers();
    fetchUserStatus();
  }, [session]);

  const handlePlayerClick = (player: Player) => {
    setSelectedPlayer(player);
  };

  const toggleLookingForTeam = async () => {
    if (!session?.user?.id) {
      alert("Please sign in first");
      return;
    }

    setLoadingToggle(true);
    const newVal = !userIsLooking;

    try {
      const { error } = await supabase.from("users").upsert(
        {
          discord_id: String(session.user.id),
          name: session.user.name || "Unknown",
          email: session.user.email || "",
          looking_for_team: newVal,
        },
        { onConflict: "discord_id" }
      );

      if (error) {
        console.error("Error toggling looking_for_team:", error.message);
        alert("Failed to update status");
        setLoadingToggle(false);
        return;
      }

      setUserIsLooking(newVal);

      // Refresh players list
      const { data, error: fetchError } = await supabase
        .from("users")
        .select(
          "discord_id, name, faceit_nickname, faceit_elo, faceit_level, about_me"
        )
        .eq("looking_for_team", true);

      if (fetchError) {
        console.error("Error fetching players:", fetchError);
      } else {
        setPlayers((data as Player[]) || []);
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Something went wrong");
    } finally {
      setLoadingToggle(false);
    }
  };

  return (
    <main className="max-w-[1200px] px-1 m-auto">
      <div className="">
        <h1 className="font-bold text-3xl mb-3">Maybe Your New Teammates</h1>
        {session?.user && (
          <button
            onClick={toggleLookingForTeam}
            disabled={loadingToggle}
            className={`py-2 px-4 rounded-lg font-semibold text-white ${
              userIsLooking
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            } ${loadingToggle ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {loadingToggle
              ? "Updating..."
              : userIsLooking
              ? "looking for a team"
              : "OFF - let people know you are available"}
          </button>
        )}
      </div>
      <section className="grid grid-cols-1">
        <ul className="flex justify-between px-20">
          <li>Name</li>
          <li>Faceit Elo</li>
          <li>Level</li>
        </ul>
        <section className="">
          {players.map((player) => (
            <div key={player.discord_id} className="mb-4 cursor-pointer hover:bg-gray-100 rounded-lg py-2 flex items-center gap-3">
              <img
                src={session?.user?.image ?? "/default-avatar.png"}
                alt=""
                className="w-10 h-10 rounded-full ml-7"
              />
              <ul className="flex justify-between w-full pr-20" onClick={() => handlePlayerClick(player)}>
                <li>{player.name}</li>
                <li>{player.faceit_elo}</li>
                <li>{player.faceit_level}</li>
              </ul>
            </div>
          ))}
        </section>
      </section>

      {selectedPlayer && (
        <PlayerModal
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
        />
      )}
    </main>
  );
};

export default PlayersList;
