interface Player {
  name: string;
  discord_id?: string;
  faceit_nickname?: string;
  faceit_elo?: number;
  faceit_level?: number;
  about_me?: string | null;
}

const PlayerModal = ({ player, onClose }: { player: Player; onClose: () => void }) => {

  
  return (
    <div className="modal">
      <div className="modal-content">
        <button onClick={onClose}>Close</button>
        <h2>{player.name}</h2>
        <p>Faceit Nickname: {player.faceit_nickname}</p>
        <p>Faceit Elo: {player.faceit_elo}</p>
        <p>Level: {player.faceit_level}</p>
        <p>About Me: {player.about_me || "No information provided"}</p>
      </div>
    </div>
  );
};
export default PlayerModal;