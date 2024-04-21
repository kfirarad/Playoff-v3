import SingleFixture from "./SingleFixture";
import { groupBy } from "../utils";
import { completedRounds } from "../constans";

export default function Fixtures({ fixtures, applyFn, showGoals }) {
  const rounds = groupBy(fixtures, "round");

  return Object.keys(rounds)
    .filter(
      (roundNumber) => !completedRounds.includes(parseInt(roundNumber, 10))
    )
    .map((roundNumber) => (
      <div key={`round${roundNumber}`}>
        <h3>מחזור {roundNumber}</h3>
        <table>
          <thead>
            <tr>
              <th>1</th>
              {showGoals && <th className={`goals-col`}></th>}
              <th className={`tie-col`}>x</th>
              {showGoals && <th className={`goals-col`}></th>}
              <th>2</th>
            </tr>
          </thead>
          <tbody>
            {rounds[roundNumber].map((fixture) => (
              <SingleFixture
                key={`${fixture.home}/${fixture.away}`}
                fixture={fixture}
                applyFn={applyFn}
                index={`${fixture.home}/${fixture.away}`}
                showRoundNumber={false}
                showGoals={showGoals}
              />
            ))}
          </tbody>
        </table>
      </div>
    ));
}
