import { useEffect, useRef } from "react";
import { resultsTypes, initialTeams } from "../constans";
import { getTeamDisplayName } from "../utils";
const teams = initialTeams;

export default function SingleFixture({
  fixture,
  index,
  applyFn,
  showRoundNumber = true,
  showGoals
}) {
  const homeGoalsInput = useRef(fixture.homeGoals);
  const awayGoalsInput = useRef(fixture.awayGoals);

  const { homeGoals, awayGoals } = fixture;

  useEffect(() => {
    if (showGoals) {
      homeGoalsInput.current.value = homeGoals;
      awayGoalsInput.current.value = awayGoals;
    }
  }, [homeGoals, awayGoals, showGoals]);

  const handleChange = (e) => {
    e.stopPropagation();
    const newHomeGoals =
      homeGoalsInput.current.valueAsNumber &&
      homeGoalsInput.current.checkValidity()
        ? homeGoalsInput.current.valueAsNumber
        : 0;
    const newAwayGoals =
      awayGoalsInput.current.valueAsNumber &&
      awayGoalsInput.current.checkValidity()
        ? awayGoalsInput.current.valueAsNumber
        : 0;
    let resultType;
    if (newHomeGoals > newAwayGoals) {
      resultType = resultsTypes.HOME;
    } else if (newHomeGoals < newAwayGoals) {
      resultType = resultsTypes.AWAY;
    } else {
      resultType = resultsTypes.TIE;
    }
    applyFn(index, resultType, newHomeGoals, newAwayGoals);
  };

  const handleClick = (result) => {
    const homeGoals = result === resultsTypes.HOME ? 1 : 0;
    const awayGoals = result === resultsTypes.AWAY ? 1 : 0;

    applyFn(index, result, homeGoals, awayGoals);
  };

  return (
    <tr
      key={index}
      className={`round-${fixture.round} team-${fixture.home} team-${fixture.away}`}
    >
      {showRoundNumber ? <td>{fixture.round}</td> : ""}
      <td className={`${fixture.result === resultsTypes.HOME ? "bold" : ""}`}>
        <div>
          <div
            onClick={() => {
              handleClick(resultsTypes.HOME);
            }}
          >
            {getTeamDisplayName(teams, fixture.home)}
          </div>
        </div>
      </td>
      {showGoals && (
        <td className="goals-col">
          <div>
            <input
              onClick={(e) => {
                e.target.select();
              }}
              onChange={handleChange}
              type="number"
              min="0"
              size="1"
              max="13"
              ref={homeGoalsInput}
              disabled={fixture.lock}
            />
          </div>
        </td>
      )}
      <td
        className={`tie-col ${
          fixture.result === resultsTypes.TIE ? "bold" : ""
        }`}
        onClick={() => {
          handleClick(resultsTypes.TIE);
        }}
      >
        X
      </td>
      {showGoals && (
        <td className="goals-col">
          <div>
            <input
              onClick={(e) => {
                e.target.select();
              }}
              onChange={handleChange}
              type="number"
              min="0"
              size="1"
              max="13"
              ref={awayGoalsInput}
              disabled={fixture.lock}
            />
          </div>
        </td>
      )}
      <td className={`${fixture.result === resultsTypes.AWAY ? "bold" : ""}`}>
        <div>
          <div
            onClick={() => {
              handleClick(resultsTypes.AWAY);
            }}
          >
            {getTeamDisplayName(teams, fixture.away)}
          </div>
        </div>
      </td>
    </tr>
  );
}
