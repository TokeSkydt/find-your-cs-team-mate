import axios from "axios";

export const fetchFaceitStats = async (nickname: string) => {
  try {
    const response = await axios.get(`/api/faceit-stats?nickname=${encodeURIComponent(nickname)}`);
    // API returns { nickname, player_id, country, cs2, raw }
    return response.data;
  } catch (error) {
    console.error("Error fetching Faceit stats from server route:", error);
    throw new Error("Failed to fetch Faceit stats");
  }
};

