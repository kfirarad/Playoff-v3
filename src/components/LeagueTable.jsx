import TableRow from "./TableRow";
import Sticky from "react-stickynode";

export default function LeagueTable({ teams, showGoals, chancePrecentile }) {
  return (
    <div className="table">
      <div className="row head-row">
        <div className="small-col">מקום</div>
        <div>קבוצה</div>
        <div className="small-col">משחקים</div>
        {showGoals && <div className="small-col">הפרש</div>}
        <div className="small-col">נקודות</div>
        <div className="small-col">סיכוי השרדות</div>
      </div>
      {/* <Sticky enabled={true} top={0} bottomBoundary={1200}>
        <div className="top-4">
          {teams.slice(2).map((t, i) => (
            <TableRow
              key={t.key}
              team={t}
              showGoals={showGoals}
              idx={i}
              chance={chancePrecentile.get(t.key) || null}
            />
          ))}
        </div>
      </Sticky> */}
      <div>
        {teams.map((t, i) => (
          <TableRow
            key={t.key}
            team={t}
            showGoals={showGoals}
            idx={i + 4}
            chance={chancePrecentile.get(t.key) || null}
          />
        ))}
      </div>
    </div>
  );
}
