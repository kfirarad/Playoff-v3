import { randomIntFromInterval, calcuateTeamsPointes } from "./utils";
import { initialTeams } from "./constans";

window.currentCalcuation = new Map();

function getCalc(initialFixtures, poolSize) {
  return new Promise((resolve, reject) => {
    const teams = initialTeams.map((t) => t.key);
    const m = window.currentCalcuation;
    let i = 0;
    for (i = 0; i < poolSize; i++) {
      const fixtures = initialFixtures.map((f) => {
        return f.result
          ? { ...f }
          : { ...f, result: randomIntFromInterval(1, 3) };
      });
      const result = calcuateTeamsPointes(initialTeams, fixtures);
      const survived = result.slice(-2).map((t) => t.key);
      const mini = fixtures.reduce((a, v) => a.concat(v.result), "");
      m.set(mini, survived);
    }

    const p = new Map(teams.map((t) => [t, 0]));
    Array.from(m.values()).forEach(([teamA, teamB]) => {
      p.set(teamA, p.get(teamA) + 1);
      p.set(teamB, p.get(teamB) + 1);
    });

    const precentile = teams.reduce((ac, t) => {
      ac.set(t, 100 - Math.floor((p.get(t) / m.size) * 100));
      return ac;
    }, new Map());

    resolve({
      poolSize: m.size,
      promotionsCount: p,
      precentile,
    });
  });
}

export { getCalc };
