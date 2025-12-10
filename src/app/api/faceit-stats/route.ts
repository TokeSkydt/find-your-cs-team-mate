import axios from "axios";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const nickname = searchParams.get("nickname");
  if (!nickname) {
    return NextResponse.json({ error: "nickname query param is required" }, { status: 400 });
  }

  const FACEIT_KEY = process.env.FACEIT_SERVER_ID;
  if (!FACEIT_KEY) {
    console.error("FACEIT_SERVER_ID missing");
    return NextResponse.json({ error: "FACEIT_SERVER_ID not set on server" }, { status: 500 });
  }

  try {
    const playerResp = await axios.get(
      `https://open.faceit.com/data/v4/players?nickname=${encodeURIComponent(nickname)}`,
      { headers: { Authorization: `Bearer ${FACEIT_KEY}` } }
    );
    const player = playerResp.data || null;
    if (!player || !player.player_id) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    // Return the full player object (Faceit already includes games.cs2)
    return NextResponse.json(player);
  } catch (err) {
    console.error("Faceit API error:", err);
    return NextResponse.json({ error: "Failed to fetch Faceit data" }, { status: 502 });
  }
}