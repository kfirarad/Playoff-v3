import { BASE_POSITION } from "../constans";
export default function TableRow({
  team = {},
  showGoals = false,
  idx,
  chance,
}) {
  return (
    <div className={"row"} key={team.key}>
      <div className="col small-col">{BASE_POSITION + idx}</div>
      <div className="col">{team.displayName}</div>
      <div className={`small-col col ${team.games === 33 ? "done" : ""} `}>
        {team.games}
      </div>
      {showGoals && (
        <div className="col small-col gf">{team.goalDiffrence}</div>
      )}
      <div className="col small-col">{team.points}</div>
      <div className="col small-col">{chance ? `${chance}%` : "..."}</div>
    </div>
  );
}
